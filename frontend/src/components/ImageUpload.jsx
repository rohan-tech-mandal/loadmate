import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ImageUpload = ({ vehicleId, onImageUploaded, existingImages = null }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const { getAuthHeader } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');
    setSuccess('');

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size must be less than 5MB');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', 'primary');

      const response = await fetch(`${API_URL}/images/vehicles/${vehicleId}/upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Image uploaded successfully!');
        if (onImageUploaded) {
          onImageUploaded(data.data);
        }
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Vehicle Image</h3>
          </div>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Uploading image...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Existing Images */}
          {existingImages && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {existingImages.primary && (
                  <div className="relative">
                    <img
                      src={existingImages.primary.url}
                      alt="Primary vehicle image"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                      Primary
                    </div>
                  </div>
                )}
                {existingImages.gallery?.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <ImageIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
            variant="outline"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;



