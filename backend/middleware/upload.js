const { upload } = require('../config/cloudinary');

// Multer middleware to intercept incoming FDR file uploads and route to Cloudinary 'vidyakosh_fdrs'
const uploadFdrDocument = upload.single('file');

module.exports = {
  uploadFdrDocument,
  upload
};
