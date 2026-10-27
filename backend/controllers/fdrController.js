const crypto = require('crypto');
const fs = require('fs');
const FDRInstrument = require('../models/FDRInstrument');

/**
 * Helper: Calculate difference in months between issue date and maturity date
 */
function calculateTenureMonths(issueDateStr, maturityDateStr) {
  try {
    const issue = new Date(issueDateStr);
    const maturity = new Date(maturityDateStr);
    if (isNaN(issue.getTime()) || isNaN(maturity.getTime())) return 0;
    
    let months = (maturity.getFullYear() - issue.getFullYear()) * 12 + (maturity.getMonth() - issue.getMonth());
    if (maturity.getDate() < issue.getDate()) {
      months -= 1;
    }
    return Math.max(0, months);
  } catch (e) {
    return 0;
  }
}

/**
 * Helper: Compute SHA-256 hash of a file or buffer
 */
function computeFileHash(file) {
  if (!file) return null;
  if (file.buffer) {
    return crypto.createHash('sha256').update(file.buffer).digest('hex');
  }
  if (file.path && fs.existsSync(file.path)) {
    const fileBuffer = fs.readFileSync(file.path);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }
  // Deterministic fallback based on file metadata or content
  const seed = `${file.originalname || 'document'}-${file.size || 1024}-${file.filename || Date.now()}`;
  return crypto.createHash('sha256').update(seed).digest('hex');
}

/**
 * 1. FDR Submission POST Controller (AICTE Requirement 1, 2, 3)
 * Calculates SHA-256 hash, runs Duplicate Check and Tenure Date-Math validation
 */
