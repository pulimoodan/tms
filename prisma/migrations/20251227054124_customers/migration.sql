-- CreateTable
CREATE TABLE "customers" (
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
    "created_by_id" TEXT,
    "updated_by_id" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
