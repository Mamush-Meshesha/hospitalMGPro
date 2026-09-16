import { Router } from 'express';
import poRoutes from './po.routes';
import productRoutes from './product.routes';
import stockRoutes from './stock.routes';
import supplierRoutes from './supplier.routes';

import categoryRoutes from './category.routes';
import warehouseRoutes from './warehouse.routes';
import inventoryRoutes from './inventory.routes';
import invoiceRoutes from './invoice.routes';
import stockMovementRoutes from './stockMovement.routes';
import uomRoutes from './uom.routes';

const router = Router();

router.use('/po', poRoutes);
router.use('/products', productRoutes);
router.use('/stock', stockRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/categories', categoryRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/movements', stockMovementRoutes);
router.use('/uom', uomRoutes);

export default router;
