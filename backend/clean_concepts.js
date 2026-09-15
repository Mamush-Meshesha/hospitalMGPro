const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  try {
    await prisma.obs.deleteMany();
    console.log("Deleted obs.");
    await prisma.concept_reference_map.deleteMany();
    console.log("Deleted concept_reference_maps.");
    await prisma.concept_name.deleteMany();
    console.log("Deleted concept_names.");
    const deletedConcepts = await prisma.concept.deleteMany();
    console.log(`Deleted ${deletedConcepts.count} concepts.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
clean();
