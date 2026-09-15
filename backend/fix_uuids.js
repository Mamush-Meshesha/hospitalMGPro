const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function fix() {
  const rels = await prisma.relationship_type.findMany({ where: { uuid: "" } });
  for (const r of rels) {
    await prisma.relationship_type.updateMany({
      where: { relationship_type_id: r.relationship_type_id },
      data: { uuid: uuidv4() }
    });
  }
  console.log(`Fixed ${rels.length} relationship_types`);

  const pids = await prisma.patient_identifier_type.findMany({ where: { uuid: "" } });
  for (const p of pids) {
    await prisma.patient_identifier_type.updateMany({
      where: { patient_identifier_type_id: p.patient_identifier_type_id },
      data: { uuid: uuidv4() }
    });
  }
  console.log(`Fixed ${pids.length} patient_identifier_types`);
  
  process.exit(0);
}
fix();
