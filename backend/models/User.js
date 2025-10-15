import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Supports both email/password and Google OAuth authentication
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required for Google OAuth users
      required: function() {
        return !this.googleId;
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    profilePicture: {
      type: String,
    },
    // Account type
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // User role
    role: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      default: 'customer',
    },
    // For vehicle owners
    vehicleOwnerDetails: {
      businessName: String,
      licenseNumber: String,
      vehiclesOwned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
      }],
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Pre-save middleware to hash password
 * Only runs if password is modified and user is not OAuth user
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.googleId) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;