import { StateDAL } from '../dal/state.dal';

export class StateService {
  static async getAll() {
    return await StateDAL.getAll();
  }

  static async getById(id: string) {
    return await StateDAL.getById(id);
  }

  static async create(data: any) {
    return await StateDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await StateDAL.update(id, data);
  }

  static async remove(id: string) {
    return await StateDAL.remove(id);
  }
}
