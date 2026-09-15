import { PersonDAL } from '../dal/person.dal';

export class PersonService {
  static async getAll() {
    return await PersonDAL.getAll();
  }

  static async getById(id: string) {
    return await PersonDAL.getById(id);
  }

  static async create(data: any) {
    return await PersonDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await PersonDAL.update(id, data);
  }

  static async remove(id: string) {
    return await PersonDAL.remove(id);
  }
}
