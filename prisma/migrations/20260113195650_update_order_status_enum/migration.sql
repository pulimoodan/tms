-- Step 1: Drop the default value first
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;

-- Step 2: Create a new enum type with the new values
CREATE TYPE "OrderStatus_new" AS ENUM ('InProgress', 'Closed');

-- Step 3: Alter the column to use the new enum type, mapping old values to new ones
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'Pending' THEN 'InProgress'::"OrderStatus_new"
    WHEN 'Dispatched' THEN 'InProgress'::"OrderStatus_new"
    WHEN 'Delivered' THEN 'Closed'::"OrderStatus_new"
    WHEN 'Invoiced' THEN 'Closed'::"OrderStatus_new"
    ELSE 'InProgress'::"OrderStatus_new"
  END
);

-- Step 4: Drop the old enum type and rename the new one
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

-- Step 5: Set the default value back
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'InProgress'::"OrderStatus";

