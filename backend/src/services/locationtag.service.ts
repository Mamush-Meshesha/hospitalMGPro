import { LocationtagDAL } from '../dal/locationtag.dal';

export class LocationtagService {
  static async getAll() {
    return await LocationtagDAL.getAll();
  }

  static async getById(id: string) {
    return await LocationtagDAL.getById(id);
  }

  static async create(data: any) {
    return await LocationtagDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await LocationtagDAL.update(id, data);
  }

  static async remove(id: string) {
    return await LocationtagDAL.remove(id);
  }
}
