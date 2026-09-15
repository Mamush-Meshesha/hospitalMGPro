import { Router } from 'express';
import * as controller from '../../controller/appointment.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/services', requireAuth, controller.getServices);
router.get('/all', requireAuth, controller.getAllAppointments);
router.get('/patient/:patientUuid', requireAuth, controller.getPatientAppointments);
router.post('/book', requireAuth, controller.bookAppointment);
router.patch('/:uuid/status', requireAuth, controller.updateStatus);
router.put('/:uuid/reschedule', requireAuth, controller.rescheduleAppointment);

export default router;
