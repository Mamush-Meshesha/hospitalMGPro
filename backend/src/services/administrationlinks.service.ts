import { AdministrationlinksDAL } from '../dal/administrationlinks.dal';

export class AdministrationlinksService {
  static async getAll() {
    return await AdministrationlinksDAL.getAll();
  }

  static async getById(id: string) {
    return await AdministrationlinksDAL.getById(id);
  }

  static async create(data: any) {
    return await AdministrationlinksDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await AdministrationlinksDAL.update(id, data);
  }

  static async remove(id: string) {
    return await AdministrationlinksDAL.remove(id);
  }
}
