import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting company seed...');

  const company = await prisma.company.upsert({
    where: { crNo: 'CR1234567890' },
    update: {},
    create: {
      name: 'Default Company',
      nameArabic: 'الشركة الافتراضية',
      buildingNo: '1234',
      secondaryNo: '5678',
      street: 'King Fahd Road',
      streetArabic: 'طريق الملك فهد',
      district: 'Al Olaya',
      districtArabic: 'العليا',
      postalCode: 123456,
      country: 'Saudi Arabia',
      city: 'Riyadh',
      crNo: 'CR1234567890',
      crExpiryDate: new Date('2025-12-31'),
      vatNo: 'VAT123456789',
      updatedById: null,
    },
  });

  console.log('Company created/found:', company.id);
  console.log('Company Name:', company.name);
  console.log('CR Number:', company.crNo);
  console.log('Company seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
