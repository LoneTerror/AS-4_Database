import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { v4 as uuidv4 } from 'uuid';

// 1. Setup Database Adapter
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // --- 1. CLEANUP (Delete in dependency order) ---
  await prisma.transaction.deleteMany();
  await prisma.rewardHistory.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.employeeRole.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.department.deleteMany();
  await prisma.departmentType.deleteMany();
  await prisma.role.deleteMany();
  await prisma.statusMaster.deleteMany();
  await prisma.transactionType.deleteMany();
  await prisma.rewardCatalog.deleteMany();
  await prisma.rewardCategory.deleteMany();

  // --- 2. MASTER DATA (System Generated - No Creator) ---
  
  console.log('... Seeding StatusMaster');
  const statuses = await prisma.statusMaster.createManyAndReturn({
    data: [
      { statusCode: 'ACTIVE', statusName: 'Active', entityType: 'GENERAL' },
      { statusCode: 'INACTIVE', statusName: 'Inactive', entityType: 'GENERAL' },
      { statusCode: 'PENDING', statusName: 'Pending', entityType: 'TRANSACTION' },
      { statusCode: 'APPROVED', statusName: 'Approved', entityType: 'TRANSACTION' },
      { statusCode: 'REJECTED', statusName: 'Rejected', entityType: 'TRANSACTION' },
    ],
  });
  const activeStatus = statuses.find(s => s.statusCode === 'ACTIVE')!;

  console.log('... Seeding Roles');
  await prisma.role.createMany({
    data: [
      { roleName: 'Super Admin', roleCode: 'SUPER_ADMIN', description: 'Full system access' },
      { roleName: 'HR Manager', roleCode: 'HR_MANAGER', description: 'Manage rewards and employees' },
      { roleName: 'Department Head', roleCode: 'DEPT_HEAD', description: 'Approve department budgets' },
      { roleName: 'Employee', roleCode: 'EMPLOYEE', description: 'Standard user access' },
      { roleName: 'Auditor', roleCode: 'AUDITOR', description: 'Read-only access to logs' },
    ],
  });

  console.log('... Seeding DepartmentTypes');
  const deptTypes = await prisma.departmentType.createManyAndReturn({
    data: [
      { typeName: 'Core Operations', typeCode: 'CORE' },
      { typeName: 'Support', typeCode: 'SUPPORT' },
      { typeName: 'Management', typeCode: 'MGMT' },
      { typeName: 'Contractual', typeCode: 'CONTRACT' },
      { typeName: 'Research & Development', typeCode: 'R&D' },
    ],
  });

  console.log('... Seeding Departments');
  const departments = await prisma.department.createManyAndReturn({
    data: [
      { departmentName: 'Engineering', departmentCode: 'ENG', departmentTypeId: deptTypes[0].id },
      { departmentName: 'Human Resources', departmentCode: 'HR', departmentTypeId: deptTypes[1].id },
      { departmentName: 'Sales', departmentCode: 'SALES', departmentTypeId: deptTypes[0].id },
      { departmentName: 'Marketing', departmentCode: 'MKT', departmentTypeId: deptTypes[1].id },
      { departmentName: 'Finance', departmentCode: 'FIN', departmentTypeId: deptTypes[1].id },
    ],
  });

  console.log('... Seeding Designations');
  const designations = await prisma.designation.createManyAndReturn({
    data: [
      { designationName: 'Chief Executive Officer', designationCode: 'CEO', level: 1 },
      { designationName: 'Engineering Manager', designationCode: 'EM', level: 3 },
      { designationName: 'Senior Software Engineer', designationCode: 'SSE', level: 5 },
      { designationName: 'HR Specialist', designationCode: 'HRS', level: 6 },
      { designationName: 'Sales Associate', designationCode: 'SA', level: 7 },
    ],
  });

  console.log('... Seeding TransactionTypes');
  await prisma.transactionType.createMany({
    data: [
      { typeName: 'Reward Credit', typeCode: 'CREDIT_REWARD', isCredit: true },
      { typeName: 'Redemption Debit', typeCode: 'DEBIT_REDEEM', isCredit: false },
      { typeName: 'Monthly Allowance', typeCode: 'CREDIT_MONTHLY', isCredit: true },
      { typeName: 'Expire Points', typeCode: 'DEBIT_EXPIRE', isCredit: false },
      { typeName: 'Bonus Adjustment', typeCode: 'CREDIT_BONUS', isCredit: true },
    ],
  });

  console.log('... Seeding RewardCategories');
  const rewardCats = await prisma.rewardCategory.createManyAndReturn({
    data: [
      { categoryName: 'Performance', categoryCode: 'PERF', isActive: true },
      { categoryName: 'Culture & Values', categoryCode: 'CULTURE', isActive: true },
      { categoryName: 'Innovation', categoryCode: 'INNO', isActive: true },
      { categoryName: 'Long Service', categoryCode: 'SERVICE', isActive: true },
      { categoryName: 'Learning', categoryCode: 'LEARN', isActive: true },
    ],
  });

  console.log('... Seeding RewardCatalog');
  await prisma.rewardCatalog.createMany({
    data: [
      { rewardName: 'Star Performer', rewardCode: 'STAR', categoryId: rewardCats[0].id, defaultPoints: 500, minPoints: 100, maxPoints: 1000 },
      { rewardName: 'Team Player', rewardCode: 'TEAM', categoryId: rewardCats[1].id, defaultPoints: 200, minPoints: 50, maxPoints: 500 },
      { rewardName: 'Bug Basher', rewardCode: 'BUG', categoryId: rewardCats[0].id, defaultPoints: 100, minPoints: 50, maxPoints: 200 },
      { rewardName: 'Innovation Idea', rewardCode: 'IDEA', categoryId: rewardCats[2].id, defaultPoints: 1000, minPoints: 500, maxPoints: 5000 },
      { rewardName: '5 Year Anniversary', rewardCode: '5YEAR', categoryId: rewardCats[3].id, defaultPoints: 5000, minPoints: 5000, maxPoints: 5000 },
    ],
  });

  // --- 3. EMPLOYEES & WALLETS ---
  console.log('... Seeding Employees');

  const PASSWORD_HASH = '$2b$10$EpIc.k6.y7.z8.x9.A0.B1.C2.D3.E4.F5.G6.H7.I8.J9'; // Placeholder hash

  // PRE-GENERATE IDs to handle circular "created by" logic nicely
  const ceoId = uuidv4();
  const engManagerId = uuidv4();
  const hrSpecId = uuidv4();
  const devId = uuidv4();
  const salesId = uuidv4();

  // 1. The CEO (Self-Created for Audit purposes)
  await prisma.employee.create({
    data: {
      id: ceoId,
      username: 'ceo_jane',
      email: 'jane.doe@company.com',
      passwordHash: PASSWORD_HASH,
      designationId: designations[0].id,
      departmentId: departments[2].id, // Management
      statusId: activeStatus.id,
      dateOfJoining: new Date('2020-01-01'),
      // createdBy: null (System created)
      wallet: {
        create: { 
          availablePoints: 10000, 
          totalEarnedPoints: 10000,
          createdBy: ceoId, // CEO owns/created their own initial wallet state
          updatedBy: ceoId
        }
      }
    }
  });

  // 2. Engineering Manager (Created by CEO)
  await prisma.employee.create({
    data: {
      id: engManagerId,
      username: 'tech_lead_bob',
      email: 'bob.smith@company.com',
      passwordHash: PASSWORD_HASH,
      designationId: designations[1].id,
      departmentId: departments[0].id,
      managerId: ceoId,
      statusId: activeStatus.id,
      dateOfJoining: new Date('2021-03-15'),
      createdBy: ceoId,
      updatedBy: ceoId,
      wallet: {
        create: { 
          availablePoints: 5000, 
          totalEarnedPoints: 5000, 
          createdBy: ceoId, // CEO issued this wallet
          updatedBy: ceoId
        }
      }
    }
  });

  // 3. HR Specialist (Created by CEO)
  await prisma.employee.create({
    data: {
      id: hrSpecId,
      username: 'hr_alice',
      email: 'alice.wonder@company.com',
      passwordHash: PASSWORD_HASH,
      designationId: designations[3].id,
      departmentId: departments[1].id,
      managerId: ceoId,
      statusId: activeStatus.id,
      dateOfJoining: new Date('2022-06-01'),
      createdBy: ceoId,
      updatedBy: ceoId,
      wallet: {
        create: { 
          availablePoints: 3000, 
          totalEarnedPoints: 3000, 
          createdBy: ceoId,
          updatedBy: ceoId
        }
      }
    }
  });

  // 4. Senior Developer (Created by Eng Manager)
  await prisma.employee.create({
    data: {
      id: devId,
      username: 'dev_charlie',
      email: 'charlie.code@company.com',
      passwordHash: PASSWORD_HASH,
      designationId: designations[2].id,
      departmentId: departments[0].id,
      managerId: engManagerId,
      statusId: activeStatus.id,
      dateOfJoining: new Date('2023-01-10'),
      createdBy: engManagerId,
      updatedBy: engManagerId,
      wallet: {
        create: { 
          availablePoints: 1200, 
          totalEarnedPoints: 1500, 
          createdBy: engManagerId,
          updatedBy: engManagerId
        }
      }
    }
  });

  // 5. Sales Associate (Created by CEO)
  await prisma.employee.create({
    data: {
      id: salesId,
      username: 'sales_dave',
      email: 'dave.sell@company.com',
      passwordHash: PASSWORD_HASH,
      designationId: designations[4].id,
      departmentId: departments[2].id,
      managerId: ceoId,
      statusId: activeStatus.id,
      dateOfJoining: new Date('2023-11-05'),
      createdBy: ceoId,
      updatedBy: ceoId,
      wallet: {
        create: { 
          availablePoints: 800, 
          totalEarnedPoints: 800, 
          createdBy: ceoId,
          updatedBy: ceoId
        }
      }
    }
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });