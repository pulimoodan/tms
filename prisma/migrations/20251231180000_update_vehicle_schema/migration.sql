-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Vehicle', 'Attachment', 'Equipment');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('TractorHead', 'FourXTwoTractorHead', 'CraneMountedTruck', 'LightDutyTruck', 'BoomTruck', 'DieselTanker', 'MiniVan', 'Pickup', 'SUV', 'FlatBedTrailer', 'LowBedTrailer', 'DryBox', 'CurtainSide', 'HydraulicWinchWithBox', 'Forklift', 'BackhoLoader', 'RoughTerrainCrane', 'SkidLoader');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "name" TEXT,
ADD COLUMN IF NOT EXISTS "type" "VehicleType",
ADD COLUMN IF NOT EXISTS "category" "VehicleCategory",
ADD COLUMN IF NOT EXISTS "asset" TEXT,
ADD COLUMN IF NOT EXISTS "door_no" TEXT,
ADD COLUMN IF NOT EXISTS "sequence_no" TEXT;

-- AlterTable
ALTER TABLE "contract_routes" ADD COLUMN IF NOT EXISTS "vehicle_category" "VehicleCategory";

-- DropForeignKey
ALTER TABLE "contract_routes" DROP CONSTRAINT IF EXISTS "contract_routes_vehicle_type_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT IF EXISTS "vehicles_vehicle_type_id_fkey";

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "vehicle_type_id";

-- AlterTable
ALTER TABLE "contract_routes" DROP COLUMN IF EXISTS "vehicle_type_id";

-- DropTable
DROP TABLE IF EXISTS "vehicle_types" CASCADE;

