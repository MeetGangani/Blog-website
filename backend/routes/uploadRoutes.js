const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/fileUpload');
const { uploadToCloudinary } = require('../utils/fileUpload');
const { ErrorResponse } = require('../utils/errorHandler');

const router = express.Router();

/**
 * @desc    Upload an image
 * @route   POST /api/upload
 * @access  Private
 */
router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    console.log('Attempting to upload file:', req.file.originalname);
    
    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file);
    
    // Return success with image URL
    res.status(200).json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Upload route error:', error);
    next(error);
  }
});

module.exports = router; 