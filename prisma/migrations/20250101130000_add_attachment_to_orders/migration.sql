-- AlterTable
ALTER TABLE "orders" ADD COLUMN "attachment_id" TEXT;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

