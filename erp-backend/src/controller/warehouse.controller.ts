import { Request, Response } from 'express';
import * as warehouseService from '../services/warehouse.service';

export const listWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await warehouseService.listWarehouses();
    res.json(warehouses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWarehouse = async (req: Request, res: Response) => {
  try {
    const warehouse = await warehouseService.getWarehouse(Number(req.params.id));
    res.json(warehouse);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const newWarehouse = await warehouseService.addWarehouse(req.body);
    res.status(201).json(newWarehouse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const updated = await warehouseService.editWarehouse(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    await warehouseService.removeWarehouse(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listBranches = async (req: Request, res: Response) => {
  try {
    const branches = await warehouseService.listBranches();
    res.json(branches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const newBranch = await warehouseService.addBranch(req.body);
    res.status(201).json(newBranch);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
