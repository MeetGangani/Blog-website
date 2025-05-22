const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

module.exports = generateToken; 