import { MembershipDAL } from '../dal/membership.dal';

export class MembershipService {
  static async getAll() {
    return await MembershipDAL.getAll();
  }

  static async getById(id: string) {
    return await MembershipDAL.getById(id);
  }

  static async create(data: any) {
    return await MembershipDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await MembershipDAL.update(id, data);
  }

  static async remove(id: string) {
    return await MembershipDAL.remove(id);
  }
}
