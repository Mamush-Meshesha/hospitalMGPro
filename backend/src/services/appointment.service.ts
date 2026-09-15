import { AppointmentDal } from '../dal/appointment.dal';

export class AppointmentService {
  static async getServices() {
    return AppointmentDal.getServices();
  }

  static async getPatientAppointments(patientUuid: string) {
    return AppointmentDal.getPatientAppointments(patientUuid);
  }

  static async getAllAppointments(filters?: { startDate?: string, endDate?: string, locationId?: number, providerId?: number }) {
    return AppointmentDal.getAllAppointments(filters);
  }

  static async rescheduleAppointment(uuid: string, startDateTime: string, endDateTime: string, providerUuid?: string, userId?: number) {
    return AppointmentDal.rescheduleAppointment(uuid, startDateTime, endDateTime, providerUuid, userId);
  }

  static async bookAppointment(data: any, userId: number) {
    return AppointmentDal.bookAppointment(data, userId);
  }

  static async updateStatus(uuid: string, status: string, userId: number) {
    return AppointmentDal.updateStatus(uuid, status, userId);
  }
}
