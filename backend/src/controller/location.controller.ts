import { Request, Response } from 'express';
import { LocationService } from '../services/location.service';
import { RepresentationEngine } from '../utils/representation.engine';

export const getAll = async (req: Request, res: Response) => {
  try {
    const results = await LocationService.getAll();
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await LocationService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { capacity, ...locationData } = req.body;
    const result = await LocationService.create(locationData);
    
    // If capacity was provided, set it immediately after creation
    if (capacity !== undefined) {
      await LocationService.setTotalCapacity(result.uuid, parseInt(capacity, 10));
    }

    const v = req.query.v as string || 'default';
    res.status(201).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await LocationService.update(req.params.id, req.body);
    const v = req.query.v as string || 'default';
    res.status(200).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await LocationService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const setCapacity = async (req: Request, res: Response) => {
  try {
    const { capacity } = req.body;
    if (capacity === undefined) {
      return res.status(400).json({ error: 'Capacity is required' });
    }
    const result = await LocationService.setTotalCapacity(req.params.id, parseInt(capacity, 10));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
