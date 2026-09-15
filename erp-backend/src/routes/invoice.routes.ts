import { Router } from 'express';
import * as invoiceController from '../controller/invoice.controller';

const router = Router();

router.get('/', invoiceController.listInvoices);
router.get('/:id', invoiceController.getInvoice);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

export default router;
