const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { ErrorResponse } = require('./errorHandler');

// Debug Cloudinary config
console.log('Cloudinary Config Check:');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Please upload an image file', 400), false);
  }
};

// Multer configuration
exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Upload to cloudinary
exports.uploadToCloudinary = async (file) => {
  try {
    console.log('Attempting to upload image to Cloudinary:', file.path);
    console.log('File details:', { 
      name: file.originalname,
      size: file.size,
      type: file.mimetype
    });
    
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'mern_blog',
      use_filename: true
    });
    
    console.log('Cloudinary upload successful:', result.secure_url);
    console.log('Upload metadata:', {
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      resource_type: result.resource_type
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error.http_code) {
      console.error('HTTP Status Code:', error.http_code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    throw new ErrorResponse('Error uploading image to Cloudinary', 500);
  }
}; 