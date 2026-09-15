const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function retire() {
  try {
    const retired = await prisma.concept.updateMany({
      data: { retired: true, date_retired: new Date(), retired_by: 1 }
    });
    console.log(`Successfully retired ${retired.count} concepts.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
retire();
