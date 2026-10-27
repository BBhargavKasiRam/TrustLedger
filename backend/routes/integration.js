const express = require('express');
const router = express.Router();
const FDRInstrument = require('../models/FDRInstrument');
const { requireIntegrationKey } = require('../middleware/auth');
const { logAuditEvent } = require('../utils/auditLogger');

// All endpoints in this router require the MASTER_INTEGRATION_KEY
router.use(requireIntegrationKey);

/**
 * AICTE Requirement 10: System Integration Webhook & Gateway
 * GET /api/integration/v1/institution-status/:pid
 */
router.get('/institution-status/:pid', async (req, res) => {
  try {
    const { pid } = req.params;

    const fdrs = await FDRInstrument.find({
      $or: [
        { pid },
        { institution_id: Number(pid.replace(/\D/g, '')) || -1 }
      ]
    });

    if (fdrs.length === 0) {
      return res.status(404).json({
        success: false,
        pid,
        message: `No FDR records registered in AICTE VidyaKosh repository for PID: ${pid}`
      });
    }

    const hasSoftHold = fdrs.some(f => f.softHoldEoa === true);
    const hasDiscrepancy = fdrs.some(f => f.flags && f.flags.length > 0);
    const hasExpiredOverdue = fdrs.some(f => f.lifecycleState === 'EXPIRED_ACTION_REQUIRED');

    let totalActivePrincipal = 0;
    const activeInstruments = [];

    fdrs.forEach(f => {
      if (['ACTIVE_COMPLIANT', 'ACTIVE_VERIFIED', 'MATURITY_T90', 'MATURITY_T60', 'MATURITY_T30'].includes(f.lifecycleState)) {
        totalActivePrincipal += (f.bank_confirmed_principal || f.inst_principal_amount || 0);
        activeInstruments.push({
          fdr_uid: f.fdr_uid,
          receipt_no: f.inst_fdr_number,
          bank: f.inst_bank_name,
          principal: f.bank_confirmed_principal || f.inst_principal_amount,
          maturity_date: f.bankAttestedMaturityDate || f.inst_maturity_date,
          state: f.lifecycleState,
          masked_account: f.maskedBankAccountNumber || 'XXXX-XXXX-8912'
        });
      }
    });

    const isFullyCompliant = !hasSoftHold && !hasDiscrepancy && !hasExpiredOverdue && totalActivePrincipal >= 3500000;

    // Log integration read in AuditLedger
    await logAuditEvent({
      actorId: 'AICTE_NSWS_PORTAL_WEBHOOK',
      actorRole: 'SYSTEM',
      actionEvent: 'INTEGRATION_SYNC',
      targetFdrId: fdrs[0]?.fdr_uid || null,
      ipAddress: req.ip || '127.0.0.1',
      payloadSummary: `External NSWS query executed for PID ${pid}. Compliance: ${isFullyCompliant ? 'CLEAR' : 'FLAGGED'}`
    });

    return res.status(200).json({
      success: true,
      pid,
      institution_name: fdrs[0]?.institution_name || 'Technical Institution',
      compliance_status: isFullyCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
      regulatory_hold: hasSoftHold,
      statutory_fdr_norm_met: totalActivePrincipal >= 3500000,
      active_principal_deposited: totalActivePrincipal,
      total_records_count: fdrs.length,
      active_instruments: activeInstruments,
      active_flags: [...new Set(fdrs.flatMap(f => f.flags || []))],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in institution-status integration route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/integration/v1/verify-fdr/:fdrUid
 */
router.get('/verify-fdr/:fdrUid', async (req, res) => {
  try {
    const { fdrUid } = req.params;
    const fdr = await FDRInstrument.findOne({ fdr_uid: fdrUid });

    if (!fdr) {
      return res.status(404).json({ success: false, message: `FDR ${fdrUid} not found` });
    }

    return res.status(200).json({
      success: true,
      fdr_uid: fdr.fdr_uid,
      pid: fdr.pid,
      institution_name: fdr.institution_name,
      bank: fdr.inst_bank_name,
      principal: fdr.bank_confirmed_principal || fdr.inst_principal_amount,
      lifecycle_state: fdr.lifecycleState,
      lien_status: fdr.bank_lien_status,
      vault_documents: (fdr.digitalVault || []).map(v => ({
        type: v.documentType,
        url: v.fileUrl,
        uploaded_by: v.uploadedBy,
        timestamp: v.timestamp
      }))
    });
  } catch (error) {
    console.error('Error in verify-fdr integration route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
