-- AlterEnum
ALTER TYPE "VehicleType" ADD VALUE 'Accessory';

-- AlterTable
ALTER TABLE "contract_routes" ALTER COLUMN "vehicle_category" SET NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" ALTER COLUMN "plate_number" DROP NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

-- DropEnum
DROP TYPE "VehicleTypeEnum";

-- CreateTable
CREATE TABLE "_OrderAccessories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderAccessories_AB_unique" ON "_OrderAccessories"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderAccessories_B_index" ON "_OrderAccessories"("B");

-- AddForeignKey
ALTER TABLE "_OrderAccessories" ADD CONSTRAINT "_OrderAccessories_A_fkey" FOREIGN KEY ("A") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderAccessories" ADD CONSTRAINT "_OrderAccessories_B_fkey" FOREIGN KEY ("B") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

