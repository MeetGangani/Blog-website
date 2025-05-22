const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Create a comment
// @route   POST /api/blogs/:blogId/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { blogId } = req.params;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ErrorResponse(`Blog not found with id of ${blogId}`, 404));
    }

    // Create comment
    const comment = await Comment.create({
      content,
      user: req.user._id,
      blog: blogId
    });

    // Add comment to blog
    blog.comments.push(comment._id);
    blog.commentsCount = blog.comments.length;
    await blog.save();

    // Populate user information - include all relevant user fields
    await comment.populate({
      path: 'user', 
      select: 'username email profilePicture bio role'
    });

    // Log the populated comment for debugging
    console.log('New comment created with user data:', {
      commentId: comment._id,
      user: {
        id: comment.user._id,
        username: comment.user.username,
        hasProfilePic: !!comment.user.profilePicture,
        profilePic: comment.user.profilePicture
      }
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments for a blog
// @route   GET /api/blogs/:blogId/comments
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ErrorResponse(`Blog not found with id of ${blogId}`, 404));
    }

    // Get comments with full user information
    const comments = await Comment.find({ blog: blogId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'username email profilePicture bio role'
      });

    // Log the first comment's user data for debugging
    if (comments.length > 0) {
      console.log('First comment user data:', {
        commentId: comments[0]._id,
        user: {
          id: comments[0].user?._id,
          username: comments[0].user?.username,
          hasProfilePic: comments[0].user?.profilePicture ? true : false,
          profilePic: comments[0].user?.profilePicture
        }
      });
      
      // Check if any comments have profilePicture field
      let hasProfilePicture = false;
      let hasPicture = false;
      
      for (const comment of comments) {
        if (comment.user && comment.user.profilePicture) {
          hasProfilePicture = true;
          console.log(`User ${comment.user.username} has profilePicture:`, comment.user.profilePicture);
        }
        if (comment.user && comment.user.picture) {
          hasPicture = true;
          console.log(`User ${comment.user.username} has picture:`, comment.user.picture);
          
          // Add the profilePicture field if only picture exists
          if (!comment.user.profilePicture) {
            comment.user.profilePicture = comment.user.picture;
          }
        }
      }
      
      console.log('Comments field check:', { hasProfilePicture, hasPicture });
    }

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single comment
// @route   GET /api/comments/:id
// @access  Public
exports.getComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'username email profilePicture bio role'
      });

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Check if user is author
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this comment', 403));
    }

    // Update comment
    comment.content = content;
    await comment.save();

    res.status(200).json({
      success: true,
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Check if user is author
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this comment', 403));
    }

    // Remove comment from blog
    const blog = await Blog.findById(comment.blog);
    if (blog) {
      blog.comments = blog.comments.filter(
        (commentId) => commentId.toString() !== req.params.id
      );
      blog.commentsCount = blog.comments.length;
      await blog.save();
    }

    // Delete comment using findByIdAndDelete instead of remove()
    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    next(error);
  }
};

// @desc    Add reply to comment
// @route   POST /api/comments/:id/replies
// @access  Private
exports.addReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Add reply
    comment.replies.push({
      content,
      user: req.user._id
    });

    // Save comment
    await comment.save();

    // Populate user information with full details
    await comment.populate({
      path: 'replies.user',
      select: 'username email profilePicture bio role'
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    next(error);
  }
}; 