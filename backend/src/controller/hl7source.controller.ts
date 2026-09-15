import { Request, Response } from 'express';
import { Hl7sourceService } from '../services/hl7source.service';
import { RepresentationEngine } from '../utils/representation.engine';

export const getAll = async (req: Request, res: Response) => {
  try {
    const results = await Hl7sourceService.getAll();
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await Hl7sourceService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const result = await Hl7sourceService.create(req.body);
    const v = req.query.v as string || 'default';
    res.status(201).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await Hl7sourceService.update(req.params.id, req.body);
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await Hl7sourceService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
