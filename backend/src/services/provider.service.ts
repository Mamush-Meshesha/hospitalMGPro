import { ProviderDAL } from '../dal/provider.dal';

export class ProviderService {
  static async getAll() {
    return await ProviderDAL.getAll();
  }

  static async getById(id: string) {
    return await ProviderDAL.getById(id);
  }

  static async create(data: any) {
    return await ProviderDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ProviderDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ProviderDAL.remove(id);
  }

  static async assignWard(providerUuid: string, locationUuid: string, creatorId: number) {
    return await ProviderDAL.assignWard(providerUuid, locationUuid, creatorId);
  }
}
