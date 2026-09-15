import { SubdetailsDAL } from '../dal/subdetails.dal';

export class SubdetailsService {
  static async getAll() {
    return await SubdetailsDAL.getAll();
  }

  static async getById(id: string) {
    return await SubdetailsDAL.getById(id);
  }

  static async create(data: any) {
    return await SubdetailsDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await SubdetailsDAL.update(id, data);
  }

  static async remove(id: string) {
    return await SubdetailsDAL.remove(id);
  }
}
