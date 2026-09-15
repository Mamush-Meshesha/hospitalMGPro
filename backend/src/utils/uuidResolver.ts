import { prisma } from './prisma';

export class UuidResolver {
  /**
   * Translates a UUID into its internal integer Primary Key
   */
  static async resolve(tableName: string, uuid: string): Promise<number | null> {
    try {
      // @ts-ignore
      const model = prisma[tableName];
      if (!model) return null;
      
      const record = await model.findFirst({
        where: { uuid },
        select: { [`${tableName}_id`]: true }
      });
      
      return record ? record[`${tableName}_id`] : null;
    } catch (e) {
      return null;
    }
  }
}
