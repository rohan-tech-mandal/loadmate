import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary - REQUIRED
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Validate Cloudinary configuration
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('Required environment variables:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
  throw new Error('Cloudinary configuration is required. Please set the required environment variables.');
}

// Initialize Cloudinary
cloudinary.config(cloudinaryConfig);
console.log('✅ Cloudinary configured successfully');

// Configure storage for vehicle images
const vehicleImageStorage = new CloudinaryStorage({
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

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
export const getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
};

export { cloudinary, vehicleImageUpload as upload };