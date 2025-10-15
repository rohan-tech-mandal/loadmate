import mongoose from 'mongoose';

/**
 * Booking Schema
 * Manages transport bookings with user, vehicle, and route information
 * Relations: User (1) ↔ (N) Booking (N) ↔ (1) Vehicle
 */
const bookingSchema = new mongoose.Schema(
  {
    // Reference to User who made the booking
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to Vehicle used for transport
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    // Pickup location details
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Please add pickup address'],
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    // Drop location details
    dropLocation: {
      address: {
        type: String,
        required: [true, 'Please add drop address'],
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    // Load details
    loadWeight: {
      type: Number,
      required: [true, 'Please add load weight in kg'],
    },
    loadDimensions: {
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
    // Material type
    materialType: {
      type: String,
      trim: true,
    },
    // Distance in km (calculated or estimated)
    distance: {
      type: Number,
    },
    // Fare calculation
    fare: {
      baseFare: {
        type: Number,
        required: true,
      },
      loadingCharges: {
        type: Number,
        default: 0,
      },
      totalFare: {
        type: Number,
        required: true,
      },
    },
    // Booking schedule
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
    },
    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    // Owner approval status
    ownerApproval: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      approvedAt: {
        type: Date,
      },
      rejectedAt: {
        type: Date,
      },
      rejectionReason: {
        type: String,
      },
    },
    // Driver details (if assigned)
    driverDetails: {
      name: String,
      phone: String,
      vehicleNumber: String,
    },
    // Additional notes
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;