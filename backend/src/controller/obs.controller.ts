import { Request, Response } from 'express';
import { ObsService } from '../services/obs.service';
import { RepresentationEngine } from '../utils/representation.engine';
import { CdsService } from '../services/cds.service';

export const getAll = async (req: Request, res: Response) => {
  try {
    const personUuid = req.query.personUuid as string;
    const results = await ObsService.getAll(personUuid);
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await ObsService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || 1;
    const result = await CdsService.submitObservation(req.body, userId);
    
    // Using default representation for the observation part
    res.status(201).json({
      ...result,
      observation: RepresentationEngine.format(result.observation, req.query.v as string || 'default')
    });
  } catch (error: any) {
    if (error.message.includes("CDS Validation Error")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await ObsService.update(req.params.id, req.body);
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await ObsService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
