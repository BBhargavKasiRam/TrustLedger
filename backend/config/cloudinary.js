const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

// Configure Cloudinary v2 SDK using credentials from .env
// Note: Specifically accounts for user's spelling CLAUDINARY_API_KEY as well as standard CLOUDINARY_API_KEY
const apiKey = process.env.CLAUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '852194637829145';
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLAUDINARY_CLOUD_NAME || 'vidyakosh-aicte';
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLAUDINARY_API_SECRET || 'sec_vidyakosh_2026_deposit_aicte';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

// Configure Multer storage to route uploads directly to 'vidyakosh_fdrs' folder
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vidyakosh_fdrs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const cleanFileName = (file.originalname || 'receipt').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      return `fdr_${cleanFileName}_${uniqueSuffix}`;
    }
  }
});

const upload = multer({ storage });

module.exports = {
  cloudinary,
  storage,
  upload
};
