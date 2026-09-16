import { Request, Response } from 'express';
import { prisma } from '../db';

// Get all UOM categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.erp_uom_category.findMany({
      include: {
        uoms: true
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching UOM categories:', error);
    res.status(500).json({ error: 'Failed to fetch UOM categories' });
  }
};

// Create a new UOM category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = await prisma.erp_uom_category.create({
      data: { name }
    });
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating UOM category:', error);
    res.status(500).json({ error: 'Failed to create UOM category' });
  }
};

// Get all UOMs
export const getUOMs = async (req: Request, res: Response) => {
  try {
    const uoms = await prisma.erp_uom.findMany({
      include: {
        category: true
      }
    });
    res.json(uoms);
  } catch (error) {
    console.error('Error fetching UOMs:', error);
    res.status(500).json({ error: 'Failed to fetch UOMs' });
  }
};

// Create a new UOM
export const createUOM = async (req: Request, res: Response) => {
  try {
    const { name, category_id, type, ratio } = req.body;
    
    if (!name || !category_id) {
      return res.status(400).json({ error: 'Name and category_id are required' });
    }

    const newUom = await prisma.erp_uom.create({
      data: {
        name,
        category_id: Number(category_id),
        type: type || 'REFERENCE',
        ratio: ratio ? Number(ratio) : 1.0
      },
      include: {
        category: true
      }
    });
    
    res.status(201).json(newUom);
  } catch (error) {
    console.error('Error creating UOM:', error);
    res.status(500).json({ error: 'Failed to create UOM' });
  }
};

// Delete a UOM
export const deleteUOM = async (req: Request, res: Response) => {
  try {
    const uom_id = Number(req.params.id);
    
    await prisma.erp_uom.delete({
      where: { uom_id }
    });
    
    res.json({ message: 'UOM deleted successfully' });
  } catch (error) {
    console.error('Error deleting UOM:', error);
    res.status(500).json({ error: 'Failed to delete UOM' });
  }
};
