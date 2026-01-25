-- Add missing columns to drivers table

-- Add vehicle_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'vehicle_id'
    ) THEN
        ALTER TABLE "drivers" ADD COLUMN "vehicle_id" TEXT;
        
        -- Add unique constraint on vehicle_id if column was just created
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'drivers_vehicle_id_key'
        ) THEN
            ALTER TABLE "drivers" ADD CONSTRAINT "drivers_vehicle_id_key" UNIQUE ("vehicle_id");
        END IF;
        
        -- Add foreign key for vehicle_id if column was just created
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'drivers_vehicle_id_fkey'
        ) THEN
            ALTER TABLE "drivers" 
            ADD CONSTRAINT "drivers_vehicle_id_fkey" 
            FOREIGN KEY ("vehicle_id") 
            REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Add taam_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = 'taam_id'
    ) THEN
        ALTER TABLE "drivers" ADD COLUMN "taam_id" TEXT;
    END IF;
END $$;
