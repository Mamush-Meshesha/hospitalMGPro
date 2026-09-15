import { Request, Response } from 'express';
import { ConceptreferencerangeService } from '../services/conceptreferencerange.service';

export const getAll = async (req: Request, res: Response) => {
  try {
    const results = await ConceptreferencerangeService.getAll();
    res.status(200).json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await ConceptreferencerangeService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const result = await ConceptreferencerangeService.create(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await ConceptreferencerangeService.update(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await ConceptreferencerangeService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
