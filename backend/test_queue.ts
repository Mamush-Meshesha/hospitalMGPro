import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const q = await prisma.queue_entry.findMany({
    include: {
      patient: {
        include: {
          person_person_id_for_patient: {
            include: {
              reverse_person_name_name_for_person: true
            }
          }
        }
      }
    }
  });
  console.dir(q, { depth: null });
}

run().finally(() => prisma.$disconnect());
