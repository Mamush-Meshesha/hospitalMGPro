const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const count = await prisma.patient.count();
  console.log("Patient count:", count);
  process.exit(0);
}
check();
