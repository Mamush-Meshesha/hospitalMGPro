import { v4 as uuidv4 } from 'uuid';

import { prisma } from '../utils/prisma';

export class BedDal {
  static async getAllBeds() {
    return prisma.bed.findMany({
      include: {
        bed_type: true,
        bed_location_map: {
          include: { location: true }
        },
        bed_patient_assignment_map: {
          where: { voided: false },
          include: { 
            patient: {
              include: {
                person_person_id_for_patient: {
                  include: { reverse_person_name_name_for_person: { where: { preferred: true } } }
                },
                reverse_encounter_encounter_patient: {
                  where: { voided: false },
                  orderBy: { encounter_datetime: 'desc' },
                  take: 1
                }
              }
            } 
          }
        }
      }
    });
  }

  static async getBedById(uuid: string) {
    return prisma.bed.findFirst({
      where: { uuid },
      include: {
        bed_type: true,
        bed_location_map: { include: { location: true } }
      }
    });
  }

  static async createBed(bedNumber: string, locationId: number, bedTypeId: number | null, creator: number) {
    return prisma.$transaction(async (tx) => {
      const location = await tx.location.findFirst({ where: { location_id: locationId } });
      if (!location) throw new Error('Location not found');

      const bed = await tx.bed.create({
        data: {
          bed_number: bedNumber,
          status: 'AVAILABLE',
          bed_type_id: bedTypeId || null,
          uuid: uuidv4(),
          creator,
          date_created: new Date(),
        }
      });

      await tx.bed_location_map.create({
        data: {
          bed_id: bed.bed_id,
          location_id: location.location_id,
        }
      });

      return bed;
    });
  }

  static async assignPatientToBed(bedUuid: string, patientUuid: string, encounterUuid: string, userId: number) {
    return prisma.$transaction(async (tx) => {
      const bed = await tx.bed.findFirst({ where: { uuid: bedUuid } });
      const patient = await tx.patient.findFirst({ where: { person_person_id_for_patient: { uuid: patientUuid } } });
      const encounter = encounterUuid ? await tx.encounter.findFirst({ where: { uuid: encounterUuid } }) : null;

      if (!bed || !patient) throw new Error('Invalid bed or patient UUID');

      // Update bed status
      await tx.bed.update({
        where: { bed_id: bed.bed_id },
        data: { status: 'OCCUPIED' }
      });

      // Create assignment
      return tx.bed_patient_assignment_map.create({
        data: {
          bed_id: bed.bed_id,
          patient_id: patient.patient_id,
          encounter_id: encounter ? encounter.encounter_id : null,
          uuid: uuidv4(),
          creator: userId,
          date_started: new Date()
        }
      });
    });
  }

  static async dischargePatientFromBed(assignmentUuid: string, userId: number) {
    return prisma.$transaction(async (tx) => {
      const assignment = await tx.bed_patient_assignment_map.findFirst({ 
        where: { uuid: assignmentUuid } 
      });

      if (!assignment) throw new Error('Assignment not found');

      // Update assignment
      const updatedAssignment = await tx.bed_patient_assignment_map.update({
        where: { bed_patient_assignment_map_id: assignment.bed_patient_assignment_map_id },
        data: {
          date_stopped: new Date(),
          changed_by: userId,
          date_changed: new Date()
        }
      });

      // Update bed status back to AVAILABLE
      await tx.bed.update({
        where: { bed_id: assignment.bed_id },
        data: { status: 'AVAILABLE' }
      });

      return updatedAssignment;
    });
  }

  static async transferPatient(assignmentUuid: string, newBedUuid: string, userId: number) {
    return prisma.$transaction(async (tx) => {
      // Find current assignment
      const currentAssignment = await tx.bed_patient_assignment_map.findFirst({
        where: { uuid: assignmentUuid.trim(), date_stopped: null, voided: false }
      });
      if (!currentAssignment) throw new Error('Active bed assignment not found');

      // Find the target bed
      const newBed = await tx.bed.findFirst({ where: { uuid: newBedUuid.trim() } });
      if (!newBed) throw new Error('Target bed not found');
      if (newBed.status !== 'AVAILABLE') throw new Error('Target bed is not available');

      // End the old assignment
      await tx.bed_patient_assignment_map.update({
        where: { bed_patient_assignment_map_id: currentAssignment.bed_patient_assignment_map_id },
        data: { date_stopped: new Date(), changed_by: userId, date_changed: new Date() }
      });

      // Free the old bed
      await tx.bed.update({
        where: { bed_id: currentAssignment.bed_id },
        data: { status: 'AVAILABLE' }
      });

      // Create new assignment on new bed
      const newAssignment = await tx.bed_patient_assignment_map.create({
        data: {
          bed_id: newBed.bed_id,
          patient_id: currentAssignment.patient_id,
          encounter_id: currentAssignment.encounter_id,
          uuid: uuidv4(),
          creator: userId,
          date_started: new Date()
        }
      });

      // Mark new bed as occupied
      await tx.bed.update({
        where: { bed_id: newBed.bed_id },
        data: { status: 'OCCUPIED' }
      });

      return newAssignment;
    });
  }
}
