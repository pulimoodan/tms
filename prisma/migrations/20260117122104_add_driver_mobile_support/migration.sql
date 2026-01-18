-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "fcm_token" TEXT,
ADD COLUMN     "device_id" TEXT,
ADD COLUMN     "last_location_lat" DOUBLE PRECISION,
ADD COLUMN     "last_location_lng" DOUBLE PRECISION,
ADD COLUMN     "last_location_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "driver_locations" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "order_id" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "driver_locations_driver_id_timestamp_idx" ON "driver_locations"("driver_id", "timestamp");

-- CreateIndex
CREATE INDEX "driver_locations_order_id_idx" ON "driver_locations"("order_id");

-- AddForeignKey
ALTER TABLE "driver_locations" ADD CONSTRAINT "driver_locations_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_locations" ADD CONSTRAINT "driver_locations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

