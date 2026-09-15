
import { prisma } from '../utils/prisma';

export class ImmunizationDAL {
  static async getPatientImmunizations(patientId: number) {
    // Vaccine concepts (mocked IDs for common vaccines)
    const vaccineConcepts = [886, 1030, 781, 997, 1422, 1625];

    return await prisma.obs.findMany({
      where: {
        person_id: patientId,
        concept_id: { in: vaccineConcepts },
        voided: false
      },
      include: {
        concept_obs_concept: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        }
      },
      orderBy: { obs_datetime: 'desc' }
    });
  }

  static async recordImmunization(patientId: number, conceptId: number, dateAdministered: Date, creatorId: number = 1) {
    const uuidv4 = require('crypto').randomUUID;
    const timestamp = new Date();

    return await prisma.obs.create({
      data: {
        person_id: patientId,
        concept_id: conceptId,
        obs_datetime: dateAdministered,
        creator: creatorId,
        date_created: timestamp,
        voided: false,
        uuid: uuidv4(),
        status: 'FINAL',
        value_numeric: 1 // indicating administered
      }
    });
  }
}
