import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { RepresentationEngine } from '../utils/representation.engine';

export const getServices = async (req: Request, res: Response) => {
  try {
    const results = await AppointmentService.getServices();
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      locationId: req.query.locationId ? Number(req.query.locationId) : undefined,
      providerId: req.query.providerId ? Number(req.query.providerId) : undefined
    };
    const results = await AppointmentService.getAllAppointments(filters);
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const results = await AppointmentService.getPatientAppointments(req.params.patientUuid);
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || 1;
    const result = await AppointmentService.bookAppointment(req.body, userId);
    const v = req.query.v as string || 'default';
    res.status(201).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || 1;
    const result = await AppointmentService.updateStatus(req.params.uuid, req.body.status, userId);
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || 1;
    const { startDateTime, endDateTime, providerUuid } = req.body;
    const result = await AppointmentService.rescheduleAppointment(req.params.uuid, startDateTime, endDateTime, providerUuid, userId);
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
