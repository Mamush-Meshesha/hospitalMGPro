import { Request, Response } from 'express';
import { BedTypeDal } from '../dal/bedType.dal';
import { RepresentationEngine } from '../utils/representation.engine';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await BedTypeDal.getAll();
    res.json({ results: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await BedTypeDal.getById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.user_id || 1;
    const data = await BedTypeDal.create({ ...req.body, creator: userId });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.user_id || 1;
    const data = await BedTypeDal.update(req.params.id, { ...req.body, changed_by: userId });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.user_id || 1;
    const data = await BedTypeDal.remove(req.params.id, userId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
