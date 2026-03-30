-- ============================================================
-- Migration: sync_schema
-- Syncs the database to match schema.prisma exactly.
-- Fixes 4 discrepancies found between migrations and schema:
--   1. DROP reviews.rating   (column not in schema)
--   2. DROP TABLE points_config   (table not in schema)
--   3. DROP TABLE seasonal_multipliers   (table not in schema)
--   4. Fix notifications email_sent index → composite index
-- ============================================================

-- 1. Drop legacy "rating" column from reviews
--    (was created in 20260210160013 but removed from schema; raw_points was added instead)
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "rating";

-- 2. Drop points_config table (not present in schema.prisma)
DROP TABLE IF EXISTS "points_config";

-- 3. Drop seasonal_multipliers table (not present in schema.prisma)
DROP TABLE IF EXISTS "seasonal_multipliers";

-- 4. Fix notifications index:
--    Old: single-column index on (email_sent)
--    New: composite index on (email_sent, type, send_attempts, created_at) per schema
DROP INDEX IF EXISTS "notifications_email_sent_idx";
CREATE INDEX IF NOT EXISTS "notifications_email_sent_type_send_attempts_created_at_idx"
    ON "notifications"("email_sent", "type", "send_attempts", "created_at");
