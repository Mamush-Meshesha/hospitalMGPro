import { BedDal } from '../dal/bed.dal';

export class BedService {
  static async getAllBeds() {
    return BedDal.getAllBeds();
  }

  static async getBedById(uuid: string) {
    return BedDal.getBedById(uuid);
  }

  static async createBed(bedNumber: string, locationId: number, bedTypeId: number | null, userId: number) {
    return BedDal.createBed(bedNumber, locationId, bedTypeId, userId);
  }

  static async assignPatientToBed(bedUuid: string, patientUuid: string, encounterUuid: string, userId: number) {
    const bed = await BedDal.getBedById(bedUuid);
    if (!bed) throw new Error('Bed not found');
    if (bed.status === 'OCCUPIED') throw new Error('Bed is already occupied');

    return BedDal.assignPatientToBed(bedUuid, patientUuid, encounterUuid, userId);
  }

  static async dischargePatientFromBed(assignmentUuid: string, userId: number) {
    return BedDal.dischargePatientFromBed(assignmentUuid, userId);
  }

  static async transferPatient(assignmentUuid: string, newBedUuid: string, userId: number) {
    return BedDal.transferPatient(assignmentUuid, newBedUuid, userId);
  }
}
