const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const concepts = await prisma.concept.findMany({
    where: { retired: false },
    take: 3,
    include: {
      reverse_concept_name_name_for_concept: { take: 1 },
      concept_class_concept_classes: true,
      concept_datatype_concept_datatypes: true,
      reverse_concept_reference_map_map_for_concept: {
        include: {
          concept_reference_term_mapped_concept_reference_term: {
            include: {
              concept_reference_source_mapped_concept_source: true
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(concepts, null, 2));
  process.exit(0);
}
test();
