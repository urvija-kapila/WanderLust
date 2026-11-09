const cloudinary = require('cloudinary').v2;  
const { CloudinaryStorage } = require('multer-storage-cloudinary-v2');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,          // pass .v2 — works for both v1 and v2 SDKs
  params: {
    folder: 'wanderlust_DEV',
    allowedFormats:["png","jpeg","jpg"], 
  },
});

module.exports = {
  cloudinary,
  storage
};