import { NametemplateDAL } from '../dal/nametemplate.dal';

export class NametemplateService {
  static async getAll() {
    return await NametemplateDAL.getAll();
  }

  static async getById(id: string) {
    return await NametemplateDAL.getById(id);
  }

  static async create(data: any) {
    return await NametemplateDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await NametemplateDAL.update(id, data);
  }

  static async remove(id: string) {
    return await NametemplateDAL.remove(id);
  }
}
