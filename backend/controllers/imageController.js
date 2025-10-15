import { vehicleImageUpload, deleteImage, getImageUrl } from '../config/cloudinary.js';
import Vehicle from '../models/Vehicle.js';

// Upload vehicle image
export const uploadVehicleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { vehicleId } = req.params;
    const { imageType = 'primary' } = req.body; // 'primary' or 'gallery'

    // Find the vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if user owns the vehicle
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle'
      });
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename
    };

    // Update vehicle with new image
    if (imageType === 'primary') {
      // Delete old primary image if exists
      if (vehicle.images?.primary?.publicId) {
        try {
          await deleteImage(vehicle.images.primary.publicId);
        } catch (error) {
          console.error('Error deleting old primary image:', error);
        }
      }
      
      vehicle.images = {
        ...vehicle.images,
        primary: imageData
      };
    } else if (imageType === 'gallery') {
      if (!vehicle.images) {
        vehicle.images = { gallery: [] };
      }
      vehicle.images.gallery.push(imageData);
    }

    // Also update legacy image field for backward compatibility
    vehicle.image = req.file.path;

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
        vehicle: {
          id: vehicle._id,
          images: vehicle.images
        }
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Delete vehicle image
export const deleteVehicleImage = async (req, res) => {
  try {
    const { vehicleId, imageId } = req.params;
    const { imageType = 'gallery' } = req.body; // 'primary' or 'gallery'

    // Find the vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if user owns the vehicle
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle'
      });
    }

    let publicIdToDelete = null;

    if (imageType === 'primary' && vehicle.images?.primary?.publicId) {
      publicIdToDelete = vehicle.images.primary.publicId;
      vehicle.images.primary = null;
    } else if (imageType === 'gallery' && vehicle.images?.gallery) {
      const imageIndex = vehicle.images.gallery.findIndex(
        img => img._id.toString() === imageId
      );
      
      if (imageIndex !== -1) {
        publicIdToDelete = vehicle.images.gallery[imageIndex].publicId;
        vehicle.images.gallery.splice(imageIndex, 1);
      }
    }

    if (publicIdToDelete) {
      try {
        await deleteImage(publicIdToDelete);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        vehicle: {
          id: vehicle._id,
          images: vehicle.images
        }
      }
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop = 'fill', quality = 'auto' } = req.query;

    const options = {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      crop,
      quality,
      fetch_format: 'auto'
    };

    const optimizedUrl = getImageUrl(publicId, options);

    res.status(200).json({
      success: true,
      data: {
        optimizedUrl,
        originalPublicId: publicId,
        transformations: options
      }
    });

  } catch (error) {
    console.error('Error generating optimized URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating optimized URL',
      error: error.message
    });
  }
};
