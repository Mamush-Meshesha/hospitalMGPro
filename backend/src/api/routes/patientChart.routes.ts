import { Router } from 'express';
import { PatientChartController } from '../../controller/patientChart.controller';

const router = Router();

router.get('/:id/full', PatientChartController.getFullChart);
router.get('/:id/vitals', PatientChartController.getVitals);
router.post('/:id/vitals', PatientChartController.postVitals);
router.get('/:id/conditions', PatientChartController.getConditions);
router.post('/:id/conditions', PatientChartController.postCondition);
router.get('/:id/allergies', PatientChartController.getAllergies);
router.post('/:id/allergies', PatientChartController.postAllergy);
router.get('/:id/notes', PatientChartController.getNotes);
router.post('/:id/notes', PatientChartController.postNote);
router.get('/:id/orders', PatientChartController.getOrders);
router.post('/:id/orders', PatientChartController.postOrder);
router.post('/:id/immunizations', PatientChartController.postImmunization);
router.post('/:id/medications', PatientChartController.postMedication);

export default router;
