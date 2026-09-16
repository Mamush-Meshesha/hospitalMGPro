import { ObsDAL } from '../dal/obs.dal';

export class ObsService {
  static async getAll(personUuid?: string, privileges?: string[], authLocationId?: number) {
    if (personUuid) {
      return await ObsDAL.getByPerson(personUuid, privileges, authLocationId);
    }
    return await ObsDAL.getAll(privileges, authLocationId);
  }

  static async getById(id: string) {
    return await ObsDAL.getById(id);
  }

  static async create(data: any) {
    return await ObsDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ObsDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ObsDAL.remove(id);
  }
}
