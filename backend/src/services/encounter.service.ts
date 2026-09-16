import { EncounterDAL, CreateEncounterInput } from '../dal/encounter.dal';

export class EncounterService {
  static async getAll(date?: string, queryLocationId?: number, providerId?: number, privileges?: string[], authLocationId?: number) {
    return await EncounterDAL.getAll(date, queryLocationId, providerId, privileges, authLocationId);
  }

  static async getById(id: string) {
    return await EncounterDAL.getById(id);
  }

  static async create(input: CreateEncounterInput) {
    return await EncounterDAL.create(input);
  }

  static async update(id: string, data: any) {
    return await EncounterDAL.update(id, data);
  }

  static async remove(id: string, voidedBy?: number) {
    return await EncounterDAL.remove(id, voidedBy);
  }

  static async getByPatient(patientUuid: string, privileges?: string[], authLocationId?: number) {
    return await EncounterDAL.getByPatient(patientUuid, privileges, authLocationId);
  }
}