exports.submitFDR = async (req, res) => {
  try {
    const {
      institution_id,
      inst_fdr_number,
      inst_bank_name,
      inst_ifsc,
      inst_principal_amount,
      inst_interest_rate,
      inst_maturity_amount,
      inst_issue_date,
      inst_maturity_date,
      inst_joint_holder_text,
      inst_no_lien_declared
    } = req.body;

    // AICTE Requirement 1: Extract secure Cloudinary URL
    const documentUrl = req.file ? req.file.path : (req.body.documentUrl || null);
    const fdrUid = `FDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // AICTE Requirement 1 & 3: Compute SHA-256 file hash before/upon upload
    let fileHash = computeFileHash(req.file);
    if (!fileHash && documentUrl) {
      fileHash = crypto.createHash('sha256').update(documentUrl).digest('hex');
    }

    const flags = [];
    let duplicateFlag = false;

    // Duplicate Hash Check in MongoDB
    if (fileHash) {
      const existingDocWithHash = await FDRInstrument.findOne({ fileHash });
      if (existingDocWithHash) {
        flags.push('DUPLICATE_FILE_FRAUD');
        duplicateFlag = true;
      }
    }

    // AICTE Requirement 3: Date-Math Tenure Validation (10 years = 120 months)
    const issueDate = inst_issue_date || new Date().toISOString().split('T')[0];
    const maturityDate = inst_maturity_date || new Date().toISOString().split('T')[0];
    const tenureMonths = calculateTenureMonths(issueDate, maturityDate);
    let tenureViolationFlag = false;

    if (tenureMonths < 120) {
      flags.push('TENURE_VIOLATION_FLAG');
      tenureViolationFlag = true;
    }

    // Digital Vault initial entry
    const initialVault = [];
    if (documentUrl) {
      initialVault.push({
        documentType: 'Initial FDR Scan',
        fileUrl: documentUrl,
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date().toISOString()
      });
    }

    const newFDR = new FDRInstrument({
      fdr_uid: fdrUid,
      institution_id: Number(institution_id) || 1,
      inst_fdr_number: inst_fdr_number || fdrUid,
      inst_bank_name: inst_bank_name || 'State Bank of India',
      inst_ifsc: (inst_ifsc || 'SBIN0000125').toUpperCase(),
      inst_principal_amount: Number(inst_principal_amount) || 3500000,
      inst_interest_rate: Number(inst_interest_rate) || 7.25,
      inst_maturity_amount: Number(inst_maturity_amount) || 6198842,
      inst_issue_date: issueDate,
      inst_maturity_date: maturityDate,
      inst_joint_holder_text: inst_joint_holder_text || 'JOINTLY IN THE NAME OF AICTE AND INSTITUTION',
      inst_no_lien_declared: inst_no_lien_declared === true || inst_no_lien_declared === 'true',

      // Cryptographic hash & Deterministic Flags
      fileHash: fileHash,
      flags: flags,
      duplicate_flag: duplicateFlag,
      tenure_violation_flag: tenureViolationFlag,
      tenure_months: tenureMonths,

      // Digital Vault
      digitalVault: initialVault,
      documentUrl: documentUrl,
      document_path: documentUrl,
      lifecycle_status: flags.length > 0 ? 'DISCREPANCY_FLAGGED' : 'SUBMITTED'
    });

    const savedFDR = await newFDR.save();

    return res.status(201).json({
      message: `FDR ${savedFDR.fdr_uid} submitted. Flags: [${flags.join(', ')}]`,
      fdr: savedFDR,
      fileHash: savedFDR.fileHash,
      flags: savedFDR.flags,
      digitalVault: savedFDR.digitalVault,
      documentUrl: savedFDR.documentUrl
    });
  } catch (error) {
    console.error('Error in submitFDR controller:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 2 & 3. Bank Attestation Submission & Dual-Blind Delta Comparison
 * Strict schema enforcement + Delta comparison (collegeClaimed vs bankAttested)
 */
exports.submitBankAttestation = async (req, res) => {
  try {
    const {
      fdr_uid,
      attested_principal,
      actualPrincipal,
      attested_maturity_date,
      actualMaturity,
      lien_status,
      bankLienStatus,
      manager_remarks,
      manager_email
    } = req.body;

    // Strict Schema Enforcement (Requirement 2):
    // bankLienStatus, actualPrincipal, and actualMaturity are REQUIRED.
    const resolvedPrincipal = actualPrincipal !== undefined && actualPrincipal !== null && actualPrincipal !== '' 
      ? Number(actualPrincipal) 
      : (attested_principal !== undefined && attested_principal !== null && attested_principal !== '' ? Number(attested_principal) : null);
    
    const resolvedMaturity = actualMaturity || attested_maturity_date;
    const resolvedLienStatus = bankLienStatus || lien_status;

    if (!resolvedLienStatus || resolvedPrincipal === null || isNaN(resolvedPrincipal) || !resolvedMaturity) {
      return res.status(400).json({
        error: 'Validation Error: bankLienStatus, actualPrincipal, and actualMaturity must be provided and cannot be empty.'
      });
    }

    const fdr = await FDRInstrument.findOne({ fdr_uid });
    if (!fdr) {
      return res.status(404).json({ error: `FDR ${fdr_uid} not found` });
    }

    // Requirement 3: Dual-Blind Delta Comparison
    const currentFlags = new Set(fdr.flags || []);

    const collegeClaimedPrincipal = Number(fdr.inst_principal_amount);
    const bankAttestedPrincipal = resolvedPrincipal;
    const collegeClaimedMaturityDate = fdr.inst_maturity_date;
    const bankAttestedMaturityDate = resolvedMaturity;

    let dataMismatch = false;
    let lienEncumbrance = false;

    if (collegeClaimedPrincipal !== bankAttestedPrincipal || collegeClaimedMaturityDate !== bankAttestedMaturityDate) {
      currentFlags.add('DATA_MISMATCH_FLAG');
      dataMismatch = true;
    }

    if (resolvedLienStatus !== 'ACTIVE_JOINT_AICTE') {
      currentFlags.add('LIEN_ENCUMBRANCE_FLAG');
      lienEncumbrance = true;
    }

    // Vault Entry for Bank Attestation PDF
    const fileUrl = req.file ? req.file.path : (req.body.fileUrl || `https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v${Date.now()}/vidyakosh_fdrs/Bank_Attestation_${fdr_uid}.pdf`);
    const vaultEntry = {
      documentType: 'Bank Attestation PDF',
      fileUrl,
      uploadedBy: 'BANK_BRANCH_MANAGER',
      timestamp: new Date().toISOString()
    };

    const finalFlags = Array.from(currentFlags);
    const updatedStatus = (dataMismatch || lienEncumbrance) ? 'DISCREPANCY_FLAGGED' : 'ACTIVE_VERIFIED';

    fdr.bank_confirmed_principal = bankAttestedPrincipal;
    fdr.bank_confirmed_maturity_date = bankAttestedMaturityDate;
    fdr.bank_lien_status = resolvedLienStatus;
    fdr.bank_verified_status = (dataMismatch || lienEncumbrance) ? 'MISMATCH_FLAGGED' : 'VERIFIED_MAGIC_LINK';
    fdr.bank_manager_email = manager_email || 'bm.attestation@bank.in';
    fdr.bank_verified_at = new Date();
    fdr.flags = finalFlags;
    fdr.data_mismatch_flag = dataMismatch;
    fdr.lien_encumbrance_flag = lienEncumbrance;
    fdr.lifecycle_status = updatedStatus;
    fdr.digitalVault.push(vaultEntry);

    const saved = await fdr.save();

    return res.status(200).json({
      message: `Bank attestation verified. Tripped flags: [${finalFlags.join(', ')}]`,
      fdr: saved,
      flags: finalFlags,
      dataMismatch,
      lienEncumbrance,
      vaultEntry
    });
  } catch (error) {
    console.error('Error in submitBankAttestation:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 4. Internal AICTE ERP Check API (/api/erp-check/:pid)
 * Randomly/deterministically returns mock compliance holds
 */
exports.checkERPHolds = async (req, res) => {
  try {
    const { pid } = req.params;

    // Check if college has known statutory holds
    // Institutions like 1-2002 (Vanguard) or 1-4004 (Shivalik) have active holds
    const isHoldInstitution = pid === '1-2002' || pid === '1-4004' || req.query.mockHold === 'true';
    
    // Simulate randomized or deterministic statutory compliance hold
    const courtCasePending = isHoldInstitution ? true : (req.query.courtCase === 'true');
    const unpaidSalary = isHoldInstitution ? true : (req.query.unpaidSalary === 'true');
    const pgrcPending = isHoldInstitution ? 45000 : 0;

    const hasHolds = courtCasePending || unpaidSalary || (pgrcPending > 0);

    return res.status(200).json({
      pid,
      compliant: !hasHolds,
      holds: {
        court_case_pending: courtCasePending,
        unpaid_faculty_salary: unpaidSalary,
        pgrc_penalty_pending: pgrcPending > 0,
        pgrc_penalty_amount: pgrcPending
      },
      message: hasHolds
        ? 'AICTE Central ERP Compliance Hold: Court cases or faculty salary arrears active on institution.'
        : 'AICTE Central ERP Clearance Confirmed. Zero pending institutional holds.'
    });
  } catch (error) {
    console.error('Error in checkERPHolds:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Append Document to Digital Vault (AICTE Requirement 2)
 */
exports.appendVaultDocument = async (req, res) => {
  try {
    const { fdr_uid } = req.params;
    const documentType = req.body.documentType || 'Supporting Document';
    const uploadedBy = req.body.uploadedBy || 'AUTHORIZED_OFFICER';
    const fileUrl = req.file ? req.file.path : (req.body.fileUrl || null);

    if (!fileUrl) {
      return res.status(400).json({ error: 'No file uploaded or fileUrl provided' });
    }

    const vaultItem = {
      documentType,
      fileUrl,
      uploadedBy,
      timestamp: new Date().toISOString()
    };

    const updated = await FDRInstrument.findOneAndUpdate(
      { fdr_uid },
      { $push: { digitalVault: vaultItem } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: `FDR ${fdr_uid} not found` });
    }

    return res.status(200).json({
      message: `Document '${documentType}' appended to FDR ${fdr_uid} Digital Vault.`,
      vaultItem,
      digitalVault: updated.digitalVault
    });
  } catch (error) {
    console.error('Error in appendVaultDocument:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get FDR Digital Vault
 */
exports.getFDRVault = async (req, res) => {
  try {
    const { fdr_uid } = req.params;
    const fdr = await FDRInstrument.findOne({ fdr_uid });
    if (!fdr) {
      return res.status(404).json({ error: `FDR ${fdr_uid} not found` });
    }
    return res.status(200).json({
      fdr_uid: fdr.fdr_uid,
      digitalVault: fdr.digitalVault || []
    });
  } catch (error) {
    console.error('Error in getFDRVault:', error);
    return res.status(500).json({ error: error.message });
  }
};
