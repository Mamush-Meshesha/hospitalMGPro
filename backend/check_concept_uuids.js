const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const emptyUuids = await prisma.concept.count({ where: { uuid: "" } });
  const allConcepts = await prisma.concept.findMany({ select: { concept_id: true, uuid: true } });
  console.log(`Concepts with empty UUID: ${emptyUuids}`);
  console.log(`Total concepts: ${allConcepts.length}`);
  const duplicateUuids = allConcepts.map(c => c.uuid).filter((e, i, a) => a.indexOf(e) !== i && e !== "");
  console.log(`Duplicate UUIDs:`, duplicateUuids);
  process.exit(0);
}
check();
