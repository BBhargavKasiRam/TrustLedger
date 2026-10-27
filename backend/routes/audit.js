const express = require('express');
const router = express.Router();
const AuditLedger = require('../models/AuditLedger');
const { verifyAuditChain } = require('../utils/auditLogger');
const { authenticateJWT, requireRole } = require('../middleware/auth');

/**
 * AICTE Requirement 9: Verify Cryptographic Hash Chain from Genesis Root
 * GET /api/audit/verify-chain
 */
router.get('/verify-chain', async (req, res) => {
  try {
    const verification = await verifyAuditChain();
    return res.status(200).json(verification);
  } catch (error) {
    console.error('Error in verifyAuditChain route:', error);
    return res.status(500).json({
      integrity_verified: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/logs
 * Returns latest audit trail records (Read-Only)
 */
router.get('/logs', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const filter = {};
    if (req.query.targetFdrId) {
      filter.targetFdrId = req.query.targetFdrId;
    }
    if (req.query.actionEvent) {
      filter.actionEvent = req.query.actionEvent;
    }

    const logs = await AuditLedger.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);

    return res.status(200).json({
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
