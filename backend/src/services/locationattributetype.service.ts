import { LocationattributetypeDAL } from '../dal/locationattributetype.dal';

export class LocationattributetypeService {
  static async getAll() {
    return await LocationattributetypeDAL.getAll();
  }

  static async getById(id: string) {
    return await LocationattributetypeDAL.getById(id);
  }

  static async create(data: any) {
    return await LocationattributetypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await LocationattributetypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await LocationattributetypeDAL.remove(id);
  }
}
