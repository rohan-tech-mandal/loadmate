import mongoose from 'mongoose';

/**
 * Vehicle Schema
 * Defines different types of transport vehicles with their specifications
 */
const vehicleSchema = new mongoose.Schema(
  {
    // Owner reference
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      required: [true, 'Please add vehicle type'],
      enum: ['Tata Ace', 'Pickup Truck', 'Mini Truck', 'Container Truck', 'Trailer'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity in kg'],
    },
    // Default dimensions in feet (Length x Width x Height)
    dimensions: {
      length: {
        type: Number,
        required: true,
      },
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
    },
    // Base fare per km
    baseFarePerKm: {
      type: Number,
      required: true,
    },
    // Additional charges
    loadingCharge: {
      type: Number,
      default: 0,
    },
    // Vehicle image URL
    image: {
      type: String,
    },
    // Description
    description: {
      type: String,
    },
    // Availability status
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Vehicle registration details
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    driverName: {
      type: String,
    },
    driverPhone: {
      type: String,
    },
    // Approval status for owner vehicles
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Earnings tracking
    totalEarnings: {
      type: Number,
      default: 0,
    },
    completedTrips: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;