import { TaskdefinitionDAL } from '../dal/taskdefinition.dal';

export class TaskdefinitionService {
  static async getAll() {
    return await TaskdefinitionDAL.getAll();
  }

  static async getById(id: string) {
    return await TaskdefinitionDAL.getById(id);
  }

  static async create(data: any) {
    return await TaskdefinitionDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await TaskdefinitionDAL.update(id, data);
  }

  static async remove(id: string) {
    return await TaskdefinitionDAL.remove(id);
  }
}
