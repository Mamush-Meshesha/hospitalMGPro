import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const roles = await prisma.role.findMany();
    console.log("ROLES IN DATABASE:");
    roles.forEach(r => console.log(`- ${r.role} (desc: ${r.description || 'None'})`));
  } catch (error) {
    console.error("Error fetching roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
