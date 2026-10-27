const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { uploadFdrDocument } = require('./middleware/upload');
const fdrController = require('./controllers/fdrController');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/vidyakosh';
mongoose.connect(mongoUri)
  .then(() => console.log('[VidyaKosh Node/Express] Connected to MongoDB'))
  .catch((err) => console.warn('[VidyaKosh Node/Express] MongoDB connection warning:', err.message));

// FDR Submission Route with Multer Cloudinary Middleware
app.post('/api/fdrs/submit-multipart', uploadFdrDocument, fdrController.submitFDR);
app.post('/api/fdrs/submit', uploadFdrDocument, fdrController.submitFDR);

const PORT = process.env.NODE_PORT || 5000;
if (process.env.START_NODE_SERVER === 'true') {
  app.listen(PORT, () => {
    console.log(`[VidyaKosh Node/Express] Server running on port ${PORT}`);
  });
}

module.exports = app;
