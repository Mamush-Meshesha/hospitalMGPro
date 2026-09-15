import { Request, Response } from 'express';
import { BedService } from '../services/bed.service';
import { RepresentationEngine } from '../utils/representation.engine';

export const getAllBeds = async (req: Request, res: Response) => {
  try {
    const beds = await BedService.getAllBeds();
    res.json(RepresentationEngine.format(beds, 'default'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBedById = async (req: Request, res: Response) => {
  try {
    const bed = await BedService.getBedById(req.params.uuid);
    if (!bed) return res.status(404).json({ error: 'Bed not found' });
    res.json(RepresentationEngine.format(bed, 'full'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBed = async (req: Request, res: Response) => {
  try {
    const { bedNumber, locationId, bedTypeId } = req.body;
    const userId = (req as any).user?.user_id || 1;

    if (!bedNumber) return res.status(400).json({ error: 'bedNumber is required' });
    if (!locationId) return res.status(400).json({ error: 'locationId is required' });

    const bed = await BedService.createBed(bedNumber, Number(locationId), bedTypeId ? Number(bedTypeId) : null, userId);
    res.status(201).json(RepresentationEngine.format(bed, 'full'));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const assignPatientToBed = async (req: Request, res: Response) => {
  try {
    const { patientUuid, encounterUuid } = req.body;
    const userId = (req as any).user?.user_id || 1; // Fallback to 1 if not authenticated for now

    const assignment = await BedService.assignPatientToBed(req.params.uuid, patientUuid, encounterUuid, userId);
    res.status(201).json(RepresentationEngine.format(assignment, 'full'));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const dischargePatientFromBed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.user_id || 1;
    const assignment = await BedService.dischargePatientFromBed(req.params.assignmentUuid, userId);
    res.json(RepresentationEngine.format(assignment, 'full'));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const transferPatient = async (req: Request, res: Response) => {
  try {
    const { newBedUuid } = req.body;
    const userId = (req as any).user?.user_id || 1;
    if (!newBedUuid) return res.status(400).json({ error: 'newBedUuid is required' });
    const assignment = await BedService.transferPatient(req.params.assignmentUuid, newBedUuid, userId);
    res.json(RepresentationEngine.format(assignment, 'full'));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
