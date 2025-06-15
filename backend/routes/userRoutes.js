const express = require('express');
const User = require('../models/User');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user profile by username
router.get('/:username/profile', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow routes
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

// Get followers/following
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/:id/isFollowing', protect, checkFollowing);

module.exports = router; 