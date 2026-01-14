import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('Starting cleanup of duplicate vehicles...\n');

    // Find all vehicles with asset numbers
    const vehicles = await prisma.vehicle.findMany({
      where: {
        asset: { not: null },
      },
      orderBy: [{ asset: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        asset: true,
        name: true,
        createdAt: true,
        companyId: true,
      },
    });

    console.log(`Total vehicles with asset numbers: ${vehicles.length}`);

    // Group by asset number
    const assetGroups = new Map<string, typeof vehicles>();
    for (const vehicle of vehicles) {
      if (!vehicle.asset) continue;
      const asset = vehicle.asset.trim();
      if (!assetGroups.has(asset)) {
        assetGroups.set(asset, []);
      }
      assetGroups.get(asset)!.push(vehicle);
    }

    // Find duplicates (asset numbers with more than 1 vehicle)
    const duplicates: Array<{ asset: string; vehicles: typeof vehicles }> = [];
    for (const [asset, vehicleList] of assetGroups.entries()) {
      if (vehicleList.length > 1) {
        duplicates.push({ asset, vehicles: vehicleList });
      }
    }

    console.log(`Found ${duplicates.length} asset numbers with duplicates\n`);

    if (duplicates.length === 0) {
      console.log('No duplicates found. Nothing to clean up.');
      return;
    }

    // Check for vehicles referenced in orders
    const allDuplicateIds = duplicates.flatMap((d) => d.vehicles.slice(1).map((v) => v.id)); // All except the first (oldest) one

    const vehiclesInOrders = await prisma.order.findMany({
      where: {
        OR: [{ vehicleId: { in: allDuplicateIds } }, { attachmentId: { in: allDuplicateIds } }],
      },
      select: {
        id: true,
        vehicleId: true,
        attachmentId: true,
      },
    });

    if (vehiclesInOrders.length > 0) {
      console.log(`⚠️  WARNING: ${vehiclesInOrders.length} orders reference duplicate vehicles!`);
      console.log('These duplicates will NOT be deleted to preserve order relationships.\n');
    }

    let deleted = 0;
    let kept = 0;
    let skipped = 0;
    const errors: Array<{ asset: string; error: string }> = [];

    for (const { asset, vehicles: vehicleList } of duplicates) {
      try {
        // Sort by createdAt (oldest first)
        const sorted = [...vehicleList].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );

        // Keep the oldest one
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);

        // Check if any to-delete vehicles are referenced in orders
        const toDeleteIds = toDelete.map((v) => v.id);
        const referencedIds = vehiclesInOrders
          .filter(
            (o) =>
              (o.vehicleId && toDeleteIds.includes(o.vehicleId)) ||
              (o.attachmentId && toDeleteIds.includes(o.attachmentId)),
          )
          .map((o) => o.vehicleId || o.attachmentId)
          .filter(Boolean) as string[];

        if (referencedIds.length > 0) {
          console.log(
            `⚠️  Skipping deletion of ${asset}: ${referencedIds.length} vehicle(s) are referenced in orders`,
          );
          skipped += toDelete.length;
          continue;
        }

        // Delete duplicates
        for (const vehicle of toDelete) {
          try {
            await prisma.vehicle.delete({
              where: { id: vehicle.id },
            });
            deleted++;
            console.log(
              `✓ Deleted duplicate: ${asset} - ${vehicle.name} (ID: ${vehicle.id}, Created: ${vehicle.createdAt.toISOString()})`,
            );
          } catch (error: any) {
            if (error.code === 'P2003') {
              // Foreign key constraint - vehicle is referenced
              console.log(
                `⚠️  Cannot delete ${asset} - ${vehicle.name}: Referenced by other records`,
              );
              skipped++;
            } else {
              throw error;
            }
          }
        }

        kept++;
        console.log(
          `  Kept original: ${asset} - ${toKeep.name} (ID: ${toKeep.id}, Created: ${toKeep.createdAt.toISOString()})\n`,
        );
      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error';
        errors.push({ asset, error: errorMsg });
        console.error(`Error processing ${asset}:`, errorMsg);
      }
    }

    console.log('\n=== Cleanup Summary ===');
    console.log(`Total duplicate groups: ${duplicates.length}`);
    console.log(`Vehicles kept (originals): ${kept}`);
    console.log(`Vehicles deleted: ${deleted}`);
    console.log(`Vehicles skipped (referenced): ${skipped}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(({ asset, error }) => {
        console.log(`${asset}: ${error}`);
      });
    }

    console.log('\nCleanup completed!');
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupDuplicates()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
