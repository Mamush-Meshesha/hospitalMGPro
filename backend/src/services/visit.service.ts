import { VisitDAL } from '../dal/visit.dal';

export class VisitService {
  static async getAll(locationId?: number) {
    return await VisitDAL.getAll(locationId);
  }

  static async getById(id: string) {
    return await VisitDAL.getById(id);
  }

  static async create(data: any) {
    return await VisitDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await VisitDAL.update(id, data);
  }

  static async remove(id: string) {
    return await VisitDAL.remove(id);
  }

  static async admit(patientUuid: string, locationUuid: string, visitTypeUuid: string, creatorId: number) {
    return await VisitDAL.admit(patientUuid, locationUuid, visitTypeUuid, creatorId);
  }

  static async transfer(visitUuid: string, locationUuid: string, creatorId: number) {
    return await VisitDAL.transfer(visitUuid, locationUuid, creatorId);
  }

  static async updateAssignment(visitUuid: string, locationUuid: string | null, bedUuid: string | null, providerUuid: string | null, creatorId: number) {
    return await VisitDAL.updateAssignment(visitUuid, locationUuid, bedUuid, providerUuid, creatorId);
  }

  static async discharge(visitUuid: string, creatorId: number) {
    return await VisitDAL.discharge(visitUuid, creatorId);
  }
}
