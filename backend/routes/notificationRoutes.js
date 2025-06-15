const express = require('express');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
  clearAll
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all notifications and unread count
router.route('/')
  .get(getNotifications);

router.route('/unread/count')
  .get(getUnreadCount);

router.route('/read')
  .put(markAsRead);

router.route('/clear-all')
  .delete(clearAll);

router.route('/:id')
  .delete(deleteNotification);

module.exports = router; 