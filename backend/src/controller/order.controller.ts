import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { RepresentationEngine } from '../utils/representation.engine';

export const getAll = async (req: Request, res: Response) => {
  try {
    const patientUuid = req.query.patientUuid as string;
    const privileges = req.user?.privileges as string[] | undefined;
    const results = await OrderService.getAll(patientUuid, privileges);
    res.status(200).json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const result = await OrderService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if(!userId) return res.status(401).json({ error: 'Unauthorized' });
    const result = await OrderService.placeOrder(req.body, userId);
    const v = req.query.v as string || 'default';
    res.status(201).json(RepresentationEngine.format(result, v));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const result = await OrderService.update(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await OrderService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const pharmacyQueue = async (req: Request, res: Response) => {
  try {
    const results = await OrderService.getPharmacyQueue();
    const v = req.query.v as string || 'default';
    res.status(200).json({ results: RepresentationEngine.format(results, v) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const dispense = async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    if (!quantity) return res.status(400).json({ error: "Quantity dispensed is required." });
    
    const result = await OrderService.dispense(req.params.id, quantity);
    res.status(200).json(RepresentationEngine.format(result, 'default'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const enterLabResult = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || 1;
    const result = await OrderService.enterLabResult(req.params.id, req.body, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadRadiologyImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || 1;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const fileUrl = req.file.path;
    const result = await OrderService.uploadRadiologyImage(req.params.id, fileUrl, userId);
    
    res.status(200).json(RepresentationEngine.format(result.order, 'default'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
