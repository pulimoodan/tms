-- CreateEnum
CREATE TYPE "DriverPosition" AS ENUM ('HeavyDutyDriver', 'MediumTruckDriver', 'BusDriver');

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "badge_no" TEXT,
ADD COLUMN     "driver_card_expiry" TIMESTAMP(3),
ADD COLUMN     "position" "DriverPosition",
ADD COLUMN     "sponsorship" TEXT,
ALTER COLUMN "mobile" DROP NOT NULL,
ALTER COLUMN "preferred_language" DROP NOT NULL;
