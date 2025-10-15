import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { vehicleImageUpload } from '../config/cloudinary.js';
import {
  uploadVehicleImage,
  deleteVehicleImage,
  getOptimizedImageUrl
} from '../controllers/imageController.js';

const router = express.Router();

// Upload vehicle image
router.post(
  '/vehicles/:vehicleId/upload',
  protect,
  vehicleImageUpload.single('image'),
  uploadVehicleImage
);

// Delete vehicle image
router.delete(
  '/vehicles/:vehicleId/images/:imageId',
  protect,
  deleteVehicleImage
);

// Get optimized image URL
router.get(
  '/images/:publicId/optimize',
  getOptimizedImageUrl
);

export default router;
