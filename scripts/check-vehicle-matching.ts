import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVVehicle {
  asset: string;
  name: string;
}

async function checkMatching() {
  try {
    console.log('Checking vehicle matching...\n');

    // Get all existing vehicles
    const existingVehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        asset: true,
        name: true,
        plateNumber: true,
        doorNo: true,
      },
    });

    console.log(`Existing vehicles in database: ${existingVehicles.length}`);
    if (existingVehicles.length > 0) {
      console.log('\nFirst 10 existing vehicles:');
      existingVehicles.slice(0, 10).forEach((v) => {
        console.log(
          `  - Asset: "${v.asset || 'NULL'}", Name: ${v.name}, Plate: ${v.plateNumber || 'N/A'}, Door: ${v.doorNo || 'N/A'}`,
        );
      });
    }

    // Read CSV
    const csvPath = path.join(process.cwd(), 'vehicles.csv (final)-Table 1.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records: CSVVehicle[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`\nCSV records: ${records.length}`);
    console.log('\nFirst 10 CSV asset numbers:');
    records.slice(0, 10).forEach((r) => {
      console.log(`  - Asset: "${r.asset || 'EMPTY'}", Name: ${r.name}`);
    });

    // Check matches
    const csvAssets = new Set(records.map((r) => r.asset?.trim()).filter(Boolean));
    const dbAssets = new Set(existingVehicles.map((v) => v.asset?.trim()).filter(Boolean));

    console.log('\n=== Matching Analysis ===');
    console.log(`Unique asset numbers in CSV: ${csvAssets.size}`);
    console.log(`Unique asset numbers in DB: ${dbAssets.size}`);

    const matches = Array.from(csvAssets).filter((asset) => dbAssets.has(asset));
    const csvOnly = Array.from(csvAssets).filter((asset) => !dbAssets.has(asset));
    const dbOnly = Array.from(dbAssets).filter((asset) => !csvAssets.has(asset));

    console.log(`\nMatching assets: ${matches.length}`);
    console.log(`Assets only in CSV (will be created): ${csvOnly.length}`);
    console.log(`Assets only in DB (won't be updated): ${dbOnly.length}`);

    if (matches.length > 0) {
      console.log('\nFirst 5 matching assets:');
      matches.slice(0, 5).forEach((asset) => console.log(`  - ${asset}`));
    }

    if (csvOnly.length > 0) {
      console.log('\nFirst 10 assets only in CSV:');
      csvOnly.slice(0, 10).forEach((asset) => console.log(`  - ${asset}`));
    }

    if (dbOnly.length > 0) {
      console.log('\nFirst 10 assets only in DB:');
      dbOnly.slice(0, 10).forEach((asset) => console.log(`  - ${asset}`));
    }

    // Check for vehicles with NULL asset
    const nullAssetVehicles = existingVehicles.filter((v) => !v.asset);
    if (nullAssetVehicles.length > 0) {
      console.log(
        `\n⚠️  Warning: ${nullAssetVehicles.length} vehicles in DB have NULL asset numbers (cannot be matched)`,
      );
      console.log('First 5 vehicles with NULL asset:');
      nullAssetVehicles.slice(0, 5).forEach((v) => {
        console.log(`  - ID: ${v.id}, Name: ${v.name}, Plate: ${v.plateNumber || 'N/A'}`);
      });
    }
  } catch (error) {
    console.error('Check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkMatching()
  .then(() => {
    console.log('\nCheck completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
