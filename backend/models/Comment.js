const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Reply must not be empty']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must not be empty']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [ReplySchema]
}, {
  timestamps: true
});

// Virtual for formatted date
CommentSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Virtual for likes count
CommentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Method to check if user has liked the comment
CommentSchema.methods.isLiked = function(userId) {
  return this.likes.includes(userId);
};

// Method to add like
CommentSchema.methods.addLike = function(userId) {
  if (!this.isLiked(userId)) {
    this.likes.push(userId);
    return true;
  }
  return false;
};

// Method to remove like
CommentSchema.methods.removeLike = function(userId) {
  if (this.isLiked(userId)) {
    this.likes = this.likes.filter(like => like.toString() !== userId.toString());
    return true;
  }
  return false;
};

// Set toJSON option to include virtuals
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema); 