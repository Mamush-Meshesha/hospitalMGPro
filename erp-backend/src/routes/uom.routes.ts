import { Router } from 'express';
import { getCategories, createCategory, getUOMs, createUOM, deleteUOM } from '../controller/uom.controller';

const router = Router();

// Category Routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);

// UOM Routes
router.get('/', getUOMs);
router.post('/', createUOM);
router.delete('/:id', deleteUOM);

export default router;
