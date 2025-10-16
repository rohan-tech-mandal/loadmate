import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = cloudinaryConfig.cloud_name && 
                               cloudinaryConfig.api_key && 
                               cloudinaryConfig.api_secret;

if (isCloudinaryConfigured) {
  cloudinary.config(cloudinaryConfig);
  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('⚠️  Cloudinary not configured - using local storage fallback');
}

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/vehicles';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for vehicle images
let vehicleImageStorage;

if (isCloudinaryConfigured) {
  vehicleImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'loadmate/vehicles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 600, crop: 'fill', quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      public_id: (req, file) => {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        return `vehicle_${timestamp}_${randomString}`;
      }
    }
  });
} else {
  // Fallback to local storage
  vehicleImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(file.originalname);
      const filename = `vehicle_${timestamp}_${randomString}${ext}`;
      cb(null, filename);
    }
  });
}

// Configure multer for file upload
const vehicleImageUpload = multer({
  storage: vehicleImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete image
export const deleteImage = async (publicId) => {
  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } else {
      // For local storage, delete the file
      const filePath = path.join(uploadsDir, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { result: 'ok' };
      }
      return { result: 'not found' };
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Helper function to get image URL
export const getImageUrl = (publicId, options = {}) => {
  if (isCloudinaryConfigured) {
    return cloudinary.url(publicId, {
      secure: true,
      ...options
    });
  } else {
    // For local storage, return the file path
    return `/uploads/vehicles/${publicId}`;
  }
};

export { cloudinary, vehicleImageUpload, isCloudinaryConfigured };