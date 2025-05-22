require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'meet123',
  expiresIn: '24h'
}; 