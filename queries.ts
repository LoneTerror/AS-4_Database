/**
 * queries.ts
 * Query file for rnr_db / test_db — matches the driver adapter pattern in lib/prisma.ts
 *
 * Swap DATABASE_URL in .env as usual, then run:
 *   npx tsx .\queries.ts
 */

import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in your environment variables.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const db = new PrismaClient({ adapter });

export async function disconnect() {
  await db.$disconnect();
  await pool.end();
}

// ===========================================================================
// EMPLOYEES
// ===========================================================================

export async function getEmployees() {
  return db.employees.findMany({
    include: {
      departments_employees_department_idTodepartments: true,
      designations_employees_designation_idTodesignations: true,
      status_master_employees_status_idTostatus_master: true,
      employees_employees_manager_idToemployees: {
        select: { employee_id: true, username: true, email: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function getEmployeeById(employeeId: string) {
  return db.employees.findUnique({
    where: { employee_id: employeeId },
    include: {
      departments_employees_department_idTodepartments: {
        include: { department_types: true },
      },
      designations_employees_designation_idTodesignations: true,
      status_master_employees_status_idTostatus_master: true,
      employee_roles_employee_roles_employee_idToemployees: {
        where: { is_active: true },
        include: { roles: true },
      },
      wallets_wallets_employee_idToemployees: true,
    },
  });
}

export async function getDirectReports(managerId: string) {
  return db.employees.findMany({
    where: { manager_id: managerId },
    include: {
      designations_employees_designation_idTodesignations: true,
      status_master_employees_status_idTostatus_master: true,
    },
  });
}

// ===========================================================================
// DEPARTMENTS & DESIGNATIONS
// ===========================================================================

export async function getDepartments() {
  return db.departments.findMany({
    include: { department_types: true },
    orderBy: { department_name: "asc" },
  });
}

export async function getDesignations() {
  return db.designations.findMany({
    where: { is_active: true },
    orderBy: { level: "asc" },
  });
}

// ===========================================================================
// ROLES & PERMISSIONS
// ===========================================================================

export async function getRoles() {
  return db.roles.findMany({
    include: { route_permissions: { where: { is_active: true } } },
  });
}

export async function getEmployeeRoles(employeeId: string) {
  return db.employee_roles.findMany({
    where: { employee_id: employeeId, is_active: true },
    include: {
      roles: { include: { route_permissions: { where: { is_active: true } } } },
    },
  });
}

export async function getRoutePermissions(routeKey: string) {
  return db.route_permissions.findMany({
    where: { route_key: routeKey, is_active: true },
    include: { roles: true },
  });
}

// ===========================================================================
// REVIEWS
// ===========================================================================

export async function getReviewsForEmployee(receiverId: string) {
  return db.reviews.findMany({
    where: { receiver_id: receiverId },
    include: {
      review_category_tags: { include: { review_categories: true } },
      employees_reviews_reviewer_idToemployees: {
        select: { employee_id: true, username: true },
      },
      status_master: true,
    },
    orderBy: { review_at: "desc" },
  });
}

export async function getReviewsByEmployee(reviewerId: string) {
  return db.reviews.findMany({
    where: { reviewer_id: reviewerId },
    include: {
      review_category_tags: { include: { review_categories: true } },
      employees_reviews_receiver_idToemployees: {
        select: { employee_id: true, username: true },
      },
      status_master: true,
    },
    orderBy: { review_at: "desc" },
  });
}

export async function getReviewCategories() {
  return db.review_categories.findMany({
    where: { is_active: true },
    orderBy: { category_name: "asc" },
  });
}

// ===========================================================================
// WALLETS & TRANSACTIONS
// ===========================================================================

export async function getWallet(employeeId: string) {
  return db.wallets.findUnique({
    where: { employee_id: employeeId },
    include: {
      transactions: {
        include: { transaction_types: true, status_master: true },
        orderBy: { transaction_at: "desc" },
        take: 20,
      },
      reward_history: {
        include: { reward_catalog: true },
        orderBy: { granted_at: "desc" },
        take: 20,
      },
    },
  });
}

export async function getTransactions(walletId: string) {
  return db.transactions.findMany({
    where: { wallet_id: walletId },
    include: { transaction_types: true, status_master: true },
    orderBy: { transaction_at: "desc" },
  });
}

export async function getPointsLeaderboard(limit = 10) {
  return db.wallets.findMany({
    orderBy: { total_earned_points: "desc" },
    take: limit,
    include: {
      employees_wallets_employee_idToemployees: {
        select: {
          employee_id: true,
          username: true,
          email: true,
          departments_employees_department_idTodepartments: {
            select: { department_name: true },
          },
          designations_employees_designation_idTodesignations: {
            select: { designation_name: true },
          },
        },
      },
    },
  });
}

// ===========================================================================
// REWARDS
// ===========================================================================

export async function getRewardCatalog(categoryId?: string) {
  return db.reward_catalog.findMany({
    where: {
      is_active: true,
      available_stock: { gt: 0 },
      ...(categoryId ? { category_id: categoryId } : {}),
    },
    include: { reward_categories: true },
    orderBy: { default_points: "asc" },
  });
}

export async function getRewardHistory(walletId: string) {
  return db.reward_history.findMany({
    where: { wallet_id: walletId },
    include: {
      reward_catalog: { include: { reward_categories: true } },
      employees_reward_history_granted_byToemployees: {
        select: { employee_id: true, username: true },
      },
    },
    orderBy: { granted_at: "desc" },
  });
}

// ===========================================================================
// AUDIT LOG
// ===========================================================================

export async function getAuditLog(tableName: string, recordId: string) {
  return db.audit_log.findMany({
    where: { table_name: tableName, record_id: recordId },
    include: {
      employees: { select: { employee_id: true, username: true } },
    },
    orderBy: { performed_at: "desc" },
  });
}

// ===========================================================================
// NOTIFICATIONS
// ===========================================================================

export async function getUnreadNotifications(employeeId: string) {
  return db.notifications.findMany({
    where: { employee_id: employeeId, is_read: false },
    orderBy: { created_at: "desc" },
  });
}

// ===========================================================================
// STATUS MASTER
// ===========================================================================

export async function getStatuses(entityType: string) {
  return db.status_master.findMany({
    where: { entity_type: entityType },
    orderBy: { status_name: "asc" },
  });
}

// ===========================================================================
// MAIN — quick smoke test, remove or expand as needed
// ===========================================================================

async function main() {
  try {
    console.log("🔌 Connected to:", process.env.DATABASE_URL?.split("@")[1]);

    const employees = await getEmployees();
    console.log(`👥 Employees: ${employees.length}`);

    const departments = await getDepartments();
    console.log(`🏢 Departments: ${departments.length}`);

    const roles = await getRoles();
    console.log(`🔑 Roles: ${roles.length}`);

    const leaderboard = await getPointsLeaderboard(5);
    console.log(`🏆 Top 5 leaderboard:`);
    leaderboard.forEach((w, i) => {
      const emp = w.employees_wallets_employee_idToemployees;
      console.log(`  ${i + 1}. ${emp?.username} — ${w.total_earned_points} pts`);
    });
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await disconnect();
  }
}

main();