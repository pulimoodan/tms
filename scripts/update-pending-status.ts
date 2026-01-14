import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePendingStatus() {
  try {
    console.log('Checking for orders with old status values...');

    // Check current status distribution
    const statusCounts = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*)::int as count
      FROM orders
      GROUP BY status
    `;

    console.log('\nCurrent status distribution:');
    statusCounts.forEach(({ status, count }) => {
      console.log(`  ${status}: ${count}`);
    });

    // First, check if we need to run the migration
    // If the enum doesn't have InProgress, we need to update it first
    try {
      // Try to add the new enum values if they don't exist
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
          -- Add new enum values if they don't exist
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'InProgress' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')) THEN
            ALTER TYPE "OrderStatus" ADD VALUE 'InProgress';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Closed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')) THEN
            ALTER TYPE "OrderStatus" ADD VALUE 'Closed';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ClosedAccident' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus')) THEN
            ALTER TYPE "OrderStatus" ADD VALUE 'ClosedAccident';
          END IF;
        END $$;
      `);
    } catch (error: any) {
      console.log('Note: Enum values may already exist or migration needed:', error.message);
    }

    // Update any remaining old status values
    // Use text comparison and cast to handle both old and new enum values
    const result = await prisma.$executeRawUnsafe(`
      UPDATE orders
      SET status = CASE
        WHEN status::text = 'Pending' THEN 'InProgress'::"OrderStatus"
        WHEN status::text = 'Dispatched' THEN 'InProgress'::"OrderStatus"
        WHEN status::text = 'Delivered' THEN 'Closed'::"OrderStatus"
        WHEN status::text = 'Invoiced' THEN 'Closed'::"OrderStatus"
        ELSE status
      END
      WHERE status::text IN ('Pending', 'Dispatched', 'Delivered', 'Invoiced')
    `);

    console.log(`\n✓ Updated ${result} order(s) with old status values`);

    // Check final status distribution
    const finalStatusCounts = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*)::int as count
      FROM orders
      GROUP BY status
    `;

    console.log('\nFinal status distribution:');
    finalStatusCounts.forEach(({ status, count }) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\nUpdate completed!');
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePendingStatus()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

