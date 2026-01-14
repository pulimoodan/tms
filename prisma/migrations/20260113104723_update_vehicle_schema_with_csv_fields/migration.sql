-- AlterEnum: Add new enum values
ALTER TYPE "VehicleCategory" ADD VALUE IF NOT EXISTS 'Trailer';
ALTER TYPE "VehicleCategory" ADD VALUE IF NOT EXISTS 'MiniVanFifteenSeater';
ALTER TYPE "VehicleCategory" ADD VALUE IF NOT EXISTS 'OneCarCarrier';

-- AlterTable: Add new columns
ALTER TABLE "vehicles" 
  ADD COLUMN IF NOT EXISTS "capacity" TEXT,
  ADD COLUMN IF NOT EXISTS "tractor_category" TEXT,
  ADD COLUMN IF NOT EXISTS "trailer_category" TEXT,
  ADD COLUMN IF NOT EXISTS "agent" TEXT,
  ADD COLUMN IF NOT EXISTS "built_in_trailer" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "built_in_reefer" BOOLEAN DEFAULT false;

