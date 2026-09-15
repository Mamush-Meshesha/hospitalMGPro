import { PatientdiagnosesDAL } from '../dal/patientdiagnoses.dal';

export class PatientdiagnosesService {
  static async getAll() {
    return await PatientdiagnosesDAL.getAll();
  }

  static async getById(id: string) {
    return await PatientdiagnosesDAL.getById(id);
  }

  static async create(data: any) {
    return await PatientdiagnosesDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await PatientdiagnosesDAL.update(id, data);
  }

  static async remove(id: string) {
    return await PatientdiagnosesDAL.remove(id);
  }
}
