require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Log environment variables (without exposing secrets)
console.log('Environment Variables Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test function to verify Cloudinary connection
async function testCloudinaryConnection() {
  try {
    // Ping the Cloudinary API
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
    return true;
  } catch (error) {
    console.error('Cloudinary connection failed:', error);
    return false;
  }
}

// Run the test
testCloudinaryConnection()
  .then(success => {
    if (success) {
      console.log('✅ Cloudinary is properly configured and accessible');
    } else {
      console.log('❌ Cloudinary configuration has issues');
    }
  })
  .catch(err => {
    console.error('Test execution error:', err);
  });

module.exports = { testCloudinaryConnection }; 