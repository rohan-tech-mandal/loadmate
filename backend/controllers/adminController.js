import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalOwners = await User.countDocuments({ role: 'owner' });
  const totalVehicles = await Vehicle.countDocuments();
  const totalBookings = await Booking.countDocuments();
  
  const bookingStats = {
    pending: await Booking.countDocuments({ status: 'pending' }),
    confirmed: await Booking.countDocuments({ status: 'confirmed' }),
    inTransit: await Booking.countDocuments({ status: 'in-transit' }),
    delivered: await Booking.countDocuments({ status: 'delivered' }),
    cancelled: await Booking.countDocuments({ status: 'cancelled' }),
  };

  // Calculate total revenue
  const bookings = await Booking.find({ status: { $in: ['delivered', 'in-transit'] } });
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.fare.totalFare, 0);

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('vehicle', 'type registrationNumber')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    totalUsers,
    totalCustomers,
    totalOwners,
    totalVehicles,
    totalBookings,
    bookingStats,
    totalRevenue,
    recentBookings,
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
});

/**
 * @desc    Get all vehicles with owner info
 * @route   GET /api/admin/vehicles
 * @access  Private/Admin
 */
const getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find()
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(vehicles);
});

/**
 * @desc    Approve/Reject vehicle
 * @route   PUT /api/admin/vehicles/:id/approval
 * @access  Private/Admin
 */
const updateVehicleApproval = asyncHandler(async (req, res) => {
  const { approvalStatus } = req.body;
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  vehicle.approvalStatus = approvalStatus;
  if (approvalStatus === 'approved') {
    vehicle.isAvailable = true;
  }

  const updatedVehicle = await vehicle.save();
  res.json(updatedVehicle);
});

/**
 * @desc    Get all bookings
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email phone')
    .populate('vehicle', 'type registrationNumber')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

/**
 * @desc    Update any booking status
 * @route   PUT /api/admin/bookings/:id/status
 * @access  Private/Admin
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = status;
  const updatedBooking = await booking.save();

  await updatedBooking.populate('user', 'name email phone');
  await updatedBooking.populate('vehicle', 'type registrationNumber');

  res.json(updatedBooking);
});

export {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllVehicles,
  updateVehicleApproval,
  getAllBookings,
  updateBookingStatus,
};