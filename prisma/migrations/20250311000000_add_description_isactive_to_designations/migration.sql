-- Migration: add description and is_active to designations
ALTER TABLE "designations"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "is_active"   BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "designations_is_active_idx" ON "designations"("is_active");