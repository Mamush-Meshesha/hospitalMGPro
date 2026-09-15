import { TaskactionDAL } from '../dal/taskaction.dal';

export class TaskactionService {
  static async getAll() {
    return await TaskactionDAL.getAll();
  }

  static async getById(id: string) {
    return await TaskactionDAL.getById(id);
  }

  static async create(data: any) {
    return await TaskactionDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await TaskactionDAL.update(id, data);
  }

  static async remove(id: string) {
    return await TaskactionDAL.remove(id);
  }
}
