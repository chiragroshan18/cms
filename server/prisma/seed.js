const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  // 1. Seed Categories
  const defaultCategories = [
    { name: 'Technical', description: 'Hardware, software, and IT technical issues' },
    { name: 'Service', description: 'Customer service, operational quality, and process feedback' },
    { name: 'Maintenance', description: 'Facility, equipment, and physical upkeep' },
    { name: 'Billing', description: 'Invoicing, payments, and financial queries' },
    { name: 'Security', description: 'Data privacy, physical security, and access control' },
    { name: 'Product', description: 'Product defects, features, and user feedback' },
    { name: 'Other', description: 'General complaints and unclassified items' },
  ];

  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  // 2. Ensure only ONE Admin exists
  console.log('Seeding initial single ADMIN user...');
  const existingAdminCount = await prisma.user.count({
    where: { role: 'ADMIN' },
  });

  if (existingAdminCount === 0) {
    const password_hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        password_hash,
        role: 'ADMIN',
      },
    });
    console.log(`Seeded ADMIN account: ${adminEmail}`);
  } else {
    console.log('ADMIN user already exists. Skipping admin creation.');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
