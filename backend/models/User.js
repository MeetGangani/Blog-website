const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  followers: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  following: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for profile picture (for legacy compatibility)
UserSchema.virtual('picture').get(function() {
  return this.profilePicture;
});

// Virtual for followers count
UserSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
UserSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user is following another user
UserSchema.methods.isFollowing = function(userId) {
  return this.following ? this.following.includes(userId) : false;
};

// Method to follow a user
UserSchema.methods.follow = async function(userId) {
  // Initialize arrays if they don't exist
  if (!this.following) this.following = [];
  
  if (!this.isFollowing(userId)) {
    this.following.push(userId);
    const userToFollow = await this.constructor.findById(userId);
    if (userToFollow) {
      if (!userToFollow.followers) userToFollow.followers = [];
      userToFollow.followers.push(this._id);
      await userToFollow.save();
    }
    return true;
  }
  return false;
};

// Method to unfollow a user
UserSchema.methods.unfollow = async function(userId) {
  // Initialize arrays if they don't exist
  if (!this.following) this.following = [];
  
  if (this.isFollowing(userId)) {
    this.following = this.following.filter(id => id.toString() !== userId.toString());
    const userToUnfollow = await this.constructor.findById(userId);
    if (userToUnfollow) {
      if (!userToUnfollow.followers) userToUnfollow.followers = [];
      userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== this._id.toString());
      await userToUnfollow.save();
    }
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema); 