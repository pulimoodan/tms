import { PrismaClient, VehicleType, VehicleCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVVehicle {
  manufacturer: string;
  name: string;
  capacity: string;
  category: string;
  'tractor category': string;
  'trailer category': string;
  model: string;
  plate_number: string;
  asset: string;
  door_no: string;
  chassis_no: string;
  sequence_no: string;
  'Local Agent': string;
  type: string;
  built_in_trailer: string;
  built_in_reefer: string;
}

// Map CSV category to VehicleCategory enum
function mapCategory(csvCategory: string): VehicleCategory {
  const categoryMap: Record<string, VehicleCategory> = {
    TractorHead: VehicleCategory.TractorHead,
    Trailer: VehicleCategory.Trailer,
    DieselTanker: VehicleCategory.DieselTanker,
    BackhoeLoader: VehicleCategory.BackhoLoader,
    LightDutyTruck: VehicleCategory.LightDutyTruck,
    MiniVan: VehicleCategory.MiniVan,
    MiniVanFifteenSeater: VehicleCategory.MiniVanFifteenSeater,
    CraneMountedTruck: VehicleCategory.CraneMountedTruck,
    BoomTruck: VehicleCategory.BoomTruck,
    Pickup: VehicleCategory.Pickup,
    Forklift: VehicleCategory.Forklift,
    RoughTerrainCrane: VehicleCategory.RoughTerrainCrane,
    SkidLoader: VehicleCategory.SkidLoader,
    SUV: VehicleCategory.SUV,
    OneCarCarrier: VehicleCategory.OneCarCarrier,
  };

  return categoryMap[csvCategory] || VehicleCategory.TractorHead;
}

// Map CSV type to VehicleType enum
function mapType(csvType: string): VehicleType {
  const typeMap: Record<string, VehicleType> = {
    Vehicle: VehicleType.Vehicle,
    Attachment: VehicleType.Attachment,
    Equipment: VehicleType.Equipment,
  };

  return typeMap[csvType] || VehicleType.Vehicle;
}

// Normalize tractor category
function normalizeTractorCategory(category: string | undefined): string | null {
  if (!category || category.trim() === '') return null;
  const normalized = category.toUpperCase().replace('x', 'X');
  return normalized;
}

// Normalize trailer category
function normalizeTrailerCategory(category: string | undefined): string | null {
  if (!category || category.trim() === '') return null;
  return category.trim();
}

// Parse boolean from CSV
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toUpperCase();
  return normalized === 'YES' || normalized === 'TRUE' || normalized === '1';
}

// Parse year from model field
function parseYear(model: string | undefined): number | null {
  if (!model || model.trim() === '') return null;
  const year = parseInt(model.trim());
  return isNaN(year) ? null : year;
}

async function importVehicles() {
  try {
    console.log('Starting vehicle import from CSV...');

    // Read CSV file from scripts folder
    const csvPath = path.join(process.cwd(), 'scripts', 'vehicles.csv (final)-Table 1.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV
    const records: CSVVehicle[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Found ${records.length} records in CSV`);

    // Get all companies (to match across all companies)
    const companies = await prisma.company.findMany();
    if (companies.length === 0) {
      throw new Error('No company found in database. Please create a company first.');
    }

    console.log(
      `Found ${companies.length} company/companies. Will match vehicles across all companies.`,
    );

    let updated = 0;
    let created = 0;
    let skipped = 0;
    const errors: Array<{ asset: string; error: string }> = [];

    for (const record of records) {
      try {
        const assetNumber = record.asset?.trim() || null;
        const doorNumber = record.door_no?.trim() || null;

        // Skip if no asset number AND no door number (need at least one for matching)
        if (!assetNumber && !doorNumber) {
          console.log(`Skipping record with no asset number or door number: ${record.name}`);
          skipped++;
          continue;
        }

        // Find existing vehicle by asset number first, then by door number as fallback
        let existingVehicle = await prisma.vehicle.findFirst({
          where: assetNumber
            ? { asset: assetNumber }
            : doorNumber
              ? { doorNo: doorNumber }
              : { id: 'never-match' }, // This won't match anything, but satisfies TypeScript
        });

        // If not found by asset and we have door number, try matching by door number
        if (!existingVehicle && doorNumber && assetNumber) {
          existingVehicle = await prisma.vehicle.findFirst({
            where: {
              doorNo: doorNumber,
            },
          });
        }

        // Use the company from existing vehicle, or first company if creating new
        const targetCompanyId = existingVehicle?.companyId || companies[0].id;

        // Prepare data
        const vehicleData = {
          companyId: targetCompanyId,
          name: record.name?.trim() || 'Unnamed Vehicle',
          type: mapType(record.type),
          category: mapCategory(record.category),
          asset: assetNumber || null,
          doorNo: record.door_no?.trim() || null,
          plateNumber: record.plate_number?.trim() || null,
          chassisNo: record.chassis_no?.trim() || null,
          sequenceNo: record.sequence_no?.trim() || null,
          make: record.manufacturer?.trim() || null,
          model: record.model?.trim() || null,
          manufacturingYear: parseYear(record.model),
          capacity: record.capacity?.trim() || null,
          tractorCategory: normalizeTractorCategory(record['tractor category']),
          trailerCategory: normalizeTrailerCategory(record['trailer category']),
          agent: record['Local Agent']?.trim() || null,
          builtInTrailer: parseBoolean(record.built_in_trailer),
          builtInReefer: parseBoolean(record.built_in_reefer),
        };

        if (existingVehicle) {
          // Update existing vehicle (preserve ID and company)
          await prisma.vehicle.update({
            where: { id: existingVehicle.id },
            data: {
              ...vehicleData,
              companyId: existingVehicle.companyId, // Preserve original company
            },
          });
          updated++;
          console.log(
            `✓ Updated vehicle: ${assetNumber} - ${vehicleData.name} (ID: ${existingVehicle.id})`,
          );
        } else {
          // Create new vehicle
          const newVehicle = await prisma.vehicle.create({
            data: vehicleData,
          });
          created++;
          console.log(
            `+ Created vehicle: ${assetNumber} - ${vehicleData.name} (ID: ${newVehicle.id})`,
          );
        }
      } catch (error: any) {
        const asset = record.asset || 'UNKNOWN';
        const errorMsg = error.message || 'Unknown error';
        errors.push({ asset, error: errorMsg });
        console.error(`Error processing vehicle ${asset}:`, errorMsg);
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total records: ${records.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(({ asset, error }) => {
        console.log(`${asset}: ${error}`);
      });
    }

    console.log('\nImport completed!');
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importVehicles()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
