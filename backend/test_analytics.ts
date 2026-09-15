import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalytics() {
  console.log("=== LAB ANALYTICS ===");
  const rawOrders = await prisma.orders.findMany({
    where: { voided: false, order_action: 'NEW' },
    take: 10,
    orderBy: { date_created: 'desc' },
    include: {
      patient_order_for_patient: {
        include: { person_person_id_for_patient: { include: { reverse_person_name_name_for_person: true } } }
      },
      concept_orders_concept_idToconcept: {
        include: { reverse_concept_name_concept_name_concept_idToconcept: true }
      }
    }
  });

  const totalOrders = await prisma.orders.count({ where: { voided: false } });

  const urgencyGroup = await prisma.orders.groupBy({
    by: ['urgency'],
    where: { voided: false },
    _count: true
  });

  console.log("Urgency Group:", urgencyGroup);

  const conceptGroup = await prisma.orders.groupBy({
    by: ['concept_id'],
    where: { voided: false },
    _count: true,
    orderBy: { _count: { concept_id: 'desc' } },
    take: 4
  });

  console.log("Concept Group:", conceptGroup);
  
  if(conceptGroup.length > 0) {
    const conceptIds = conceptGroup.map(c => c.concept_id);
    const concepts = await prisma.concept.findMany({
      where: { concept_id: { in: conceptIds } },
      include: { reverse_concept_name_concept_name_concept_idToconcept: true }
    });
    console.log("Top Concepts:", concepts.map(c => c.reverse_concept_name_concept_name_concept_idToconcept[0]?.name));
  }

  console.log("Recent Results mapped:", rawOrders.map(o => o.patient_order_for_patient?.person_person_id_for_patient?.reverse_person_name_name_for_person[0]?.given_name));

  console.log("=== DONE ===");
}

testAnalytics().catch(console.error).finally(() => prisma.$disconnect());
