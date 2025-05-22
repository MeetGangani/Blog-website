const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, jwtConfig.secret);

      // Get user from the token and exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found with this token'
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Optional auth middleware that doesn't require authentication,
// but will add user to req if token is valid
exports.optional = async (req, res, next) => {
  let token;

  // Get token from header if available
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, jwtConfig.secret);

      // Get user from the token and exclude password
      req.user = await User.findById(decoded.id).select('-password');
      
      console.log('Optional auth: User attached to request', {
        userId: req.user?._id,
        username: req.user?.username
      });
    } catch (error) {
      console.log('Optional auth: Invalid token, proceeding without user');
      // Just proceed without setting req.user
    }
  }

  next(); // Always proceed, whether token is valid or not
};

// Admin middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};

// Middleware to check if user is authorized to perform an action
exports.isAuthorized = async (req, res, next) => {
  try {
    // Different authorization logic can be implemented here
    // For example, checking if a user can edit a blog post
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to perform this action'
    });
  }
}; 