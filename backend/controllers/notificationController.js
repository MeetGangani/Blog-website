const Notification = require('../models/Notification');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
  try {
    const { recipient, type, blog, comment, message } = req.body;
    
    const notification = await Notification.create({
      recipient,
      sender: req.user._id,
      type,
      blog,
      comment,
      message
    });

    // Populate sender info
    await notification.populate('sender', 'username profilePicture');

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .populate('sender', 'username profilePicture')
      .populate('blog', 'title')
      .populate('comment', 'content')
      .lean();

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    next(new ErrorResponse('Error fetching notifications', 500));
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return next(new ErrorResponse('Please provide valid notification IDs', 400));
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: req.user._id
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    next(new ErrorResponse('Error marking notifications as read', 500));
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    next(new ErrorResponse('Error deleting notification', 500));
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    next(new ErrorResponse('Error getting unread count', 500));
  }
};

// @desc    Clear all notifications for a user
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAll = async (req, res, next) => {
  try {
    // Delete all notifications where the user is the recipient
    await Notification.deleteMany({ recipient: req.user._id });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    next(new ErrorResponse('Error clearing notifications', 500));
  }
}; 