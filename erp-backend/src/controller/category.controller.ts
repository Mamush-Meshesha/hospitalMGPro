import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategory(Number(req.params.id));
    res.json(category);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const newCat = await categoryService.addCategory(req.body);
    res.status(201).json(newCat);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const updated = await categoryService.editCategory(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.removeCategory(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createUom = async (req: Request, res: Response) => {
  try {
    const newUom = await categoryService.addUom(req.body);
    res.status(201).json(newUom);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUom = async (req: Request, res: Response) => {
  try {
    const updated = await categoryService.editUom(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUom = async (req: Request, res: Response) => {
  try {
    await categoryService.removeUom(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
