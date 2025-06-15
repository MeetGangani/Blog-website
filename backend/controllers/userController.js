const User = require('../models/User');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Can't follow yourself
    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return next(new ErrorResponse(`You cannot follow yourself`, 400));
    }

    const followed = await currentUser.follow(userToFollow._id);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: followed ? 'User followed successfully' : 'Already following this user',
      followersCount: userToFollow.followersCount,
      followingCount: currentUser.followingCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    const unfollowed = await currentUser.unfollow(userToUnfollow._id);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: unfollowed ? 'User unfollowed successfully' : 'Not following this user',
      followersCount: userToUnfollow.followersCount,
      followingCount: currentUser.followingCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'followers',
      select: 'username profilePicture bio'
    });

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
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
    const user = await User.findById(req.params.id).populate({
      path: 'following',
      select: 'username profilePicture bio'
    });

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
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
// @route   GET /api/users/:id/isFollowing
// @access  Private
exports.checkFollowing = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.isFollowing(req.params.id);

    res.status(200).json({
      success: true,
      isFollowing
    });
  } catch (error) {
    next(error);
  }
}; 