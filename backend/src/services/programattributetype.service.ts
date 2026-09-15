import { ProgramattributetypeDAL } from '../dal/programattributetype.dal';

export class ProgramattributetypeService {
  static async getAll() {
    return await ProgramattributetypeDAL.getAll();
  }

  static async getById(id: string) {
    return await ProgramattributetypeDAL.getById(id);
  }

  static async create(data: any) {
    return await ProgramattributetypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ProgramattributetypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ProgramattributetypeDAL.remove(id);
  }
}
