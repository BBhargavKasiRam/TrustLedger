const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const { uploadFdrDocument } = require('./middleware/upload');
const { authenticateJWT, requireRole } = require('./middleware/auth');
const fdrController = require('./controllers/fdrController');
const { initValidityTrackingCron, runDailyValidityTrackingSweep } = require('./cron/validityTracker');

// Route modules
const reportsRouter = require('./routes/reports');
const integrationRouter = require('./routes/integration');
const auditRouter = require('./routes/audit');

const app = express();

// AICTE Requirement 10: Security Headers & Rate Limiting
app.use(helmet({
  crossOriginResourcePolicy: false // Allow Cloudinary PDFs and media assets
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});
app.use(limiter);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with Resilient Fallback
async function initDatabase() {
  const mongoUri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/vidyakosh';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[VidyaKosh Node/Express] Connected to MongoDB successfully');
  } catch (err) {
    console.warn('[VidyaKosh Node/Express] External MongoDB connection failed:', err.message);
    console.log('[VidyaKosh Node/Express] Activating resilient in-memory MongoDB server fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    console.log('[VidyaKosh Node/Express] Connected to in-memory MongoDB at:', memoryServer.getUri());
  }

  // AICTE Requirement 4 & 7: Initialize Automated Validity & Maturity Tracking Cron (0 0 * * *)
  initValidityTrackingCron();
}
initDatabase();

// AICTE Requirement 1 & 2: FDR Submission with Multer Cloudinary Middleware
app.post('/api/fdrs/submit-multipart', uploadFdrDocument, fdrController.submitFDR);
app.post('/api/fdrs/submit', uploadFdrDocument, fdrController.submitFDR);
app.get('/api/fdrs', authenticateJWT, fdrController.getAllFDRs);

// AICTE Requirement 2 & 3: Digital Vault & Bank Attestation Endpoints
app.get('/api/fdrs/:fdr_uid/vault', fdrController.getFDRVault);
app.post('/api/fdrs/:fdr_uid/vault', uploadFdrDocument, fdrController.appendVaultDocument);
app.post('/api/bank/tier2-submit-attestation-multipart', uploadFdrDocument, fdrController.submitBankAttestation);
app.post('/api/bank/tier2-submit-attestation', uploadFdrDocument, fdrController.submitBankAttestation);

// AICTE Requirement 3: Internal AICTE ERP Check API
app.get('/api/erp-check/:pid', fdrController.checkERPHolds);

// AICTE Requirement 5: Deposit Lineage & History Tracking
app.post('/api/fdrs/submit-renewal', uploadFdrDocument, fdrController.submitRenewal);
app.get('/api/fdr/:id/lineage', fdrController.getLineageDAG);
app.get('/api/fdrs/:id/lineage', fdrController.getLineageDAG);
app.get('/api/fdrs/lineage-by-institution/:institution_id', fdrController.getInstitutionLineage);

// AICTE Requirement 6: 4-Gate Trackable Release & Refund Workflow
app.post('/api/fdr/:id/request-release', authenticateJWT, fdrController.requestRelease);
app.post('/api/fdrs/:id/request-release', authenticateJWT, fdrController.requestRelease);

app.post('/api/fdr/:id/gate3-recommend', authenticateJWT, requireRole(['AICTE_SCRUTINY_OFFICER', 'COMPETENT_AUTHORITY', 'ADMIN']), fdrController.recommendGate3);
app.post('/api/fdrs/:id/gate3-recommend', authenticateJWT, requireRole(['AICTE_SCRUTINY_OFFICER', 'COMPETENT_AUTHORITY', 'ADMIN']), fdrController.recommendGate3);

// Competent Authority strictly protected endpoint (Nodal Officers blocked with 403)
app.post('/api/fdr/:id/mint-noc', authenticateJWT, requireRole(['COMPETENT_AUTHORITY', 'ADMIN']), fdrController.mintNoc);
app.post('/api/fdrs/:id/mint-noc', authenticateJWT, requireRole(['COMPETENT_AUTHORITY', 'ADMIN']), fdrController.mintNoc);

// AICTE Requirement 8: Consolidated Executive Dashboard & Reporting
app.use('/api/reports', reportsRouter);

// AICTE Requirement 9: Cryptographic Audit Trail
app.use('/api/audit', auditRouter);

// AICTE Requirement 10: System Integration Webhook Gateway (Protected by x-api-key)
app.use('/api/integration/v1', integrationRouter);

// AICTE Requirement 4 & 7: Manual Trigger for Automated Sweep
app.all('/api/cron/check-maturities', async (req, res) => {
  try {
    const sweepResult = await runDailyValidityTrackingSweep();
    return res.status(200).json({
      success: true,
      message: 'Automated validity tracking and SLA escalation sweep completed successfully.',
      ...sweepResult
    });
  } catch (error) {
    console.error('Manual cron sweep error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.NODE_PORT || 5000;
if (require.main === module || process.env.START_NODE_SERVER === 'true') {
  app.listen(PORT, () => {
    console.log(`[VidyaKosh Node/Express] Server running on port ${PORT}`);
  });
}

module.exports = app;
