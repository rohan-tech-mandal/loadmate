import express from 'express';
import { uploadVehicleImage, deleteVehicleImage, getOptimizedImageUrl } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Upload vehicle image
router.post('/vehicles/:vehicleId/upload', protect, upload.single('image'), uploadVehicleImage);

// Delete vehicle image
router.delete('/vehicles/:vehicleId/images/:imageId', protect, deleteVehicleImage);

// Get optimized image URL
router.get('/optimize/:publicId', getOptimizedImageUrl);

export default router;
