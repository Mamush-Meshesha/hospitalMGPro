import { PersonattributetypeDAL } from '../dal/personattributetype.dal';

export class PersonattributetypeService {
  static async getAll() {
    return await PersonattributetypeDAL.getAll();
  }

  static async getById(id: string) {
    return await PersonattributetypeDAL.getById(id);
  }

  static async create(data: any) {
    return await PersonattributetypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await PersonattributetypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await PersonattributetypeDAL.remove(id);
  }
}
