const mongoose = require('mongoose');

// Mongoose sub-schema for Digital Vault documents (AICTE Requirement 2)
const vaultDocumentSchema = new mongoose.Schema({
  documentType: { 
    type: String, 
    required: true,
    enum: ['Initial FDR Scan', 'Bank Attestation PDF', 'Discharge NOC', 'Statutory Clearance', 'Other']
  },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: String, required: true }, // e.g. "INSTITUTE_NODAL_OFFICER", "BANK_BRANCH_MANAGER", "COMPETENT_AUTHORITY", "AICTE_SCRUTINY_OFFICER"
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

// Mongoose schema for FDR Instrument with multi-file digitalVault array and full AICTE Compliance tracking
const fdrInstrumentSchema = new mongoose.Schema({
  fdr_uid: { type: String, required: true, unique: true },
  institution_id: { type: Number, required: true },
  institution_name: { type: String, default: 'Technical Institution' },
  pid: { type: String, default: '1-2001' },
  
  // AICTE Requirement 5: Deposit Lineage & History Tracking
  parent_fdr_id: { type: Number, default: null },
  parentFdrId: { type: String, default: null }, // Reference to older superseded FDR UID or ID
  childFdrId: { type: String, default: null },  // Reference to newer renewal FDR UID or ID
  relation_type: { type: String, default: 'INITIAL_DEPOSIT' },
  renewalType: { 
    type: String, 
    enum: ['INITIAL_DEPOSIT', '5_YEAR_RENEWAL', 'BANK_MERGER_REPLACEMENT', 'MATURITY_RENEWAL', 'OTHER'], 
    default: 'INITIAL_DEPOSIT' 
  },
  
  // Institution Claim (Col A)
  inst_fdr_number: { type: String, required: true },
  inst_bank_name: { type: String, required: true },
  inst_ifsc: { type: String, required: true },
  inst_principal_amount: { type: Number, required: true },
  inst_interest_rate: { type: Number, default: 7.25 },
  inst_maturity_amount: { type: Number, required: true },
  inst_issue_date: { type: String, required: true },
  inst_maturity_date: { type: String, required: true },
  inst_joint_holder_text: { type: String },
  inst_no_lien_declared: { type: Boolean, default: true },

  // AICTE Requirement 2: Multi-file Digital Vault array
  digitalVault: { type: [vaultDocumentSchema], default: [] },

  // AICTE Requirement 3: Cryptographic Hash & Deterministic Discrepancy Flags
  fileHash: { type: String, default: null },
  flags: { type: [String], default: [] }, // e.g. ["DUPLICATE_FILE_FRAUD", "TENURE_VIOLATION_FLAG", "DATA_MISMATCH_FLAG", "LIEN_ENCUMBRANCE_FLAG", "CROSS_REGISTRY_HOLD_FLAG"]
  duplicate_flag: { type: Boolean, default: false },
  tenure_violation_flag: { type: Boolean, default: false },
  data_mismatch_flag: { type: Boolean, default: false },
  lien_encumbrance_flag: { type: Boolean, default: false },
  cross_registry_hold_flag: { type: Boolean, default: false },
  tenure_months: { type: Number, default: null },

  // Supporting Document URL (Cloudinary Secure URL - maintained for backward compatibility)
  documentUrl: { type: String, default: null },
  document_path: { type: String, default: null },

  // Bank Attestation (Col C)
  bank_verified_status: { type: String, default: 'PENDING' },
  bank_confirmed_principal: { type: Number, default: null },
  bank_confirmed_maturity_date: { type: String, default: null },
  bankAttestedMaturityDate: { type: String, default: null },
  bank_lien_status: { type: String, default: 'PENDING' },
  bank_manager_email: { type: String, default: null },
  bank_verified_at: { type: Date, default: null },
  
  // AICTE Requirement 4 & 6: Validity, Maturity & Lifecycle States
  lifecycle_status: { type: String, default: 'SUBMITTED' },
  lifecycleState: { 
    type: String, 
    default: 'ACTIVE_COMPLIANT',
    enum: [
      'SUBMITTED',
      'PENDING_BANK_VERIFICATION',
      'ACTIVE_COMPLIANT', 
      'ACTIVE_VERIFIED', 
      'MATURITY_T90', 
      'MATURITY_T60', 
      'MATURITY_T30', 
      'EXPIRED_ACTION_REQUIRED', 
      'SUPERSEDED_BY_RENEWAL', 
      'NOC_RELEASE_REQUESTED', 
      'PENDING_COMPETENT_AUTHORITY', 
      'NOC_ISSUED', 
      'RELEASE_REJECTED',
      'DISCREPANCY_FLAGGED'
    ]
  },
  daysRemaining: { type: Number, default: null },

  // AICTE Requirement 6: 4-Gate Trackable Release & Refund Workflow
  gate1_tenure_passed: { type: Boolean, default: false },
  gate2_erp_compliance_passed: { type: Boolean, default: false },
  gate3_scrutiny_officer_approved: { type: Boolean, default: false },
  gate3_remarks: { type: String, default: '' },
  gate3_reviewed_at: { type: Date, default: null },
  gate4_competent_authority_approved: { type: Boolean, default: false },
  gate4_approved_at: { type: Date, default: null },
  noc_certificate_hash: { type: String, default: null },
  noc_certificate_url: { type: String, default: null },
  release_requested_at: { type: Date, default: null },
  release_rejection_reason: { type: String, default: null },

  // AICTE Requirement 7: Escalation & SLA Tracking
  slaBreached: { type: Boolean, default: false },
  slaBreachReason: { type: String, default: null },
  softHoldEoa: { type: Boolean, default: false },
  lastActionTimestamp: { type: Date, default: Date.now },

  // AICTE Requirement 10: AES-256 Encrypted Sensitive Data at Rest
  bankAccountNumber: { type: String, default: null }, // Encrypted
  maskedBankAccountNumber: { type: String, default: null }, // Plaintext masked
  cbsSessionToken: { type: String, default: null }, // Encrypted
  dscPinHash: { type: String, default: null }, // Hashed / Encrypted

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.FDRInstrument || mongoose.model('FDRInstrument', fdrInstrumentSchema, 'fdr_instruments');
