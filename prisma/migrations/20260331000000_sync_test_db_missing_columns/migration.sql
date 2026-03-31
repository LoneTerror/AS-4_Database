-- ============================================================
-- Migration: sync_test_db_missing_columns
-- Adds columns present in rnr_db but missing from test_db.
--
-- Missing in test_db vs rnr_db:
--   1. designations.description     (TEXT, nullable)
--   2. designations.is_active       (BOOLEAN NOT NULL DEFAULT true)
--   3. designations_is_active_idx   (index on is_active)
--   4. route_permissions.title      (VARCHAR(200), nullable)
-- ============================================================

-- 1 & 2. Add missing columns to designations
ALTER TABLE "designations"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "is_active"   BOOLEAN NOT NULL DEFAULT true;

-- 3. Add missing index on designations.is_active
CREATE INDEX IF NOT EXISTS "designations_is_active_idx" ON "designations"("is_active");

-- 4. Add missing title column to route_permissions
ALTER TABLE "route_permissions"
  ADD COLUMN IF NOT EXISTS "title" VARCHAR(200);