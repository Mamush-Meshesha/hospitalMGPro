import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class DiagnosisDAL {
  static async addEncounterDiagnosis(data: {
    encounterId: number;
    patientId: number;
    diagnosisCoded?: number;
    diagnosisNonCoded?: string;
    certainty: string;
    creatorId: number;
  }) {
    return await prisma.encounter_diagnosis.create({
      data: {
        encounter_id: data.encounterId,
        patient_id: data.patientId,
        diagnosis_coded: data.diagnosisCoded,
        diagnosis_non_coded: data.diagnosisNonCoded,
        certainty: data.certainty,
        creator: data.creatorId,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });
  }
}
