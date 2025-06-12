const express = require('express');
const { 
  createBlog, 
  getBlogs, 
  getBlog, 
  updateBlog, 
  deleteBlog, 
  toggleLike, 
  getBlogsByUser,
  getLikedBlogs,
  getCategories
} = require('../controllers/blogController');
const { protect, optional } = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../utils/fileUpload');

const router = express.Router();

// Middleware to debug file uploads
const debugFileUpload = (req, res, next) => {
  console.log('DEBUG REQUEST:');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Has file?', req.file ? 'Yes' : 'No');
  
  if (req.file) {
    console.log('File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  }
  
  console.log('Request body keys:', Object.keys(req.body));
  next();
};

// Test Cloudinary upload route
router.post('/test-upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('Test upload file:', req.file);
    const imageUrl = await uploadToCloudinary(req.file);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Upload test successful', 
      imageUrl 
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Upload test failed', 
      error: error.message 
    });
  }
});

// Comment routes
const commentRouter = require('./commentRoutes');
router.use('/:blogId/comments', commentRouter);

// Public routes
router.get('/', optional, getBlogs);
router.get('/categories', getCategories);
router.get('/:id', optional, getBlog);
router.get('/user/:userId', optional, getBlogsByUser);

// Protected routes
router.use(protect);

// Create blog with image upload
router.post('/', 
  upload.single('coverImage'),
  uploadToCloudinary,
  createBlog
);

// Update blog with image upload
router.put('/:id',
  upload.single('coverImage'),
  uploadToCloudinary,
  updateBlog
);

router.delete('/:id', deleteBlog);
router.put('/:id/like', toggleLike);
router.get('/liked', getLikedBlogs);

module.exports = router; 