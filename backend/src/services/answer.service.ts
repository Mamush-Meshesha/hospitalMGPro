import { AnswerDAL } from '../dal/answer.dal';

export class AnswerService {
  static async getAll() {
    return await AnswerDAL.getAll();
  }

  static async getById(id: string) {
    return await AnswerDAL.getById(id);
  }

  static async create(data: any) {
    return await AnswerDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await AnswerDAL.update(id, data);
  }

  static async remove(id: string) {
    return await AnswerDAL.remove(id);
  }
}
