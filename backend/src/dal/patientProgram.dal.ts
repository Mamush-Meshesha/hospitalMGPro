import { prisma } from '../utils/prisma';

export class PatientProgramDAL {
  static async getPatientPrograms(patientId: number) {
    return await prisma.patient_program.findMany({
      where: { patient_id: patientId, voided: false },
      include: {
        program_program_for_patient: true,
        location_patient_program_location_id: true,
        reverse_patient_state_patient_program_for_state: {
          where: { voided: false },
          include: {
            program_workflow_state_state_for_patient: {
              include: { concept_state_concept: { include: { reverse_concept_name_name_for_concept: { take: 1 } } } }
            }
          },
          orderBy: { start_date: 'desc' },
          take: 1
        }
      },
      orderBy: { date_enrolled: 'desc' }
    });
  }

  static async enrollPatient(data: {
    patientId: number;
    programId: number;
    locationId: number;
    dateEnrolled: Date;
    creatorId: number;
  }) {
    const { v4: uuidv4 } = await import('uuid');
    return await prisma.patient_program.create({
      data: {
        patient_id: data.patientId,
        program_id: data.programId,
        date_enrolled: data.dateEnrolled,
        location_id: data.locationId,
        creator: data.creatorId,
        date_created: new Date(),
        voided: false,
        uuid: uuidv4()
      }
    });
  }
}
