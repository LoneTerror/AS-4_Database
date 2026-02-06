import { prisma } from '../lib/prisma.js'
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('Starting seed...');

  const adminId = uuidv4();
  const statusId = uuidv4();
  const designationId = uuidv4();
  const deptTypeId = uuidv4();
  const deptId = uuidv4();

  // List of constraints involved in the circular dependency
  // We must make these DEFERRABLE to allow the "Chicken and Egg" insertion
  const constraints = [
    { table: 'employees', name: 'employees_designation_id_fkey' },
    { table: 'employees', name: 'employees_department_id_fkey' },
    { table: 'employees', name: 'employees_status_id_fkey' },
    { table: 'employees', name: 'employees_created_by_fkey' },
    { table: 'employees', name: 'employees_updated_by_fkey' },
    { table: 'designations', name: 'designations_created_by_fkey' },
    { table: 'designations', name: 'designations_updated_by_fkey' },
    { table: 'departments', name: 'departments_created_by_fkey' },
    { table: 'departments', name: 'departments_updated_by_fkey' },
    { table: 'department_types', name: 'department_types_created_by_fkey' },
    { table: 'status_master', name: 'status_master_created_by_fkey' },
    { table: 'wallets', name: 'wallets_created_by_fkey' }
  ];

  try {
    // STEP 1: Alter constraints to be DEFERRABLE
    // This allows us to say "Check these at the end of the transaction, not now"
    console.log('Adjusting constraints for circular dependency...');
    for (const c of constraints) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "${c.table}" ALTER CONSTRAINT "${c.name}" DEFERRABLE INITIALLY DEFERRED`);
      } catch (e) {
        // Ignore errors if constraint doesn't exist (e.g. first run vs re-run)
        console.warn(`Warning: Could not alter constraint ${c.name}. It might not exist or is already deferred.`);
      }
    }

    // STEP 2: Perform the Circular Insert in a Single Transaction
    await prisma.$transaction(async (tx) => {
      console.log('Inserting linked records...');
      
      // A. Insert Admin Employee (Points to Status/Desig/Dept that don't exist yet)
      // Because constraints are DEFERRED, this will NOT fail immediately.
      await tx.$executeRawUnsafe(`
        INSERT INTO employees (
            employee_id, username, email, password_hash, 
            date_of_joining, designation_id, department_id, status_id,
            created_at, updated_at, created_by, updated_by
        )
        VALUES (
            '${adminId}', 'sysadmin', 'admin@system.com', 'hash', 
            NOW(), '${designationId}', '${deptId}', '${statusId}',
            NOW(), NOW(), '${adminId}', '${adminId}'
        )
      `);

      // B. Insert Lookup Data (Points back to the Admin Employee)
      // These tables also have 'created_by' pointing to adminId
      
      // Status
      await tx.$executeRawUnsafe(`
        INSERT INTO status_master (status_id, status_code, status_name, entity_type, created_at, created_by, updated_at, updated_by)
        VALUES ('${statusId}', 'ACTIVE', 'Active', 'EMPLOYEE', NOW(), '${adminId}', NOW(), '${adminId}')
      `);

      // Designation
      await tx.$executeRawUnsafe(`
        INSERT INTO designations (designation_id, designation_name, designation_code, level, created_at, created_by, updated_at, updated_by)
        VALUES ('${designationId}', 'System Administrator', 'SYS_ADMIN', 0, NOW(), '${adminId}', NOW(), '${adminId}')
      `);

      // Department Type
      await tx.$executeRawUnsafe(`
        INSERT INTO department_types (department_type_id, type_name, type_code, created_at, created_by, updated_at, updated_by)
        VALUES ('${deptTypeId}', 'Administration', 'ADMIN_DEPT', NOW(), '${adminId}', NOW(), '${adminId}')
      `);

      // Department
      await tx.$executeRawUnsafe(`
        INSERT INTO departments (department_id, department_name, department_code, department_type_id, created_at, created_by, updated_at, updated_by)
        VALUES ('${deptId}', 'IT Infrastructure', 'IT_INFRA', '${deptTypeId}', NOW(), '${adminId}', NOW(), '${adminId}')
      `);

      // C. Create Wallet
      await tx.wallet.create({
        data: {
          employeeId: adminId,
          availablePoints: 0,
          createdBy: adminId,
          updatedBy: adminId,
        }
      });
    });

    console.log('Seed completed successfully.');

  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());