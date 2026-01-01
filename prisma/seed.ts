import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  let company = await prisma.company.findFirst({
    where: { crNo: 'CR1234567890' },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
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
    console.log('Company created:', company.id);
  } else {
    console.log('Company found:', company.id);
  }

  let adminRole = await prisma.role.findFirst({
    where: { name: 'Admin', companyId: company.id },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        companyId: company.id,
        name: 'Admin',
        createdById: null,
        updatedById: null,
      },
    });
    console.log('Admin role created:', adminRole.id);
  } else {
    console.log('Admin role found:', adminRole.id);
  }

  const testUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('password123', 10),
      roleId: adminRole.id,
      status: 'Active',
      createdById: null,
      updatedById: null,
    },
  });

  console.log('Test user created/found:', testUser.id);
  console.log('Email: admin@test.com');
  console.log('Password: password123');

  await prisma.rolePermission.upsert({
    where: {
      roleId_module: {
        roleId: adminRole.id,
        module: 'Users',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      roleId: adminRole.id,
      module: 'Users',
      permissions: ['Read', 'Write', 'Update', 'Delete', 'Export'],
      createdById: null,
      updatedById: null,
    },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_module: {
        roleId: adminRole.id,
        module: 'Roles',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      roleId: adminRole.id,
      module: 'Roles',
      permissions: ['Read', 'Write', 'Update', 'Delete', 'Export'],
      createdById: null,
      updatedById: null,
    },
  });

  console.log('Permissions added to Admin role');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
