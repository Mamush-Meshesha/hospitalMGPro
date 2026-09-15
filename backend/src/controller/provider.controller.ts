import { Request, Response } from 'express';
import { ProviderService } from '../services/provider.service';
import { RepresentationEngine } from '../utils/representation.engine';

export const getAll = async (req: Request, res: Response) => {
  try {
    const results = await ProviderService.getAll();
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await ProviderService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const result = await ProviderService.create(req.body);
    const v = req.query.v as string || 'default';
    res.status(201).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await ProviderService.update(req.params.id, req.body);
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await ProviderService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignWard = async (req: Request, res: Response) => {
  try {
    const { locationUuid } = req.body;
    const userId = req.user?.userId || 1;
    
    if (!locationUuid) return res.status(400).json({ error: 'locationUuid is required' });

    const result = await ProviderService.assignWard(req.params.id, locationUuid, userId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
