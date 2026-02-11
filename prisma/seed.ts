import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // --- 1. CLEANUP ---
  try {
    await prisma.auditLog.deleteMany();
    await prisma.review.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.rewardHistory.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.employeeRole.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.designation.deleteMany();
    await prisma.department.deleteMany();
    await prisma.departmentType.deleteMany();
    await prisma.role.deleteMany();
    await prisma.statusMaster.deleteMany();
    await prisma.transactionType.deleteMany();
    await prisma.rewardCatalog.deleteMany();
    await prisma.rewardCategory.deleteMany();
  } catch (err) {
    console.log('⚠️ Cleanup warning (safe to ignore on fresh DB)');
  }

  // --- 2. MASTER DATA ---
  
  // Statuses
  const activeStatusId = '990e8400-e29b-41d4-a716-446655440000';
  const approvedStatusId = '880e8400-e29b-41d4-a716-446655440003';

  await prisma.statusMaster.createMany({
    data: [
      { id: activeStatusId, statusCode: 'ACTIVE', statusName: 'Active', entityType: 'GENERAL' },
      { statusCode: 'INACTIVE', statusName: 'Inactive', entityType: 'GENERAL' },
      { statusCode: 'PENDING', statusName: 'Pending', entityType: 'TRANSACTION' },
      { id: approvedStatusId, statusCode: 'APPROVED', statusName: 'Approved', entityType: 'TRANSACTION' },
      { statusCode: 'REJECTED', statusName: 'Rejected', entityType: 'TRANSACTION' },
    ],
  });

  // Roles
  await prisma.role.createMany({
    data: [
      { roleName: 'Super Admin', roleCode: 'SUPER_ADMIN', description: 'Full system access' },
      { roleName: 'HR Admin', roleCode: 'HR_ADMIN', description: 'Employee management' },
      { roleName: 'Manager', roleCode: 'MANAGER', description: 'Team management' },
      { roleName: 'Employee', roleCode: 'EMPLOYEE', description: 'Self-service' },
      { roleName: 'Auditor', roleCode: 'AUDITOR', description: 'Audit access' },
    ],
  });
  
  // Fetch roles back to get their IDs
  const roles = await prisma.role.findMany();
  const getRoleId = (code: string) => roles.find(r => r.roleCode === code)!.id;

  // Departments
  const techType = await prisma.departmentType.create({ data: { typeName: 'Technology', typeCode: 'TECH' } });
  const mgmtType = await prisma.departmentType.create({ data: { typeName: 'Management', typeCode: 'MGMT' } });

  const engDeptId = '770e8400-e29b-41d4-a716-446655440000';
  const hrDeptId = '330e8400-e29b-41d4-a716-446655440000';

  await prisma.department.createMany({
    data: [
      { id: engDeptId, departmentName: 'Engineering', departmentCode: 'ENG', departmentTypeId: techType.id },
      { id: hrDeptId, departmentName: 'Human Resources', departmentCode: 'HR', departmentTypeId: mgmtType.id }
    ]
  });

  // Designations
  const srDevId = '660e8400-e29b-41d4-a716-446655440000';
  const mgrDesigId = '660e8400-e29b-41d4-a716-446655440001';
  const adminDesigId = '660e8400-e29b-41d4-a716-446655440002';

  await prisma.designation.createMany({
    data: [
      { id: srDevId, designationName: 'Senior Developer', designationCode: 'SR_DEV', level: 3 },
      { id: mgrDesigId, designationName: 'Engineering Manager', designationCode: 'ENG_MGR', level: 2 },
      { id: adminDesigId, designationName: 'System Administrator', designationCode: 'SYS_ADMIN', level: 0 }
    ]
  });

  // Transaction Types
  const bonusTypeId = '660e8400-e29b-41d4-a716-446655440001';
  await prisma.transactionType.create({ data: { id: bonusTypeId, typeName: 'Performance Bonus', typeCode: 'BONUS', isCredit: true } });
  
  // Reward Catalog
  const giftCardCatId = 'cc0e8400-e29b-41d4-a716-446655440007';
  await prisma.rewardCategory.create({ data: { id: giftCardCatId, categoryName: 'Gift Cards', categoryCode: 'GIFT_CARDS', isActive: true } });

  const amzRewardId = 'bb0e8400-e29b-41d4-a716-446655440006';
  await prisma.rewardCatalog.create({
    data: {
      id: amzRewardId,
      rewardName: 'Amazon Gift Card $50',
      rewardCode: 'AMZ_50',
      description: 'Redeem for a $50 Amazon gift card',
      defaultPoints: 500,
      minPoints: 400,
      maxPoints: 600,
      categoryId: giftCardCatId,
      isActive: true
    }
  });

  // --- 3. EMPLOYEES ---
  const passwordHash = await bcrypt.hash('SecureP@ssw0rd', 10);
  
  const adminId = '110e8400-e29b-41d4-a716-446655440000';
  const janeId = '880e8400-e29b-41d4-a716-446655440000';
  const johnId = '550e8400-e29b-41d4-a716-446655440000';
  const johnWalletId = 'aa0e8400-e29b-41d4-a716-446655440000';

  // Admin
  await prisma.employee.create({
    data: {
      id: adminId,
      username: 'admin.user',
      email: 'admin@company.com',
      passwordHash,
      designationId: adminDesigId,
      departmentId: hrDeptId,
      statusId: activeStatusId,
      dateOfJoining: new Date('2020-01-01'),
      createdBy: adminId, updatedBy: adminId,
      wallet: { create: { availablePoints: 999999, totalEarnedPoints: 999999, createdBy: adminId, updatedBy: adminId } }
    }
  });

  // Manager (Jane)
  await prisma.employee.create({
    data: {
      id: janeId,
      username: 'jane.smith',
      email: 'jane.smith@company.com',
      passwordHash,
      designationId: mgrDesigId,
      departmentId: engDeptId,
      statusId: activeStatusId,
      dateOfJoining: new Date('2022-01-01'),
      createdBy: adminId, updatedBy: adminId,
      wallet: { create: { availablePoints: 5000, totalEarnedPoints: 5000, createdBy: adminId, updatedBy: adminId } }
    }
  });

  // Employee (John)
  await prisma.employee.create({
    data: {
      id: johnId,
      username: 'john.doe',
      email: 'john.doe@company.com',
      passwordHash,
      designationId: srDevId,
      departmentId: engDeptId,
      managerId: janeId,
      statusId: activeStatusId,
      dateOfJoining: new Date('2024-01-15'),
      createdBy: adminId, updatedBy: adminId,
      wallet: { 
        create: { 
          id: johnWalletId,
          availablePoints: 1500, redeemedPoints: 500, totalEarnedPoints: 2000, version: 5,
          createdBy: adminId, updatedBy: adminId
        } 
      }
    }
  });

  // --- 4. ASSIGN ROLES ---
  await prisma.employeeRole.createMany({
    data: [
      { employeeId: adminId, roleId: getRoleId('SUPER_ADMIN'), assignedBy: adminId, createdBy: adminId, updatedBy: adminId },
      { employeeId: adminId, roleId: getRoleId('HR_ADMIN'), assignedBy: adminId, createdBy: adminId, updatedBy: adminId },
      { employeeId: janeId, roleId: getRoleId('MANAGER'), assignedBy: adminId, createdBy: adminId, updatedBy: adminId },
      { employeeId: johnId, roleId: getRoleId('EMPLOYEE'), assignedBy: adminId, createdBy: adminId, updatedBy: adminId },
    ]
  });

  // --- 5. TRANSACTIONS & REWARDS ---
  
  // Transaction
  await prisma.transaction.create({
    data: {
      id: '770e8400-e29b-41d4-a716-446655440002',
      walletId: johnWalletId,
      transactionTypeId: bonusTypeId,
      amount: 100,
      statusId: approvedStatusId,
      referenceNumber: 'TXN-2026-02-06-001',
      description: 'Performance bonus for Q1 2026',
      transactionAt: new Date('2026-02-06T10:30:00.000Z'),
      createdBy: adminId,
      updatedBy: adminId
    }
  });

  // Reward History
  await prisma.rewardHistory.create({
    data: {
      id: 'dd0e8400-e29b-41d4-a716-446655440008',
      walletId: johnWalletId,
      catalogId: amzRewardId,
      grantedBy: johnId,
      points: 500,
      comment: 'Redeeming for personal use',
      grantedAt: new Date('2026-02-06T10:30:00.000Z'),
      createdBy: johnId,
      updatedBy: johnId
    }
  });

  // --- 6. REVIEWS ---
  await prisma.review.create({
    data: {
      id: '990e8400-e29b-41d4-a716-446655440004',
      reviewerId: janeId,
      receiverId: johnId,
      rating: 4,
      comment: 'Excellent work on the Q1 project.',
      statusId: approvedStatusId,
      reviewAt: new Date('2026-02-06T10:30:00.000Z'),
      createdBy: janeId,
      updatedBy: janeId
    }
  });

  // --- 7. AUDIT LOGS ---
  await prisma.auditLog.create({
    data: {
      id: 'ff0e8400-e29b-41d4-a716-446655440010',
      tableName: 'employees',
      recordId: johnId,
      operationType: 'UPDATE',
      oldValues: { email: 'john.doe.old@company.com' },
      newValues: { email: 'john.doe@company.com' },
      performedBy: adminId,
      performedAt: new Date('2026-02-06T10:30:00.000Z'),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
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