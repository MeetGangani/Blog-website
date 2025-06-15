import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import { notificationsAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch unread count every minute
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationIds) => {
    try {
      await notificationsAPI.markAsRead(notificationIds);
      setNotifications(notifications.map(notification => 
        notificationIds.includes(notification._id) 
          ? { ...notification, read: true }
          : notification
      ));
      setUnreadCount(Math.max(0, unreadCount - notificationIds.length));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      if (!notifications.find(n => n._id === id)?.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      await notificationsAPI.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationContent = (notification) => {
    const { type, sender, blog, message } = notification;
    
    switch (type) {
      case 'like':
        return (
          <Link to={`/blogs/${blog._id}`} className="hover:underline">
            <span className="font-medium">{sender.username}</span> liked your blog "{blog.title}"
          </Link>
        );
      case 'comment':
        return (
          <Link to={`/blogs/${blog._id}`} className="hover:underline">
            <span className="font-medium">{sender.username}</span> commented on your blog "{blog.title}"
          </Link>
        );
      case 'reply':
        return (
          <Link to={`/blogs/${blog._id}`} className="hover:underline">
            <span className="font-medium">{sender.username}</span> replied to your comment on "{blog.title}"
          </Link>
        );
      case 'follow':
        return (
          <Link to={`/profile/${sender.username}`} className="hover:underline">
            <span className="font-medium">{sender.username}</span> started following you
          </Link>
        );
      default:
        return message;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-neutral-50 transition-colors"
      >
        <FiBell size={20} className="text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-soft border border-neutral-100 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
            <h3 className="font-semibold text-neutral-800">Notifications</h3>
            <div className="flex items-center space-x-4">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={() => handleMarkAsRead(notifications.filter(n => !n.read).map(n => n._id))}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <FiCheck className="mr-1" size={14} />
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  title="Clear all notifications"
                >
                  <FiTrash2 className="mr-1" size={14} />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-neutral-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <FiBell size={24} className="text-neutral-400" />
                </div>
                <p className="text-neutral-600">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors flex items-start justify-between ${
                    !notification.read ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={notification.sender.profilePicture || 'https://via.placeholder.com/40'}
                      alt={notification.sender.username}
                      className="w-10 h-10 rounded-full object-cover bg-neutral-100"
                    />
                    <div>
                      <div className="text-sm text-neutral-700">
                        {getNotificationContent(notification)}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead([notification._id])}
                        className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-full"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 