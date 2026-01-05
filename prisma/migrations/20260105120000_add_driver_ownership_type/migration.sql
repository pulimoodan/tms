-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "DriverOwnershipType" AS ENUM ('CompanyOwned', 'Outsourced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable (add columns if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'ownership_type') THEN
        ALTER TABLE "drivers" ADD COLUMN "ownership_type" "DriverOwnershipType" NOT NULL DEFAULT 'CompanyOwned';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'outsourced_company_name') THEN
        ALTER TABLE "drivers" ADD COLUMN "outsourced_company_name" TEXT;
    END IF;
END $$;

