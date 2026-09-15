import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const types = await prisma.encounter_type.findMany();
  console.log(types);
}
main();
