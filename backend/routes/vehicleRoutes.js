import express from 'express';
import {
  getVehicles,
  getVehicleById,
  getSuggestedVehicles,
  getVehiclesByType,
  createVehicle,
} from '../controllers/vehicleController.js';

const router = express.Router();

// Public routes
router.route('/').get(getVehicles).post(createVehicle);
router.post('/suggest', getSuggestedVehicles);
router.get('/type/:vehicleType', getVehiclesByType);
router.get('/:id', getVehicleById);

export default router;