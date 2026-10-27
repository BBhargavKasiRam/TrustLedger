const mongoose = require('mongoose');

const auditLedgerSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, required: true },
  actorId: { type: String, default: 'SYSTEM' },
  actorRole: { type: String, required: true }, // e.g. "INSTITUTE_NODAL_OFFICER", "AICTE_SCRUTINY_OFFICER", "COMPETENT_AUTHORITY", "BANK_BRANCH_MANAGER", "AUTOMATED_CRON_ENGINE"
  actionEvent: { 
    type: String, 
    required: true,
    enum: [
      'FDR_SUBMISSION',
      'RENEWAL_LINKING',
      'MERGER_REPLACEMENT_ATTESTATION',
      'BANK_ATTESTATION_VERIFIED',
      'BANK_DISCREPANCY_FLAGGED',
      'GATE_3_SIGN_OFF',
      'GATE_4_SIGN_OFF',
      'NOC_RELEASE_REQUESTED',
      'NOC_MINTED',
      'NOC_REJECTED',
      'ALERT_DISPATCHED',
      'INTEGRATION_SYNC',
      'SECURITY_CONFIG'
    ]
  },
  targetFdrId: { type: String, default: null },
  ipAddress: { type: String, default: '127.0.0.1' },
  previousBlockHash: { type: String, required: true },
  currentBlockHash: { type: String, required: true, unique: true },
  payloadSummary: { type: String, required: true }
}, {
  timestamps: false,
  collection: 'AuditLedger'
});

// Enforce strict append-only guardrail at Mongoose layer
auditLedgerSchema.pre('updateOne', function() {
  throw new Error('AuditLedger is strictly immutable and append-only.');
});
auditLedgerSchema.pre('updateMany', function() {
  throw new Error('AuditLedger is strictly immutable and append-only.');
});
auditLedgerSchema.pre('deleteOne', function() {
  throw new Error('AuditLedger is strictly immutable and append-only.');
});
auditLedgerSchema.pre('deleteMany', function() {
  throw new Error('AuditLedger is strictly immutable and append-only.');
});

module.exports = mongoose.models.AuditLedger || mongoose.model('AuditLedger', auditLedgerSchema);
