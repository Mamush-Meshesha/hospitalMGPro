import { Request, Response } from 'express';
import * as stockMovementService from '../services/stockMovement.service';

export const listMovements = async (req: Request, res: Response) => {
  try {
    const movements = await stockMovementService.listMovements();
    res.json(movements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMovement = async (req: Request, res: Response) => {
  try {
    const movement = await stockMovementService.getMovement(Number(req.params.id));
    res.json(movement);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createMovement = async (req: Request, res: Response) => {
  try {
    const newMovement = await stockMovementService.addMovement(req.body);
    res.status(201).json(newMovement);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMovement = async (req: Request, res: Response) => {
  try {
    const updated = await stockMovementService.editMovement(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMovement = async (req: Request, res: Response) => {
  try {
    await stockMovementService.removeMovement(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
