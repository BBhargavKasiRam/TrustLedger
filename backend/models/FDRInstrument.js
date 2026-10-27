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

// Mongoose schema for FDR Instrument with multi-file digitalVault array
const fdrInstrumentSchema = new mongoose.Schema({
  fdr_uid: { type: String, required: true, unique: true },
  institution_id: { type: Number, required: true },
  parent_fdr_id: { type: Number, default: null },
  relation_type: { type: String, default: 'INITIAL_DEPOSIT' },
  
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
  
  // AICTE Requirement 4: Validity & Maturity Tracking
  lifecycle_status: { type: String, default: 'SUBMITTED' },
  lifecycleState: { type: String, default: 'ACTIVE_COMPLIANT' }, // e.g. "MATURITY_T90", "MATURITY_T60", "MATURITY_T30", "EXPIRED_ACTION_REQUIRED", "ACTIVE_COMPLIANT"
  daysRemaining: { type: Number, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.FDRInstrument || mongoose.model('FDRInstrument', fdrInstrumentSchema, 'fdr_instruments');
