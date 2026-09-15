import { Request, Response } from 'express';
import * as supplierService from '../services/supplier.service';

export const listSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await supplierService.listSuppliers();
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await supplierService.getSupplierDetails(Number(req.params.id));
    res.json(supplier);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const newSupplier = await supplierService.addSupplier(req.body);
    res.status(201).json(newSupplier);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const updated = await supplierService.updateSupplier(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    await supplierService.deleteSupplier(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
