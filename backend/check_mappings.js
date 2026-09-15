const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.concept_reference_map.count();
  console.log(`Total rows in concept_reference_map: ${count}`);
  process.exit(0);
}
check();
