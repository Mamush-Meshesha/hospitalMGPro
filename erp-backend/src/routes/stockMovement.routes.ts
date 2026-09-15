import { Router } from 'express';
import * as stockMovementController from '../controller/stockMovement.controller';

const router = Router();

router.get('/', stockMovementController.listMovements);
router.get('/:id', stockMovementController.getMovement);
router.post('/', stockMovementController.createMovement);
router.put('/:id', stockMovementController.updateMovement);
router.delete('/:id', stockMovementController.deleteMovement);

export default router;
