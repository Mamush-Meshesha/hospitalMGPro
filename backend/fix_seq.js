const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  try {
    const res = await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"provider"', 'provider_id'), coalesce(max(provider_id),0) + 1, false) FROM "provider";`);
    console.log("Fixed provider sequence.", res);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();
