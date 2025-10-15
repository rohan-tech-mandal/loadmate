import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  approveBooking,
  rejectBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All booking routes require authentication
router.route('/').post(protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.route('/:id')
  .get(protect, getBookingById)
  .delete(protect, cancelBooking);
router.put('/:id/status', protect, updateBookingStatus);

// Owner approval routes
router.put('/:id/approve', protect, approveBooking);
router.put('/:id/reject', protect, rejectBooking);

export default router;