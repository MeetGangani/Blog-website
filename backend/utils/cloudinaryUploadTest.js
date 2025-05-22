require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Path to a test image - use the vite.svg from Frontend/public
const testImagePath = path.join(__dirname, '..', '..', 'Frontend', 'public', 'vite.svg');

// Check if test image exists
if (!fs.existsSync(testImagePath)) {
  console.error(`Test image not found at ${testImagePath}`);
  console.log('Please create a test image at this location or modify the path in this script.');
  process.exit(1);
}

// Test upload function
async function testUpload() {
  try {
    console.log(`Attempting to upload image: ${testImagePath}`);
    
    const uploadResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'test_uploads',
      use_filename: true
    });
    
    console.log('Upload successful!');
    console.log('Image URL:', uploadResult.secure_url);
    console.log('Full result:', JSON.stringify(uploadResult, null, 2));
    
    return uploadResult;
  } catch (error) {
    console.error('Upload failed with error:', error);
    return null;
  }
}

// Run the test
testUpload()
  .then(result => {
    if (result) {
      console.log('✅ Cloudinary upload test passed');
    } else {
      console.log('❌ Cloudinary upload test failed');
    }
  })
  .catch(err => {
    console.error('Test execution error:', err);
  }); 