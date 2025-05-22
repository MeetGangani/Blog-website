const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { ErrorResponse } = require('../utils/errorHandler');
const { uploadToCloudinary } = require('../utils/fileUpload');

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    
    console.log('Creating new blog with data:', { title, category, tags });
    console.log('File uploaded?', req.file ? 'Yes' : 'No');
    
    // Create a blog object but don't save to DB yet
    const blogData = {
      title,
      content,
      author: req.user._id,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    // Handle image upload first if there is one
    if (req.file) {
      try {
        console.log('Processing cover image:', req.file.path);
        const imageUrl = await uploadToCloudinary(req.file);
        console.log('Cover image uploaded successfully:', imageUrl);
        blogData.coverImage = imageUrl;
      } catch (uploadError) {
        console.error('Cover image upload failed:', uploadError);
        // Continue with blog creation even if image upload fails
      }
    } else {
      console.log('No cover image to process');
    }

    // Now create the blog with image URL (if upload succeeded)
    const blog = await Blog.create(blogData);
    
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

// @desc    Get all blogs with pagination and filters
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res, next) => {
  try {
    // Build query
    const { search, category, tag, page = 1, limit = 10 } = req.query;
    const query = {};

    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find blogs
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username profilePicture');

    // Count documents
    const total = await Blog.countDocuments(query);

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

    const { title, content, category, tags, removeCoverImage } = req.body;
    console.log('Updating blog with data:', { title, category, tags, removeCoverImage });
    console.log('File uploaded?', req.file ? 'Yes' : 'No');

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());

    // Handle cover image
    if (removeCoverImage === 'true') {
      console.log('Removing existing cover image');
      updateData.coverImage = '';
    } else if (req.file) {
      try {
        console.log('Processing new cover image:', req.file.path);
        const imageUrl = await uploadToCloudinary(req.file);
        console.log('New cover image uploaded successfully:', imageUrl);
        updateData.coverImage = imageUrl;
      } catch (uploadError) {
        console.error('Cover image upload failed:', uploadError);
        // Continue with blog update even if image upload fails
      }
    }

    // Update blog with new data
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

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