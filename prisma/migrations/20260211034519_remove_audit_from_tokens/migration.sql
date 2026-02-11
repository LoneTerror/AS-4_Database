/*
  Warnings:

  - You are about to drop the column `created_by` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_created_by_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_updated_by_fkey";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "created_by",
DROP COLUMN "updated_by";
