const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const classes = await prisma.concept_class.findMany();
  console.log("Classes:", classes.map(c => ({ id: c.concept_class_id, name: c.name })));
  const datatypes = await prisma.concept_datatype.findMany();
  console.log("Datatypes:", datatypes.map(d => ({ id: d.concept_datatype_id, name: d.name })));
  process.exit(0);
}
check();
