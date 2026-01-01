-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "value" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "attachment_id" TEXT;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_attachment_id_fkey'
    ) THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_attachment_id_fkey" 
        FOREIGN KEY ("attachment_id") REFERENCES "vehicles"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

