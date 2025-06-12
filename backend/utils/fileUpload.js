const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { ErrorResponse } = require('./errorHandler');
const fs = require('fs');

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
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('uploads/')) {
      fs.mkdirSync('uploads/');
    }
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Please upload an image file (jpeg, jpg, png, gif, webp)', 400), false);
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

// Middleware to upload to cloudinary
exports.uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      console.log('No file to upload to Cloudinary');
      return next();
    }

    console.log('Attempting to upload image to Cloudinary:', req.file.path);
    console.log('File details:', {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'mern_blog',
      use_filename: true
    });

    // Add the Cloudinary URL to the request body
    req.body.coverImage = result.secure_url;

    // Delete the local file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });

    console.log('Cloudinary upload successful:', result.secure_url);
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Delete the local file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });
    }
    return next(new ErrorResponse('Error uploading image', 500));
  }
}; 