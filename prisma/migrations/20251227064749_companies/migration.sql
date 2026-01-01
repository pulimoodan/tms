/*
  Warnings:

  - A unique constraint covering the columns `[company_id,contract_number]` on the table `contracts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,code]` on the table `locations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,order_no]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_id` to the `contract_routes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `credit_terms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `drivers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `vehicle_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "contracts_contract_number_key";

-- DropIndex
DROP INDEX "locations_code_key";

-- DropIndex
DROP INDEX "orders_order_no_key";

-- AlterTable
ALTER TABLE "contract_routes" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "credit_terms" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "role_permissions" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vehicle_types" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "company_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_arabic" TEXT,
    "building_no" TEXT,
    "secondary_no" TEXT,
    "street" TEXT,
    "street_arabic" TEXT,
    "district" TEXT,
    "district_arabic" TEXT,
    "postal_code" INTEGER,
    "country" TEXT,
    "city" TEXT,
    "cr_no" TEXT,
    "cr_expiry_date" TIMESTAMP(3),
    "vat_no" TEXT,
    "national_address" TEXT,
    "cr_certificate" TEXT,
    "vat_certificate" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cr_no_key" ON "companies"("cr_no");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_company_id_contract_number_key" ON "contracts"("company_id", "contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "locations_company_id_code_key" ON "locations"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_company_id_order_no_key" ON "orders"("company_id", "order_no");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_terms" ADD CONSTRAINT "credit_terms_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_routes" ADD CONSTRAINT "contract_routes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
