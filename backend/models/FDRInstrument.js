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

  // Supporting Document URL (Cloudinary Secure URL - maintained for backward compatibility)
  documentUrl: { type: String, default: null },
  document_path: { type: String, default: null },

  // Bank Attestation (Col C)
  bank_verified_status: { type: String, default: 'PENDING' },
  bank_confirmed_principal: { type: Number, default: null },
  bank_confirmed_maturity_date: { type: String, default: null },
  bank_lien_status: { type: String, default: 'PENDING' },
  
  lifecycle_status: { type: String, default: 'SUBMITTED' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.FDRInstrument || mongoose.model('FDRInstrument', fdrInstrumentSchema, 'fdr_instruments');
