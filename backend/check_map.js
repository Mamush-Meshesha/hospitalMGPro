const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const sources = await prisma.concept_reference_source.findMany();
  console.log("Sources:", sources);
  const types = await prisma.concept_map_type.findMany();
  console.log("Map types:", types);
  process.exit(0);
}
check();
