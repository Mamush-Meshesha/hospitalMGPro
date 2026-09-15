import { prisma } from '../utils/prisma';

export class MedicationsDAL {
  static async getPatientMedications(patientId: number) {
    const now = new Date();

    const drugOrders = await prisma.drug_order.findMany({
      where: {
        orders_extends_order: {
          patient_id: patientId,
          voided: false
        }
      },
      include: {
        orders_extends_order: {
          include: {
            order_type_type_of_order: true
          }
        },
        concept_drug_order_dose_units: {
          include: { reverse_concept_name_name_for_concept: { take: 1 } }
        },
        concept_drug_order_route_fk: {
          include: { reverse_concept_name_name_for_concept: { take: 1 } }
        },
        order_frequency_drug_order_frequency_fk: {
          include: {
            concept_order_frequency_concept_id_fk: {
              include: { reverse_concept_name_name_for_concept: { take: 1 } }
            }
          }
        }
      }
    });

    // Bulk fetch drug names (since relation is missing on orders)
    const conceptIds = drugOrders.map(d => d.orders_extends_order.concept_id);
    const concepts = await prisma.concept_name.findMany({
      where: { concept_id: { in: conceptIds }, concept_name_type: 'FULLY_SPECIFIED' }
    });
    const conceptMap = new Map(concepts.map(c => [c.concept_id, c.name]));

    const active: any[] = [];
    const past: any[] = [];
    const future: any[] = [];

    for (const d of drugOrders) {
      const order = d.orders_extends_order;
      const drugName = conceptMap.get(order.concept_id) || d.brand_name || d.drug_non_coded || 'Unknown Drug';
      const dose = d.dose;
      const doseUnit = d.concept_drug_order_dose_units?.reverse_concept_name_name_for_concept[0]?.name || '';
      const route = d.concept_drug_order_route_fk?.reverse_concept_name_name_for_concept[0]?.name || '';
      const frequency = d.order_frequency_drug_order_frequency_fk?.concept_order_frequency_concept_id_fk?.reverse_concept_name_name_for_concept[0]?.name || d.frequency;
      const dateActivated = order.date_activated;
      const autoExpDate = order.auto_expire_date;

      const entry = { orderId: order.order_id, drugName, dose, doseUnit, route, frequency, dateActivated, autoExpDate, urgency: order.urgency };

      if (!dateActivated || dateActivated > now) {
        future.push(entry);
      } else if (autoExpDate && autoExpDate < now) {
        past.push(entry);
      } else {
        active.push(entry);
      }
    }

    return { active, past, future };
  }
}
