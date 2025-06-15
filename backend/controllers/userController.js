const User = require('../models/User');
const Notification = require('../models/Notification');
const { ErrorResponse } = require('../utils/errorHandler');
const mongoose = require('mongoose');

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    console.log('Follow request:', {
      userToFollowId: req.params.id,
      currentUserId: req.user._id
    });

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorResponse('Invalid user ID', 400));
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Can't follow yourself
    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return next(new ErrorResponse('You cannot follow yourself', 400));
    }

    // Check if already following
    const isFollowing = await currentUser.isFollowing(userToFollow._id);
    console.log('Follow status check:', {
      isFollowing,
      currentUserFollowing: currentUser.following.map(f => f.toString()),
      userToFollowId: userToFollow._id.toString()
    });
    
    if (!isFollowing) {
      // Double-check the following array
      const alreadyInArray = currentUser.following.some(id => id.toString() === userToFollow._id.toString());
      console.log('Double-check following array:', { alreadyInArray });
      
      if (alreadyInArray) {
        return res.status(400).json({
          success: false,
          message: 'You are already following this user (array check)'
        });
      }

      await currentUser.follow(userToFollow._id);
      await currentUser.save();
      
      // Create notification
      try {
        await Notification.create({
          recipient: userToFollow._id,
          sender: currentUser._id,
          type: 'follow',
          message: `${currentUser.username} started following you`
        });
      } catch (notifError) {
        console.error('Error creating follow notification:', notifError);
        // Don't throw error, just log it
      }

      res.status(200).json({
        success: true,
        message: `You are now following ${userToFollow.username}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }
  } catch (error) {
    console.error('Error in followUser:', error);
    next(new ErrorResponse('Error following user', 500));
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    console.log('Unfollow request:', {
      userToUnfollowId: req.params.id,
      currentUserId: req.user._id
    });

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorResponse('Invalid user ID', 400));
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if already following
    const isFollowing = await currentUser.isFollowing(userToUnfollow._id);
    console.log('Unfollow status check:', {
      isFollowing,
      currentUserFollowing: currentUser.following.map(f => f.toString()),
      userToUnfollowId: userToUnfollow._id.toString()
    });
    
    if (isFollowing) {
      // Double-check the following array
      const stillInArray = currentUser.following.some(id => id.toString() === userToUnfollow._id.toString());
      console.log('Double-check following array:', { stillInArray });

      const unfollowResult = await currentUser.unfollow(userToUnfollow._id);
      console.log('Unfollow result:', { unfollowResult });
      
      // Save both users
      await currentUser.save();
      await userToUnfollow.save();

      // Verify the unfollow worked
      const verifyIsFollowing = await currentUser.isFollowing(userToUnfollow._id);
      console.log('Verify unfollow:', { verifyIsFollowing });

      if (verifyIsFollowing) {
        return next(new ErrorResponse('Failed to unfollow user - still following after unfollow', 500));
      }

      res.status(200).json({
        success: true,
        message: `You have unfollowed ${userToUnfollow.username}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    next(new ErrorResponse('Error unfollowing user', 500));
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture bio');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      followers: user.followers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username profilePicture bio');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      following: user.following
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user is following another user
// @route   GET /api/users/:id/following/check
// @access  Private
exports.checkFollowing = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const isFollowing = await currentUser.isFollowing(req.params.id);

    res.status(200).json({
      success: true,
      isFollowing
    });
  } catch (error) {
    next(error);
  }
}; 