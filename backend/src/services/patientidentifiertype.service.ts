import { PatientidentifiertypeDAL } from '../dal/patientidentifiertype.dal';

export class PatientidentifiertypeService {
  static async getAll() {
    return await PatientidentifiertypeDAL.getAll();
  }

  static async getById(id: string) {
    return await PatientidentifiertypeDAL.getById(id);
  }

  static async create(data: any) {
    return await PatientidentifiertypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await PatientidentifiertypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await PatientidentifiertypeDAL.remove(id);
  }
}
