import { prisma } from '../src/db.js';
import { seedAdmin } from '../src/seed.js';

async function main() {
  try {
    await seedAdmin();
  } catch (error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
