-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "title" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "send_attempts" INTEGER NOT NULL DEFAULT 0;