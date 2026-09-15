import { prisma } from '../utils/prisma';

export class ReportsDAL {
  static async getDailyCensus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [admissions, discharges, activeInpatients, totalBeds, totalBillsToday] = await Promise.all([
      prisma.visit.count({ where: { date_started: { gte: today, lt: tomorrow }, voided: false } }),
      prisma.visit.count({ where: { date_stopped: { gte: today, lt: tomorrow }, voided: false } }),
      prisma.visit.count({ where: { date_stopped: null, voided: false } }),
      prisma.bed.count(),
      prisma.cashier_bill.count({ where: { date_created: { gte: today } } })
    ]);

    const occupancyRate = totalBeds > 0 ? Math.round((activeInpatients / totalBeds) * 100) : 0;

    return { admissions, discharges, activeInpatients, totalBeds, occupancyRate, totalBillsToday };
  }

  static async getTopDiagnoses(limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const diagnoses = await prisma.encounter_diagnosis.groupBy({
      by: ['diagnosis_coded'],
      where: { date_created: { gte: thirtyDaysAgo }, voided: false, diagnosis_coded: { not: null } },
      _count: { diagnosis_id: true },
      orderBy: { _count: { diagnosis_id: 'desc' } },
      take: limit
    });

    const withNames = await Promise.all(
      diagnoses.map(async d => {
        const concept = d.diagnosis_coded
          ? await prisma.concept.findFirst({
              where: { concept_id: d.diagnosis_coded },
              include: { reverse_concept_name_name_for_concept: { take: 1 } }
            })
          : null;
        return {
          conceptId: d.diagnosis_coded,
          name: concept?.reverse_concept_name_name_for_concept[0]?.name || 'Unknown',
          count: d._count.diagnosis_id
        };
      })
    );

    return withNames;
  }

  static async getBedOccupancyByWard() {
    const beds = await prisma.bed.findMany({
      include: {
        bed_location_map: { include: { location: true } },
        bed_patient_assignment_map: { where: { date_stopped: null, voided: false }, take: 1 }
      }
    });

    const wardMap: Record<string, { total: number; occupied: number; wardName: string }> = {};
    for (const bed of beds) {
      const wardName = bed.bed_location_map[0]?.location?.name || 'Unassigned';
      const locationId = bed.bed_location_map[0]?.location_id?.toString() || '0';
      if (!wardMap[locationId]) wardMap[locationId] = { total: 0, occupied: 0, wardName };
      wardMap[locationId].total++;
      if (bed.bed_patient_assignment_map.length > 0) wardMap[locationId].occupied++;
    }

    return Object.values(wardMap).map(w => ({
      ...w,
      occupancyRate: w.total > 0 ? Math.round((w.occupied / w.total) * 100) : 0
    }));
  }

  static async getPharmacyConsumption() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ops = await prisma.stockmgmt_stock_operation.findMany({
      where: { operation_type: 'DISPENSED', date_created: { gte: thirtyDaysAgo } },
      include: {
        stock_operation_items: {
          include: {
            stock_item: {
              include: {
                concept: {
                  include: { reverse_concept_name_name_for_concept: { take: 1 } }
                }
              }
            }
          }
        }
      }
    });

    const consumptionMap: Record<string, { name: string; total: number }> = {};
    for (const op of ops) {
      for (const item of op.stock_operation_items) {
        const name = item.stock_item?.concept?.reverse_concept_name_name_for_concept[0]?.name || 'Unknown';
        const key = name;
        if (!consumptionMap[key]) consumptionMap[key] = { name, total: 0 };
        consumptionMap[key].total += Number(item.quantity) || 0;
      }
    }

    return Object.values(consumptionMap).sort((a, b) => b.total - a.total).slice(0, 10);
  }
}
