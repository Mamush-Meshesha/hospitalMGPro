import { prisma } from '../utils/prisma';

export class ProgramDAL {
  static async getAll() {
    return await prisma.program.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.program.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    const { v4: uuidv4 } = await import('uuid');
    return await prisma.program.create({ 
      data: {
        ...data,
        uuid: uuidv4(),
        date_created: new Date(),
        retired: false
      } 
    });
  }

  static async update(id: string, data: any) {
    return await prisma.program.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.program.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true } 
    });
  }
}
