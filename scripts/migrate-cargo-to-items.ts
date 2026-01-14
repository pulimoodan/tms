import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCargoToItems() {
  try {
    console.log('Starting cargo migration to cargo items...');

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { cargoDescription: { not: null } },
          { weight: { not: null } },
          { volume: { not: null } },
          { value: { not: null } },
        ],
      },
    });

    console.log(`Found ${orders.length} orders to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const order of orders) {
      // Check if cargo items already exist for this order
      const existingItems = await prisma.cargoItem.findMany({
        where: { orderId: order.id },
      });

      if (existingItems.length > 0) {
        console.log(`Order ${order.orderNo} already has cargo items, skipping...`);
        skipped++;
        continue;
      }

      // Only create cargo item if cargo description exists
      if (order.cargoDescription) {
        await prisma.cargoItem.create({
          data: {
            orderId: order.id,
            description: order.cargoDescription,
            weight: order.weight,
            weightUom: order.weightUom || 'TON',
            volume: order.volume,
            value: order.value,
            sequence: 0,
          },
        });
        migrated++;
        console.log(`Migrated order ${order.orderNo}`);
      } else {
        skipped++;
        console.log(`Order ${order.orderNo} has no cargo description, skipping...`);
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Migrated: ${migrated} orders`);
    console.log(`Skipped: ${skipped} orders`);
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCargoToItems()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

