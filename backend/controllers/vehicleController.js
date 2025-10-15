import asyncHandler from 'express-async-handler';
import Vehicle from '../models/Vehicle.js';

/**
 * @desc    Get all vehicles
 * @route   GET /api/vehicles
 * @access  Public
 */
const getVehicles = asyncHandler(async (req, res) => {
  // Only show available and approved vehicles to customers
  const query = req.user?.role === 'admin' ? {} : { 
    isAvailable: true,
    approvalStatus: { $in: ['approved', undefined] } // Include vehicles without approval status (seeded vehicles)
  };
  
  const vehicles = await Vehicle.find(query).sort({ capacity: 1 });
  res.json(vehicles);
});

/**
 * @desc    Get vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

/**
 * @desc    Get suitable vehicles based on load requirements
 * @route   POST /api/vehicles/suggest
 * @access  Public
 * @body    { weight, length, width, height }
 */
const getSuggestedVehicles = asyncHandler(async (req, res) => {
  const { weight, length, width, height } = req.body;

  // Validate input
  if (!weight) {
    res.status(400);
    throw new Error('Please provide load weight');
  }

  // Find vehicles that can handle the weight
  let query = {
    capacity: { $gte: weight },
    isAvailable: true,
    approvalStatus: { $in: ['approved', undefined] }, // Include approved vehicles
  };

  // If dimensions provided, filter by those too
  if (length && width && height) {
    query['dimensions.length'] = { $gte: length };
    query['dimensions.width'] = { $gte: width };
    query['dimensions.height'] = { $gte: height };
  }

  const vehicles = await Vehicle.find(query)
    .populate('owner', 'name email phone vehicleOwnerDetails')
    .sort({ capacity: 1 });

  if (vehicles.length > 0) {
    res.json(vehicles);
  } else {
    res.status(404);
    throw new Error('No suitable vehicles found for your requirements');
  }
});

/**
 * @desc    Get vehicles by type with owner information
 * @route   GET /api/vehicles/type/:vehicleType
 * @access  Public
 */
const getVehiclesByType = asyncHandler(async (req, res) => {
  const { vehicleType } = req.params;

  const vehicles = await Vehicle.find({
    type: vehicleType,
    isAvailable: true,
    approvalStatus: { $in: ['approved', undefined] }, // Include approved vehicles
    owner: { $exists: true } // Only vehicles with owners
  })
    .populate('owner', 'name email phone vehicleOwnerDetails')
    .sort({ capacity: 1 });

  if (vehicles.length > 0) {
    res.json(vehicles);
  } else {
    res.status(404);
    throw new Error(`No ${vehicleType} vehicles available`);
  }
});

/**
 * @desc    Create a new vehicle (Admin function - for seeding)
 * @route   POST /api/vehicles
 * @access  Public (should be Private/Admin in production)
 */
const createVehicle = asyncHandler(async (req, res) => {
  const {
    type,
    capacity,
    dimensions,
    baseFarePerKm,
    loadingCharge,
    image,
    description,
  } = req.body;

  const vehicle = await Vehicle.create({
    type,
    capacity,
    dimensions,
    baseFarePerKm,
    loadingCharge,
    image,
    description,
  });

  res.status(201).json(vehicle);
});

export { getVehicles, getVehicleById, getSuggestedVehicles, getVehiclesByType, createVehicle };