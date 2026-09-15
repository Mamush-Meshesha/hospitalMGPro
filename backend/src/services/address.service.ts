import { AddressDAL } from '../dal/address.dal';

export class AddressService {
  static async getAll() {
    return await AddressDAL.getAll();
  }

  static async getById(id: string) {
    return await AddressDAL.getById(id);
  }

  static async create(data: any) {
    return await AddressDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await AddressDAL.update(id, data);
  }

  static async remove(id: string) {
    return await AddressDAL.remove(id);
  }
}
