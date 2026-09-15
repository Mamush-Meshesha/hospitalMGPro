const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const p = await prisma.provider.findFirst({
    include: {
      provider_attribute: true,
      provider_role_provider_role_idToprovider: true,
      concept_provider_speciality_idToconcept: {
        include: { concept_name_concept_name_concept_idToconcept: true }
      }
    }
  });
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}
check();
