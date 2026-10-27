const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { uploadFdrDocument } = require('./middleware/upload');
const fdrController = require('./controllers/fdrController');
const { initValidityTrackingCron, runDailyValidityTrackingSweep } = require('./cron/validityTracker');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/vidyakosh';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('[VidyaKosh Node/Express] Connected to MongoDB');
    // AICTE Requirement 4: Initialize Automated Validity & Maturity Tracking Cron (0 0 * * *)
    initValidityTrackingCron();
  })
  .catch((err) => console.warn('[VidyaKosh Node/Express] MongoDB connection warning:', err.message));

// AICTE Requirement 1 & 2: FDR Submission with Multer Cloudinary Middleware
app.post('/api/fdrs/submit-multipart', uploadFdrDocument, fdrController.submitFDR);
app.post('/api/fdrs/submit', uploadFdrDocument, fdrController.submitFDR);

// AICTE Requirement 2 & 3: Digital Vault & Bank Attestation Endpoints
app.get('/api/fdrs/:fdr_uid/vault', fdrController.getFDRVault);
app.post('/api/fdrs/:fdr_uid/vault', uploadFdrDocument, fdrController.appendVaultDocument);
app.post('/api/bank/tier2-submit-attestation-multipart', uploadFdrDocument, fdrController.submitBankAttestation);
app.post('/api/bank/tier2-submit-attestation', uploadFdrDocument, fdrController.submitBankAttestation);

// AICTE Requirement 3: Mock Internal AICTE ERP Check API
app.get('/api/erp-check/:pid', fdrController.checkERPHolds);

// AICTE Requirement 4: Automated Validity & Maturity Tracking Trigger Endpoint
app.all('/api/cron/check-maturities', async (req, res) => {
  try {
    const sweepResult = await runDailyValidityTrackingSweep();
    return res.status(200).json({
      success: true,
      message: 'Automated validity tracking sweep completed successfully.',
      ...sweepResult
    });
  } catch (error) {
    console.error('Manual cron sweep error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.NODE_PORT || 5000;
if (process.env.START_NODE_SERVER === 'true') {
  app.listen(PORT, () => {
    console.log(`[VidyaKosh Node/Express] Server running on port ${PORT}`);
  });
}

module.exports = app;
