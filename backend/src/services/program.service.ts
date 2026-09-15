import { ProgramDAL } from '../dal/program.dal';

export class ProgramService {
  static async getAll() {
    return await ProgramDAL.getAll();
  }

  static async getById(id: string) {
    return await ProgramDAL.getById(id);
  }

  static async create(data: any) {
    return await ProgramDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ProgramDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ProgramDAL.remove(id);
  }
}
