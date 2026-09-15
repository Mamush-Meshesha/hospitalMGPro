import { ProviderattributetypeDAL } from '../dal/providerattributetype.dal';

export class ProviderattributetypeService {
  static async getAll() {
    return await ProviderattributetypeDAL.getAll();
  }

  static async getById(id: string) {
    return await ProviderattributetypeDAL.getById(id);
  }

  static async create(data: any) {
    return await ProviderattributetypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ProviderattributetypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ProviderattributetypeDAL.remove(id);
  }
}
