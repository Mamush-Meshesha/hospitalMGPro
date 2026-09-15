import { Request, Response } from 'express';
import { VisitService } from '../services/visit.service';
import { RepresentationEngine } from '../utils/representation.engine';

export const getAll = async (req: Request, res: Response) => {
  try {
    const results = await VisitService.getAll(req.locationId);
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await VisitService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const result = await VisitService.create(req.body);
    const v = req.query.v as string || 'default';
    res.status(201).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await VisitService.update(req.params.id, req.body);
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await VisitService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const admit = async (req: Request, res: Response) => {
  try {
    const { patientUuid, locationUuid, visitTypeUuid } = req.body;
    const userId = req.user?.userId || 1;
    if (!patientUuid || !locationUuid || !visitTypeUuid) return res.status(400).json({ error: 'Missing required fields' });

    const result = await VisitService.admit(patientUuid, locationUuid, visitTypeUuid, userId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const transfer = async (req: Request, res: Response) => {
  try {
    const { locationUuid } = req.body;
    const userId = req.user?.userId || 1;
    if (!locationUuid) return res.status(400).json({ error: 'locationUuid required' });

    const result = await VisitService.transfer(req.params.id, locationUuid, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { locationUuid, bedUuid, providerUuid } = req.body;
    const userId = req.user?.userId || 1;
    const result = await VisitService.updateAssignment(req.params.id, locationUuid, bedUuid, providerUuid, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const discharge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || 1;
    const result = await VisitService.discharge(req.params.id, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
