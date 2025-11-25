const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const StoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'VibeNet/Storys',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'webm'],
  },
});




// Profile Pic Storage (different folder)
const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'VibeNet/profilePics',
    resource_type: 'image',      // profile pic will always be image
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `user_${req.params.id}_${Date.now()}`,  // unique
  },
});

// Profile Pic Storage (different folder)
const chatImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'VibeNet/chatImages',
    resource_type: 'auto',      // profile pic will always be image
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const PostImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'VibeNet/PostImage',
    resource_type: 'auto',      // profile pic will always be image
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const groupImageStorage= new CloudinaryStorage({
  cloudinary,
  params:{
    folder:'VibeNet/groupIcon',
    resource_type:'auto',
    allowed_formats:['jpg', 'jpeg', 'png']
  },
})
module.exports = { StoryStorage, cloudinary , profilePicStorage ,chatImageStorage,PostImageStorage,groupImageStorage};  // Export cloudinary instance too
