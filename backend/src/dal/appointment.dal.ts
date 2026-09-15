import { v4 as uuidv4 } from 'uuid';

import { prisma } from '../utils/prisma';

export class AppointmentDal {
  static async getServices() {
    return prisma.appointment_service.findMany({
      include: {
        appointment_speciality: true,
        location: true,
        appointment_service_type: true
      }
    });
  }

  static async getAllAppointments(filters?: { startDate?: string, endDate?: string, locationId?: number, providerId?: number }) {
    const whereClause: any = { voided: false };
    
    if (filters?.startDate && filters?.endDate) {
      whereClause.start_date_time = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      };
    }
    
    if (filters?.locationId) {
      whereClause.location_id = Number(filters.locationId);
    }

    if (filters?.providerId) {
      whereClause.provider_id = Number(filters.providerId);
    }

    return prisma.patient_appointment.findMany({
      where: whereClause,
      include: {
        appointment_service: true,
        location: true,
        provider: {
          include: { person_provider_person_id_fk: { include: { reverse_person_name_name_for_person: true } } }
        },
        patient: {
          include: { person_person_id_for_patient: { include: { reverse_person_name_name_for_person: true } } }
        }
      },
      orderBy: { start_date_time: 'asc' }
    });
  }

  static async getPatientAppointments(patientUuid: string) {
    const person = await prisma.person.findFirst({
      where: { uuid: patientUuid }
    });
    if (!person) throw new Error('Patient not found');

    return prisma.patient_appointment.findMany({
      where: { patient_id: person.person_id, voided: false },
      include: {
        appointment_service: true,
        location: true,
        provider: true
      },
      orderBy: { start_date_time: 'asc' }
    });
  }

  static async bookAppointment(data: any, userId: number) {
    const { patientUuid, serviceUuid, providerUuid, locationUuid, startDateTime, endDateTime, comments } = data;

    const person = await prisma.person.findFirst({ where: { uuid: patientUuid } });
    if (!person) throw new Error('Patient not found');

    let serviceId = null;
    if (serviceUuid) {
      const service = await prisma.appointment_service.findFirst({ where: { uuid: serviceUuid } });
      if (service) serviceId = service.appointment_service_id;
    }

    let providerId = null;
    if (providerUuid) {
      const provider = await prisma.provider.findFirst({ where: { uuid: providerUuid } });
      if (provider) providerId = provider.provider_id;
    }

    let locId = null;
    if (locationUuid) {
      const loc = await prisma.location.findFirst({ where: { uuid: locationUuid } });
      if (loc) locId = loc.location_id;
    }

    return prisma.patient_appointment.create({
      data: {
        patient_id: person.person_id,
        appointment_service_id: serviceId,
        provider_id: providerId,
        location_id: locId,
        start_date_time: startDateTime ? new Date(startDateTime) : null,
        end_date_time: endDateTime ? new Date(endDateTime) : null,
        status: 'Scheduled',
        appointment_kind: 'WALKIN',
        appointment_number: `APT-${Date.now()}`,
        comments: comments || null,
        uuid: uuidv4(),
        creator: userId,
        date_created: new Date()
      }
    });
  }

  static async updateStatus(uuid: string, status: string, userId: number) {
    const appointment = await prisma.patient_appointment.findFirst({ where: { uuid } });
    if (!appointment) throw new Error('Appointment not found');

    return prisma.patient_appointment.update({
      where: { patient_appointment_id: appointment.patient_appointment_id },
      data: {
        status,
        changed_by: userId,
        date_changed: new Date()
      }
    });
  }

  static async rescheduleAppointment(uuid: string, startDateTime: string, endDateTime: string, providerUuid?: string, userId?: number) {
    const appointment = await prisma.patient_appointment.findFirst({ where: { uuid } });
    if (!appointment) throw new Error('Appointment not found');

    const updateData: any = {
      start_date_time: new Date(startDateTime),
      end_date_time: new Date(endDateTime),
      changed_by: userId || 1,
      date_changed: new Date()
    };

    if (providerUuid) {
      const provider = await prisma.provider.findFirst({ where: { uuid: providerUuid } });
      if (provider) {
        updateData.provider_id = provider.provider_id;
      }
    }

    return prisma.patient_appointment.update({
      where: { patient_appointment_id: appointment.patient_appointment_id },
      data: updateData,
      include: {
        appointment_service: true,
        location: true,
        provider: {
          include: { person_provider_person_id_fk: { include: { reverse_person_name_name_for_person: true } } }
        },
        patient: {
          include: { person_person_id_for_patient: { include: { reverse_person_name_name_for_person: true } } }
        }
      }
    });
  }
}
