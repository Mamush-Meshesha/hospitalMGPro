import { Request, Response } from 'express';
import { z } from 'zod';
import { EncounterService } from '../services/encounter.service';
import { RepresentationEngine } from '../utils/representation.engine';

const createEncounterSchema = z.object({
  patientUuid: z.string().uuid('Invalid patient UUID'),
  encounterTypeId: z.number().int().positive('Encounter type is required'),
  locationId: z.number().int().positive().optional(),
  encounterDatetime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid datetime' }),
  providerId: z.number().int().positive().optional(),
  encounterRoleId: z.number().int().positive().optional(),
});

export const getAll = async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const providerId = req.user?.providerId;
    const results = await EncounterService.getAll(date, req.locationId, providerId);
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await EncounterService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Encounter not found' });
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user?.userId;
    if (!creatorId) return res.status(401).json({ error: 'Unauthorized' });

    const validated = createEncounterSchema.parse(req.body);
    const result = await EncounterService.create({ ...validated, creatorId });
    const v = req.query.v as string || 'default';
    res.status(201).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await EncounterService.update(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId ?? 1;
    await EncounterService.remove(req.params.id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getByPatient = async (req: Request, res: Response) => {
  try {
    const results = await EncounterService.getByPatient(req.params.patientUuid);
    res.status(200).json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
