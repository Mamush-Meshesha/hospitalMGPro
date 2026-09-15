import { Router } from 'express';
import { DiagnosisController } from '../../controller/diagnosis.controller';

const router = Router();

router.post('/', DiagnosisController.addDiagnosis);

export default router;
