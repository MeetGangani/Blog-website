const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { ErrorResponse } = require('../utils/errorHandler');
const { uploadToCloudinary } = require('../utils/fileUpload');

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, category, tags, coverImage } = req.body;
    
    console.log('Creating new blog with data:', { title, category, tags });
    
    // Create blog with all data including coverImage
    const blog = await Blog.create({
      title,
      content,
      author: req.user._id,
      category,
      coverImage,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    console.log('Blog saved to database:', {
      id: blog._id,
      title: blog.title,
      hasCoverImage: !!blog.coverImage,
      coverImageUrl: blog.coverImage || 'No cover image'
    });

    // Fetch the blog with author info to return full data
    const populatedBlog = await Blog.findById(blog._id).populate('author', 'username profilePicture');

    res.status(201).json({
      success: true,
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Blog creation error:', error);
    next(error);
  }
};

// @desc    Get all blogs with filters
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      search = '',
      category = '',
      author = ''
    } = req.query;

    // Build query
    const query = {};

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add author filter if provided
    if (author) {
      query.author = author;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get blogs with filters and pagination
    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username profilePicture')
      .lean();

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    // Get available categories with count
    const categoryCounts = await Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Add isLiked property if user is authenticated
    if (req.user) {
      blogs.forEach(blog => {
        blog.isLiked = blog.likes.includes(req.user._id);
      });
    }

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      categories: categoryCounts,
      blogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single blog post
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username profilePicture'
        }
      });

    if (!blog) {
      return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }

    // Check if the blog has been liked by the current user
    let isLiked = false;
    if (req.user) {
      isLiked = blog.isLiked(req.user._id);
    }
    
    // Add isLiked property to blog object for the response
    const blogResponse = blog.toJSON();
    blogResponse.isLiked = isLiked;

    // Log blog data for debugging
    console.log('Blog retrieved:', {
      id: blog._id,
      title: blog.title,
      hasCoverImage: !!blog.coverImage,
      coverImageUrl: blog.coverImage || 'No cover image',
      isLiked: isLiked
    });

    res.status(200).json({
      success: true,
      blog: blogResponse
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    next(error);
  }
};

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private
exports.updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }

    // Check if user is author
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this blog', 403));
    }

    const { title, content, category, tags, coverImage, removeCoverImage } = req.body;
    console.log('Updating blog with data:', { title, category, tags, removeCoverImage });

    // Prepare update data
    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(category && { category }),
      ...(tags && { tags: tags.split(',').map(tag => tag.trim()) }),
      ...(removeCoverImage === 'true' ? { coverImage: '' } : {}),
      ...(coverImage && { coverImage })
    };

    // Update blog with new data
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username profilePicture');

    res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Blog update error:', error);
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }

    // Check if user is author
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this blog', 403));
    }

    // Delete all comments related to this blog
    await Comment.deleteMany({ blog: req.params.id });

    // Delete blog
    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Blog deletion error:', error);
    next(error);
  }
};

// @desc    Like or unlike a blog post
// @route   PUT /api/blogs/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }

    // Check if the blog has been liked already
    const isLiked = blog.isLiked(req.user._id);

    // Toggle like
    if (isLiked) {
      blog.removeLike(req.user._id);
    } else {
      blog.addLike(req.user._id);
    }

    // Save blog
    await blog.save();

    res.status(200).json({
      success: true,
      likesCount: blog.likesCount,
      isLiked: !isLiked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blogs by user
// @route   GET /api/blogs/user/:userId
// @access  Public
exports.getBlogsByUser = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find blogs by user
    const blogs = await Blog.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username profilePicture');

    // Count documents
    const total = await Blog.countDocuments({ author: req.params.userId });

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      blogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blogs liked by a user
// @route   GET /api/blogs/liked
// @access  Private
exports.getLikedBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find blogs that have the user's ID in their likes array
    const blogs = await Blog.find({ likes: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username profilePicture');

    // Count total blogs liked by this user
    const total = await Blog.countDocuments({ likes: req.user._id });

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      blogs
    });
  } catch (error) {
    console.error('Error fetching liked blogs:', error);
    next(error);
  }
};

// @desc    Get all categories with counts
// @route   GET /api/blogs/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
}; 