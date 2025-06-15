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
  console.log('isFollowing check:', {
    userId: userId.toString(),
    following: this.following ? this.following.map(f => f.toString()) : [],
    hasFollowing: !!this.following,
    isArray: Array.isArray(this.following)
  });

  if (!this.following || !Array.isArray(this.following) || this.following.length === 0) {
    return false;
  }
  
  const targetId = userId.toString();
  const result = this.following.some(id => id && id.toString() === targetId);
  
  console.log('isFollowing result:', {
    targetId,
    result
  });
  
  return result;
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
  console.log('Unfollow method called:', {
    userId: userId.toString(),
    currentFollowing: this.following ? this.following.map(f => f.toString()) : []
  });

  // Initialize arrays if they don't exist
  if (!this.following) this.following = [];
  
  if (this.isFollowing(userId)) {
    // Remove from following array
    const beforeLength = this.following.length;
    this.following = this.following.filter(id => id.toString() !== userId.toString());
    const afterLength = this.following.length;
    
    console.log('Following array update:', {
      beforeLength,
      afterLength,
      removed: beforeLength - afterLength
    });

    // Update the other user's followers array
    const userToUnfollow = await this.constructor.findById(userId);
    if (userToUnfollow) {
      if (!userToUnfollow.followers) userToUnfollow.followers = [];
      
      const beforeFollowers = userToUnfollow.followers.length;
      userToUnfollow.followers = userToUnfollow.followers.filter(
        id => id.toString() !== this._id.toString()
      );
      const afterFollowers = userToUnfollow.followers.length;
      
      console.log('Followers array update:', {
        beforeFollowers,
        afterFollowers,
        removed: beforeFollowers - afterFollowers
      });

      await userToUnfollow.save();
    }

    // Verify the arrays were updated correctly
    const stillFollowing = this.following.some(id => id.toString() === userId.toString());
    console.log('Verification:', {
      stillFollowing,
      currentFollowing: this.following.map(f => f.toString())
    });

    return !stillFollowing; // Return true if successfully unfollowed
  }
  return false; // Return false if wasn't following
};

module.exports = mongoose.model('User', UserSchema); 