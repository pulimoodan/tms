-- CreateTable
CREATE TABLE "cargo_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DECIMAL(65,30),
    "weight_uom" TEXT,
    "volume" DECIMAL(65,30),
    "value" DECIMAL(65,30),
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargo_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cargo_items" ADD CONSTRAINT "cargo_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

