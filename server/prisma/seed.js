const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Categories
  // 2. Seed Products
  // 3. Seed Product Variants
  // 4. Seed Inventory
  // 5. Seed Users
  // 6. Seed Drops
  // 7. Seed Drop Products
  // 8. Seed Site Settings / Feature Flags

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
