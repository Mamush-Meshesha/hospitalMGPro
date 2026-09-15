import { IngredientDAL } from '../dal/ingredient.dal';

export class IngredientService {
  static async getAll() {
    return await IngredientDAL.getAll();
  }

  static async getById(id: string) {
    return await IngredientDAL.getById(id);
  }

  static async create(data: any) {
    return await IngredientDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await IngredientDAL.update(id, data);
  }

  static async remove(id: string) {
    return await IngredientDAL.remove(id);
  }
}
