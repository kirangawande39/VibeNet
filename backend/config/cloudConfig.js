const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'VibeNet',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'webm'],
  },
});

module.exports = { storage, cloudinary };  // Export cloudinary instance too
