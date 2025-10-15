import express from 'express';
import {
  registerAsOwner,
  getOwnerStats,
  addVehicle,
  getOwnerVehicles,
  updateVehicle,
  deleteVehicle,
  getOwnerBookings,
  getPendingBookings,
  updateOwnerBookingStatus,
} from '../controllers/ownerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { owner } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Register as owner (requires authentication only)
router.post('/register', protect, registerAsOwner);

// All other routes require owner role
router.get('/stats', protect, owner, getOwnerStats);
router.route('/vehicles')
  .get(protect, owner, getOwnerVehicles)
  .post(protect, owner, addVehicle);
router.route('/vehicles/:id')
  .put(protect, owner, updateVehicle)
  .delete(protect, owner, deleteVehicle);
router.get('/bookings', protect, owner, getOwnerBookings);
router.get('/bookings/pending', protect, owner, getPendingBookings);
router.put('/bookings/:id/status', protect, owner, updateOwnerBookingStatus);

export default router;