-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "has_duplicated_resources" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "duplication_notes" TEXT;

