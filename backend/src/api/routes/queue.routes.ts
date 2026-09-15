import { Router } from 'express';
import { QueueController } from '../../controller/queue.controller';

const router = Router();

router.get('/', QueueController.getAllQueues);
router.post('/', QueueController.createQueue);
router.get('/:id/entries', QueueController.getQueueEntries);
router.post('/:id/entries', QueueController.addPatientToQueue);
router.put('/entries/:entryId/status', QueueController.updateEntryStatus);

export default router;
