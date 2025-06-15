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

    // Populate user information
    await comment.populate({
      path: 'user',
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

    // Get comments with full user information and populate replies
    const comments = await Comment.find({ blog: blogId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'username email profilePicture bio role'
      })
      .populate({
        path: 'replies.user',
        select: 'username email profilePicture bio role'
      });

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
      })
      .populate({
        path: 'replies.user',
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

    // Populate user information
    await comment.populate({
      path: 'user',
      select: 'username email profilePicture bio role'
    });

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

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
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

    await comment.save();

    // Populate user information
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

// @desc    Update a reply
// @route   PUT /api/comments/:id/replies/:replyId
// @access  Private
exports.updateReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return next(new ErrorResponse(`Reply not found with id of ${req.params.replyId}`, 404));
    }

    // Check if user is author
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this reply', 403));
    }

    reply.content = content;
    await comment.save();

    // Populate user information
    await comment.populate({
      path: 'replies.user',
      select: 'username email profilePicture bio role'
    });

    res.status(200).json({
      success: true,
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reply
// @route   DELETE /api/comments/:id/replies/:replyId
// @access  Private
exports.deleteReply = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return next(new ErrorResponse(`Reply not found with id of ${req.params.replyId}`, 404));
    }

    // Check if user is author
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this reply', 403));
    }

    reply.remove();
    await comment.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    const userId = req.user._id;
    let message = '';

    if (comment.isLiked(userId)) {
      comment.removeLike(userId);
      message = 'Comment unliked successfully';
    } else {
      comment.addLike(userId);
      message = 'Comment liked successfully';
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message,
      likesCount: comment.likes.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike a reply
// @route   POST /api/comments/:id/replies/:replyId/like
// @access  Private
exports.toggleReplyLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return next(new ErrorResponse(`Reply not found with id of ${req.params.replyId}`, 404));
    }

    const userId = req.user._id;
    const userIdStr = userId.toString();
    let message = '';

    const userLikeIndex = reply.likes.findIndex(like => like.toString() === userIdStr);
    
    if (userLikeIndex !== -1) {
      reply.likes.splice(userLikeIndex, 1);
      message = 'Reply unliked successfully';
    } else {
      reply.likes.push(userId);
      message = 'Reply liked successfully';
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message,
      likesCount: reply.likes.length
    });
  } catch (error) {
    next(error);
  }
}; 