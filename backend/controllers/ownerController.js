import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';

/**
 * @desc    Register as vehicle owner
 * @route   POST /api/owner/register
 * @access  Private
 */
const registerAsOwner = asyncHandler(async (req, res) => {
  const { businessName, licenseNumber } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'owner') {
    res.status(400);
    throw new Error('Already registered as vehicle owner');
  }

  user.role = 'owner';
  user.vehicleOwnerDetails = {
    businessName,
    licenseNumber,
    vehiclesOwned: [],
    isVerified: true, // Auto-verified upon registration
  };

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    vehicleOwnerDetails: updatedUser.vehicleOwnerDetails,
  });
});

/**
 * @desc    Get owner dashboard stats
 * @route   GET /api/owner/stats
 * @access  Private/Owner
 */
const getOwnerStats = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id });
  const vehicleIds = vehicles.map(v => v._id);

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.isAvailable).length;
  const approvedVehicles = vehicles.filter(v => v.approvalStatus === 'approved').length;
  const pendingVehicles = vehicles.filter(v => v.approvalStatus === 'pending').length;

  const bookings = await Booking.find({ vehicle: { $in: vehicleIds } });
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => 
    ['confirmed', 'in-transit'].includes(b.status)
  ).length;

  const totalEarnings = bookings
    .filter(b => b.status === 'delivered')
    .reduce((sum, b) => sum + b.fare.totalFare, 0);

  res.json({
    totalVehicles,
    activeVehicles,
    approvedVehicles,
    pendingVehicles,
    totalBookings,
    activeBookings,
    totalEarnings,
  });
});

/**
 * @desc    Add new vehicle
 * @route   POST /api/owner/vehicles
 * @access  Private/Owner
 */
const addVehicle = asyncHandler(async (req, res) => {
  const {
    type,
    capacity,
    dimensions,
    baseFarePerKm,
    loadingCharge,
    registrationNumber,
    driverName,
    driverPhone,
    description,
  } = req.body;

  // Check if registration number already exists
  const existingVehicle = await Vehicle.findOne({ registrationNumber });
  if (existingVehicle) {
    res.status(400);
    throw new Error('Vehicle with this registration number already exists');
  }

  const vehicle = await Vehicle.create({
    owner: req.user._id,
    type,
    capacity,
    dimensions,
    baseFarePerKm,
    loadingCharge,
    registrationNumber,
    driverName,
    driverPhone,
    description,
    approvalStatus: 'approved', // Auto-approve vehicles added by owners
    isAvailable: true, // Make vehicles available immediately
  });

  // Add vehicle to owner's list
  await User.findByIdAndUpdate(req.user._id, {
    $push: { 'vehicleOwnerDetails.vehiclesOwned': vehicle._id },
  });

  res.status(201).json(vehicle);
});

/**
 * @desc    Get owner's vehicles
 * @route   GET /api/owner/vehicles
 * @access  Private/Owner
 */
const getOwnerVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(vehicles);
});

/**
 * @desc    Update vehicle
 * @route   PUT /api/owner/vehicles/:id
 * @access  Private/Owner
 */
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  // Check ownership
  if (vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this vehicle');
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedVehicle);
});

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/owner/vehicles/:id
 * @access  Private/Owner
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  // Check ownership
  if (vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this vehicle');
  }

  await vehicle.deleteOne();

  // Remove from owner's list
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { 'vehicleOwnerDetails.vehiclesOwned': vehicle._id },
  });

  res.json({ message: 'Vehicle deleted successfully' });
});

/**
 * @desc    Get bookings for owner's vehicles
 * @route   GET /api/owner/bookings
 * @access  Private/Owner
 */
const getOwnerBookings = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id });
  const vehicleIds = vehicles.map(v => v._id);

  const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
    .populate('user', 'name email phone')
    .populate('vehicle', 'type registrationNumber')
    .sort({ createdAt: -1 });

  res.json(bookings);
});

/**
 * @desc    Get pending bookings for owner's vehicles
 * @route   GET /api/owner/bookings/pending
 * @access  Private/Owner
 */
const getPendingBookings = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id });
  const vehicleIds = vehicles.map(v => v._id);

  const bookings = await Booking.find({ 
    vehicle: { $in: vehicleIds },
    'ownerApproval.status': 'pending'
  })
    .populate('user', 'name email phone')
    .populate('vehicle', 'type registrationNumber')
    .sort({ createdAt: -1 });

  res.json(bookings);
});

/**
 * @desc    Update booking status (owner can update their vehicle bookings)
 * @route   PUT /api/owner/bookings/:id/status
 * @access  Private/Owner
 */
const updateOwnerBookingStatus = asyncHandler(async (req, res) => {
  const { status, driverDetails } = req.body;
  const booking = await Booking.findById(req.params.id).populate('vehicle');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the vehicle belongs to this owner
  if (booking.vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this booking');
  }

  booking.status = status || booking.status;
  if (driverDetails) {
    booking.driverDetails = driverDetails;
  }

  // Update vehicle earnings when delivered
  if (status === 'delivered' && booking.status !== 'delivered') {
    await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
      $inc: { 
        totalEarnings: booking.fare.totalFare,
        completedTrips: 1 
      },
    });
  }

  const updatedBooking = await booking.save();
  await updatedBooking.populate('user', 'name email phone');
  await updatedBooking.populate('vehicle', 'type registrationNumber');

  res.json(updatedBooking);
});

export {
  registerAsOwner,
  getOwnerStats,
  addVehicle,
  getOwnerVehicles,
  updateVehicle,
  deleteVehicle,
  getOwnerBookings,
  getPendingBookings,
  updateOwnerBookingStatus,
};