const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect, admin);

// Get admin dashboard stats
router.get('/stats', getStats);

// Get all users and get, update, delete a single user
router.route('/users').get(getUsers);
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 