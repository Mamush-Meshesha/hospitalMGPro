import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  await prisma.queue_entry.deleteMany({});
  console.log("Cleared queue entries.");
}

run().finally(() => prisma.$disconnect());
