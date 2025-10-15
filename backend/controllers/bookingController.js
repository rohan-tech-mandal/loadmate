import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = asyncHandler(async (req, res) => {
  console.log('Creating booking with data:', req.body);
  console.log('User from middleware:', req.user);
  
  // Only customers can create bookings
  if (req.user.role !== 'customer') {
    res.status(403);
    throw new Error('Only customers can create bookings');
  }
  
  const {
    vehicleId,
    pickupLocation,
    dropLocation,
    loadWeight,
    loadDimensions,
    materialType,
    distance,
    scheduledDate,
    scheduledTime,
    notes,
  } = req.body;

  // Validate required fields
  if (!vehicleId || !pickupLocation || !dropLocation || !loadWeight || !scheduledDate) {
    res.status(400);
    throw new Error('Please provide all required booking details');
  }

  // Get vehicle to calculate fare
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  // Calculate fare
  const estimatedDistance = distance || 50; // Default 50km if not provided
  const baseFare = vehicle.baseFarePerKm * estimatedDistance;
  const loadingCharges = vehicle.loadingCharge || 0;
  const totalFare = baseFare + loadingCharges;

  // Create booking
  let booking;
  try {
    booking = await Booking.create({
      user: req.user._id, // From protect middleware
      vehicle: vehicleId,
      pickupLocation,
      dropLocation,
      loadWeight,
      loadDimensions,
      materialType,
      distance: estimatedDistance,
      fare: {
        baseFare,
        loadingCharges,
        totalFare,
      },
      scheduledDate: new Date(scheduledDate), // Convert string to Date object
      scheduledTime,
      notes,
      status: 'pending',
      ownerApproval: {
        status: 'pending',
      },
    });
    console.log('Booking created successfully:', booking._id);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }

  // Populate vehicle and user details
  await booking.populate('vehicle');
  await booking.populate('user', 'name email phone');

  res.status(201).json(booking);
});

/**
 * @desc    Get all bookings for logged in user
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('vehicle')
    .sort({ createdAt: -1 }); // Most recent first

  res.json(bookings);
});

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('vehicle')
    .populate('user', 'name email phone');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure user can only access their own bookings
  if (booking.user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this booking');
  }

  res.json(booking);
});

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure user can only update their own bookings
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this booking');
  }

  booking.status = status || booking.status;
  const updatedBooking = await booking.save();

  await updatedBooking.populate('vehicle');
  await updatedBooking.populate('user', 'name email phone');

  res.json(updatedBooking);
});

/**
 * @desc    Delete/Cancel booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure user can only cancel their own bookings
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to cancel this booking');
  }

  // Update status to cancelled instead of deleting
  booking.status = 'cancelled';
  await booking.save();

  res.json({ message: 'Booking cancelled successfully' });
});

/**
 * @desc    Approve booking (Owner only)
 * @route   PUT /api/bookings/:id/approve
 * @access  Private/Owner
 */
const approveBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('vehicle');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the vehicle belongs to this owner
  if (booking.vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to approve this booking');
  }

  // Check if booking is still pending approval
  if (booking.ownerApproval.status !== 'pending') {
    res.status(400);
    throw new Error('Booking has already been processed');
  }

  // Approve the booking
  booking.ownerApproval.status = 'approved';
  booking.ownerApproval.approvedAt = new Date();
  booking.status = 'confirmed'; // Change status to confirmed when approved

  const updatedBooking = await booking.save();
  await updatedBooking.populate('vehicle');
  await updatedBooking.populate('user', 'name email phone');

  res.json(updatedBooking);
});

/**
 * @desc    Reject booking (Owner only)
 * @route   PUT /api/bookings/:id/reject
 * @access  Private/Owner
 */
const rejectBooking = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const booking = await Booking.findById(req.params.id).populate('vehicle');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the vehicle belongs to this owner
  if (booking.vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to reject this booking');
  }

  // Check if booking is still pending approval
  if (booking.ownerApproval.status !== 'pending') {
    res.status(400);
    throw new Error('Booking has already been processed');
  }

  // Reject the booking
  booking.ownerApproval.status = 'rejected';
  booking.ownerApproval.rejectedAt = new Date();
  booking.ownerApproval.rejectionReason = rejectionReason || 'No reason provided';
  booking.status = 'cancelled'; // Change status to cancelled when rejected

  const updatedBooking = await booking.save();
  await updatedBooking.populate('vehicle');
  await updatedBooking.populate('user', 'name email phone');

  res.json(updatedBooking);
});

export {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  approveBooking,
  rejectBooking,
};