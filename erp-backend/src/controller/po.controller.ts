import { Request, Response } from 'express';
import * as poService from '../services/po.service';

export const listPOs = async (req: Request, res: Response) => {
  try {
    const pos = await poService.listPOs();
    res.json(pos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPO = async (req: Request, res: Response) => {
  try {
    const po = await poService.getPODetails(Number(req.params.id));
    res.json(po);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createPO = async (req: Request, res: Response) => {
  try {
    // Assuming auth middleware injects user
    const userId = req.body.user?.userId || 1; 
    const newPO = await poService.createPurchaseOrder({ ...req.body, created_by: userId });
    res.status(201).json(newPO);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};



export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status, approvedBy } = req.body;
    const updated = await poService.updateStatus(Number(req.params.id), status, approvedBy);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePO = async (req: Request, res: Response) => {
  try {
    const updated = await poService.updatePO(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePO = async (req: Request, res: Response) => {
  try {
    await poService.deletePO(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
