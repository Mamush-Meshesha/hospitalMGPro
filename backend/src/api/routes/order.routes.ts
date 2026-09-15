import { Router } from 'express';
import * as controller from '../../controller/order.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../lib/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'radiology_scans',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'dcm'],
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for scans
}).single('file');

const router = Router();

router.get('/', requireAuth, controller.getAll);
router.post('/', requireAuth, controller.create);
router.get('/pharmacy-queue', requireAuth, controller.pharmacyQueue);
router.get('/:id', requireAuth, controller.getById);
router.post('/:id/dispense', requireAuth, controller.dispense);
router.post('/:id/lab-result', requireAuth, controller.enterLabResult);
router.post('/:id/upload-image', requireAuth, upload, controller.uploadRadiologyImage);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
