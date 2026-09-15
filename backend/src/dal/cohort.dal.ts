import crypto from 'crypto';
import { prisma } from '../utils/prisma';

export class CohortDAL {
  static async getAll() {
    return await prisma.cohort.findMany({
      where: { voided: false },
      include: {
        reverse_cohort_member_parent_cohort: {
          where: { voided: false },
          include: {
            patient_member_patient: {
              include: {
                person_person_id_for_patient: {
                  include: {
                    reverse_person_name_name_for_person: { where: { preferred: true, voided: false } }
                  }
                }
              }
            }
          }
        }
      },
      take: 50
    });
  }

  static async getById(id: string) {
    return await prisma.cohort.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    return await prisma.$transaction(async (tx) => {
      const cohort = await tx.cohort.create({ 
        data: {
          name: data.name,
          description: data.description,
          creator: data.creator || 1,
          date_created: new Date(),
          voided: false,
          uuid: crypto.randomUUID()
        } 
      });

      if (data.members && data.members.length > 0) {
        for (const member of data.members) {
          const patient = await tx.patient.findFirst({
            where: { person_person_id_for_patient: { uuid: member.patientUuid } }
          });
          if (patient) {
            await tx.cohort_member.create({
              data: {
                cohort_id: cohort.cohort_id,
                patient_id: patient.patient_id,
                start_date: member.startDate ? new Date(member.startDate) : new Date(),
                end_date: member.endDate ? new Date(member.endDate) : null,
                creator: data.creator || 1,
                date_created: new Date(),
                voided: false,
                uuid: crypto.randomUUID()
              }
            });
          }
        }
      }
      return cohort;
    });
  }

  static async update(id: string, data: any) {
    return await prisma.cohort.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Clinical Data)
    return await prisma.cohort.updateMany({ 
      where: { uuid: id }, 
      data: { voided: true, date_voided: new Date(), voided_by: 1 } 
    });
  }
}
