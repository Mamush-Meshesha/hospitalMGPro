import { Router } from 'express';
import { BillingController } from '../../controller/billing.controller';

const router = Router();

router.get('/config', BillingController.getConfig);
router.post('/routing', BillingController.updateRouting);
router.post('/assign-cashier', BillingController.assignCashier);

router.get('/', BillingController.getAllBills);
router.get('/:uuid', BillingController.getBillById);
router.get('/patient/:patientUuid', BillingController.getBillsByPatient);
router.post('/generate', BillingController.generateBill);
router.post('/:uuid/pay', BillingController.processPayment);

export default router;
