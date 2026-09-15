import { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';

export const listBatches = async (req: Request, res: Response) => {
  try {
    const batches = await inventoryService.listBatches();
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBatch = async (req: Request, res: Response) => {
  try {
    const batch = await inventoryService.getBatch(Number(req.params.id));
    res.json(batch);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const newBatch = await inventoryService.addBatch(req.body);
    res.status(201).json(newBatch);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const updated = await inventoryService.editBatch(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    await inventoryService.removeBatch(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
