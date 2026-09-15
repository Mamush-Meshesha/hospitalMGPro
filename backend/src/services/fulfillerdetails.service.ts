import { FulfillerdetailsDAL } from '../dal/fulfillerdetails.dal';

export class FulfillerdetailsService {
  static async getAll() {
    return await FulfillerdetailsDAL.getAll();
  }

  static async getById(id: string) {
    return await FulfillerdetailsDAL.getById(id);
  }

  static async create(data: any) {
    return await FulfillerdetailsDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await FulfillerdetailsDAL.update(id, data);
  }

  static async remove(id: string) {
    return await FulfillerdetailsDAL.remove(id);
  }
}
