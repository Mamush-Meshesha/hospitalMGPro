import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const seqResult = await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('encounter_type', 'encounter_type_id'), coalesce(max(encounter_type_id),0) + 1, false) FROM encounter_type;`;
    console.log("Sequence reset for encounter_type", seqResult);
    
    // Also reset visit, visit_type, encounter just in case
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('visit', 'visit_id'), coalesce(max(visit_id),0) + 1, false) FROM visit;`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('encounter', 'encounter_id'), coalesce(max(encounter_id),0) + 1, false) FROM encounter;`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('bed', 'bed_id'), coalesce(max(bed_id),0) + 1, false) FROM bed;`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('bed_patient_assignment_map', 'bed_patient_assignment_map_id'), coalesce(max(bed_patient_assignment_map_id),0) + 1, false) FROM bed_patient_assignment_map;`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('tenant', 'tenant_id'), coalesce(max(tenant_id),0) + 1, false) FROM tenant;`;
    
    console.log("All common sequences reset.");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
