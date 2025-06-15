const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  coverImage: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Technology', 'Lifestyle', 'Business', 'Travel', 'Health', 'Food', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
BlogSchema.virtual('formattedDate').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString() : 'Date not available';
});

// Method to check if user has liked the blog
BlogSchema.methods.isLiked = function(userId) {
  return this.likes.includes(userId);
};

// Method to add like
BlogSchema.methods.addLike = function(userId) {
  if (!this.isLiked(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    return true;
  }
  return false;
};

// Method to remove like
BlogSchema.methods.removeLike = function(userId) {
  if (this.isLiked(userId)) {
    this.likes = this.likes.filter(like => like.toString() !== userId.toString());
    this.likesCount = this.likes.length;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Blog', BlogSchema); 