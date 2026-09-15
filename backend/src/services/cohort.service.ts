import { CohortDAL } from '../dal/cohort.dal';

export class CohortService {
  static async getAll() {
    return await CohortDAL.getAll();
  }

  static async getById(id: string) {
    return await CohortDAL.getById(id);
  }

  static async create(data: any) {
    return await CohortDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await CohortDAL.update(id, data);
  }

  static async remove(id: string) {
    return await CohortDAL.remove(id);
  }
}
