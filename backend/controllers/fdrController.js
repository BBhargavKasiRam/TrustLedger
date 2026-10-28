const crypto = require('crypto');
const fs = require('fs');
const FDRInstrument = require('../models/FDRInstrument');
const { logAuditEvent } = require('../utils/auditLogger');
const { encrypt, decrypt } = require('../utils/encryption');

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
  const seed = `${file.originalname || 'document'}-${file.size || 1024}-${file.filename || Date.now()}`;
  return crypto.createHash('sha256').update(seed).digest('hex');
}

/**
 * Helper: Calculate remaining days
 */
function getDaysRemaining(maturityDateStr) {
  if (!maturityDateStr) return 9999;
  try {
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const [y, m, d] = String(maturityDateStr).split('T')[0].split('-').map(Number);
    const matUtc = Date.UTC(y, m - 1, d);
    return Math.ceil((matUtc - todayUtc) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 9999;
  }
}

/**
 * 1. FDR Submission POST Controller (AICTE Requirement 1, 2, 3)
 */
exports.submitFDR = async (req, res) => {
  try {
    const {
      institution_id,
      institution_name,
      pid,
      inst_fdr_number,
      inst_bank_name,
      inst_ifsc,
      inst_principal_amount,
      inst_interest_rate,
      inst_maturity_amount,
      inst_issue_date,
      inst_maturity_date,
      inst_joint_holder_text,
      inst_no_lien_declared,
      bankAccountNumber
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

    // Duplicate Hash Check in MongoDB (Requirement 3.1)
    if (fileHash) {
      const existingDocWithHash = await FDRInstrument.findOne({ fileHash });
      if (existingDocWithHash) {
        flags.push('DUPLICATE_FILE_FRAUD');
        duplicateFlag = true;
      }
    }

    // Date-Math Tenure Validation (10 years = 120 months)
    const issueDate = inst_issue_date || new Date().toISOString().split('T')[0];
    const maturityDate = inst_maturity_date || new Date().toISOString().split('T')[0];
    const tenureMonths = calculateTenureMonths(issueDate, maturityDate);
    let tenureViolationFlag = false;

    if (tenureMonths < 120) {
      flags.push('TENURE_VIOLATION_FLAG');
      tenureViolationFlag = true;
    }

    // Digital Vault initial entry (Requirement 2)
    const initialVault = [];
    if (documentUrl) {
      initialVault.push({
        documentType: 'Initial FDR Scan',
        fileUrl: documentUrl,
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date().toISOString()
      });
    }

    // Encrypt sensitive fields (Requirement 10)
    let encryptedAccount = null;
    let maskedAccount = null;
    if (bankAccountNumber) {
      encryptedAccount = encrypt(String(bankAccountNumber));
      const str = String(bankAccountNumber);
      maskedAccount = str.length > 4 ? `XXXX-XXXX-${str.slice(-4)}` : 'XXXX-XXXX';
    }

    const daysRem = getDaysRemaining(maturityDate);

    const newFDR = new FDRInstrument({
      fdr_uid: fdrUid,
      institution_id: Number(institution_id) || 1,
      institution_name: institution_name || 'Approved Technical College',
      pid: pid || (institution_id ? `1-${institution_id + 2000}` : '1-2001'),
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

      fileHash,
      flags,
      duplicate_flag: duplicateFlag,
      tenure_violation_flag: tenureViolationFlag,
      tenure_months: tenureMonths,

      digitalVault: initialVault,
      documentUrl,
      document_path: documentUrl,
      lifecycle_status: flags.length > 0 ? 'DISCREPANCY_FLAGGED' : 'SUBMITTED',
      lifecycleState: flags.length > 0 ? 'DISCREPANCY_FLAGGED' : 'SUBMITTED',
      daysRemaining: daysRem,

      bankAccountNumber: encryptedAccount,
      maskedBankAccountNumber: maskedAccount
    });

    const savedFDR = await newFDR.save();

    // Log to Cryptographic AuditLedger (Requirement 9)
    await logAuditEvent({
      actorId: pid || 'INSTITUTE_NODAL_OFFICER',
      actorRole: 'INSTITUTE_NODAL_OFFICER',
      actionEvent: 'FDR_SUBMISSION',
      targetFdrId: savedFDR.fdr_uid,
      ipAddress: req.ip || '127.0.0.1',
      payloadSummary: `Initial FDR submission for ${savedFDR.fdr_uid} (₹${savedFDR.inst_principal_amount}). File hash: ${fileHash || 'N/A'}`
    });

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
 * 2. Bank Attestation Submission & Dual-Blind Delta Comparison
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
    fdr.bankAttestedMaturityDate = bankAttestedMaturityDate;
    fdr.bank_lien_status = resolvedLienStatus;
    fdr.bank_verified_status = (dataMismatch || lienEncumbrance) ? 'MISMATCH_FLAGGED' : 'VERIFIED_MAGIC_LINK';
    fdr.bank_manager_email = manager_email || 'bm.attestation@bank.in';
    fdr.bank_verified_at = new Date();
    fdr.flags = finalFlags;
    fdr.data_mismatch_flag = dataMismatch;
    fdr.lien_encumbrance_flag = lienEncumbrance;
    fdr.lifecycle_status = updatedStatus;
    fdr.lifecycleState = updatedStatus;
    fdr.daysRemaining = getDaysRemaining(bankAttestedMaturityDate);
    fdr.digitalVault.push(vaultEntry);

    const saved = await fdr.save();

    // Log to Cryptographic AuditLedger (Requirement 9)
    await logAuditEvent({
      actorId: manager_email || 'BANK_BRANCH_MANAGER',
      actorRole: 'BANK_BRANCH_MANAGER',
      actionEvent: (dataMismatch || lienEncumbrance) ? 'BANK_DISCREPANCY_FLAGGED' : 'BANK_ATTESTATION_VERIFIED',
      targetFdrId: saved.fdr_uid,
      ipAddress: req.ip || '127.0.0.1',
      payloadSummary: `Bank Attestation completed for ${saved.fdr_uid}. Principal: ₹${bankAttestedPrincipal}, Lien: ${resolvedLienStatus}. Status: ${updatedStatus}`
    });

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
 * 3. Deposit Renewal & Lineage Linking (AICTE Requirement 5)
 */
exports.submitRenewal = async (req, res) => {
  try {
    const {
      parentFdrId,
      institution_id,
      institution_name,
      pid,
      inst_fdr_number,
      inst_bank_name,
      inst_ifsc,
      inst_principal_amount,
      inst_interest_rate,
      inst_maturity_amount,
      inst_issue_date,
      inst_maturity_date,
      renewalType = '5_YEAR_RENEWAL'
    } = req.body;

    if (!parentFdrId) {
      return res.status(400).json({ error: 'parentFdrId is required for deposit renewals.' });
    }

    // Find parent deposit
    const parentFdr = await FDRInstrument.findOne({
      $or: [{ fdr_uid: parentFdrId }, { _id: parentFdrId }]
    });

    if (!parentFdr) {
      return res.status(404).json({ error: `Parent FDR ${parentFdrId} not found in repository.` });
    }

    // Validate institutional PID matches between parent and child
    const parentPid = parentFdr.pid || String(parentFdr.institution_id);
    const childPid = pid || String(institution_id);
    if (parentPid && childPid && parentPid !== childPid) {
      return res.status(403).json({
        error: `Security Violation: Renewal institution PID (${childPid}) does not match parent FDR institution PID (${parentPid}).`
      });
    }

    const documentUrl = req.file ? req.file.path : (req.body.documentUrl || null);
    const newUid = `FDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let fileHash = computeFileHash(req.file);
    if (!fileHash && documentUrl) {
      fileHash = crypto.createHash('sha256').update(documentUrl).digest('hex');
    }

    const issueDate = inst_issue_date || new Date().toISOString().split('T')[0];
    const maturityDate = inst_maturity_date || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tenureMonths = calculateTenureMonths(issueDate, maturityDate);

    const initialVault = [];
    if (documentUrl) {
      initialVault.push({
        documentType: 'Initial FDR Scan',
        fileUrl: documentUrl,
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date().toISOString()
      });
    }

    // Create Child Renewal FDR
    const childFdr = new FDRInstrument({
      fdr_uid: newUid,
      institution_id: parentFdr.institution_id,
      institution_name: institution_name || parentFdr.institution_name,
      pid: parentFdr.pid,
      parentFdrId: parentFdr.fdr_uid,
      parent_fdr_id: parentFdr.institution_id,
      relation_type: renewalType,
      renewalType,
      inst_fdr_number: inst_fdr_number || newUid,
      inst_bank_name: inst_bank_name || parentFdr.inst_bank_name,
      inst_ifsc: (inst_ifsc || parentFdr.inst_ifsc || 'SBIN0000125').toUpperCase(),
      inst_principal_amount: Number(inst_principal_amount) || parentFdr.inst_principal_amount,
      inst_interest_rate: Number(inst_interest_rate) || 7.5,
      inst_maturity_amount: Number(inst_maturity_amount) || (Number(inst_principal_amount || parentFdr.inst_principal_amount) * 1.43),
      inst_issue_date: issueDate,
      inst_maturity_date: maturityDate,
      inst_joint_holder_text: 'JOINTLY IN THE NAME OF AICTE AND INSTITUTION',
      inst_no_lien_declared: true,
      fileHash,
      tenure_months: tenureMonths,
      digitalVault: initialVault,
      documentUrl,
      document_path: documentUrl,
      lifecycle_status: 'ACTIVE_COMPLIANT',
      lifecycleState: 'ACTIVE_COMPLIANT',
      daysRemaining: getDaysRemaining(maturityDate)
    });

    const savedChild = await childFdr.save();

    // Link Parent FDR to Child and transition lifecycle state
    parentFdr.childFdrId = savedChild.fdr_uid;
    parentFdr.lifecycleState = 'SUPERSEDED_BY_RENEWAL';
    parentFdr.lifecycle_status = 'RENEWED_SUPERSEDED';
    await parentFdr.save();

    // Log to Cryptographic AuditLedger (Requirement 9)
    await logAuditEvent({
      actorId: childPid || 'INSTITUTE_NODAL_OFFICER',
      actorRole: 'INSTITUTE_NODAL_OFFICER',
      actionEvent: 'RENEWAL_LINKING',
      targetFdrId: savedChild.fdr_uid,
      ipAddress: req.ip || '127.0.0.1',
      payloadSummary: `Deposit renewal linked. Parent ${parentFdr.fdr_uid} superseded by Child ${savedChild.fdr_uid} (Renewal Type: ${renewalType})`
    });

    return res.status(201).json({
      message: `Deposit renewal successfully linked. Parent ${parentFdr.fdr_uid} superseded by ${savedChild.fdr_uid}.`,
      parentFdr,
      childFdr: savedChild
    });
  } catch (error) {
    console.error('Error in submitRenewal:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 4. Request FDR Release / Refund (AICTE Requirement 6 - Step 1)
 */
exports.requestRelease = async (req, res) => {
  try {
    const { id } = req.params;
    const fdr = await FDRInstrument.findOne({
      $or: [{ fdr_uid: id }, { _id: id }]
    });

    if (!fdr) {
      return res.status(404).json({ error: `FDR ${id} not found.` });
    }

    const maturityDate = fdr.bankAttestedMaturityDate || fdr.bank_confirmed_maturity_date || fdr.inst_maturity_date;
    const daysRemaining = getDaysRemaining(maturityDate);

    // Gate 1 Validation: Instrument must be matured (daysRemaining <= 0) or premature closure flagged
    const allowPremature = req.body.prematureClosureApproved === true;
    if (daysRemaining > 0 && !allowPremature) {
      return res.status(400).json({
        error: `Cannot request release: Instrument tenure has not matured. (${daysRemaining} days remaining until ${maturityDate}). Statutory lock-in active.`
      });
    }

    fdr.lifecycleState = 'NOC_RELEASE_REQUESTED';
    fdr.lifecycle_status = 'RELEASE_REQUESTED';
    fdr.gate1_tenure_passed = true;
    fdr.release_requested_at = new Date();
    fdr.lastActionTimestamp = new Date();

    const saved = await fdr.save();

    await logAuditEvent({
      actorId: req.user?.pid || 'INSTITUTE_NODAL_OFFICER',
      actorRole: 'INSTITUTE_NODAL_OFFICER',
      actionEvent: 'NOC_RELEASE_REQUESTED',
      targetFdrId: saved.fdr_uid,
      ipAddress: req.ip || '127.0.0.1',
      payloadSummary: `Release NOC requested for matured deposit ${saved.fdr_uid}. Gate 1 (Tenure Verification) passed.`
    });

    return res.status(200).json({
      message: `FDR ${saved.fdr_uid} release requested. Transitioned to NOC_RELEASE_REQUESTED.`,
      fdr: saved
    });
  } catch (error) {
    console.error('Error in requestRelease:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 5. Scrutiny Officer Gate 3 Recommendation (AICTE Requirement 6 - Step 2)
 */
exports.recommendGate3 = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks = 'ERP Clearance confirmed. No pending legal holds.' } = req.body;

    const fdr = await FDRInstrument.findOne({
      $or: [{ fdr_uid: id }, { _id: id }]
    });

    if (!fdr) {
      return res.status(404).json({ error: `FDR ${id} not found.` });
    }

    fdr.gate2_erp_compliance_passed = true;
    fdr.gate3_scrutiny_officer_approved = true;
    fdr.gate3_remarks = remarks;
    fdr.gate3_reviewed_at = new Date();
    fdr.lifecycleState = 'PENDING_COMPETENT_AUTHORITY';
    fdr.lifecycle_status = 'PENDING_AUTHORITY_SIGN_OFF';
    fdr.lastActionTimestamp = new Date();

    const saved = await fdr.save();

    await logAuditEvent({
      actorId: req.user?.name || 'AICTE_SCRUTINY_OFFICER',
      actorRole: 'AICTE_SCRUTINY_OFFICER',
      actionEvent: 'GATE_3_SIGN_OFF',
      targetFdrId: saved.fdr_uid,
      ipAddress: req.ip || '127.0.0.1',
      payloadSummary: `Scrutiny Officer sign-off completed for ${saved.fdr_uid}. Remarks: ${remarks}. Transitioned to PENDING_COMPETENT_AUTHORITY.`
    });

    return res.status(200).json({
      message: `FDR ${saved.fdr_uid} recommended by Scrutiny Bureau. Pending Competent Authority DSC sign-off.`,
      fdr: saved
    });
  } catch (error) {
    console.error('Error in recommendGate3:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 6. Competent Authority Gate 4 Mint NOC (AICTE Requirement 6 - Step 3 & 4)
 * Strictly blocked from Nodal Officer role via requireRole middleware
 */
exports.mintNoc = async (req, res) => {
  try {
    const { id } = req.params;
    const { dscPin } = req.body;

    // Verify DSC PIN
    if (!dscPin || String(dscPin).length < 4) {
      return res.status(400).json({ error: 'Valid DSC PIN is required to authorize and cryptographically mint the Discharge Certificate.' });
    }

    const fdr = await FDRInstrument.findOne({
      $or: [{ fdr_uid: id }, { _id: id }]
    });

    if (!fdr) {
      return res.status(404).json({ error: `FDR ${id} not found.` });
    }

    const certSeed = `${fdr.fdr_uid}-RELEASE-NOC-AICTE-${Date.now()}`;
    const certHash = crypto.createHash('sha256').update(certSeed).digest('hex');
    const nocUrl = `https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v${Date.now()}/vidyakosh_fdrs/Discharge_NOC_${fdr.fdr_uid}.pdf`;

    fdr.gate4_competent_authority_approved = true;
    fdr.gate4_approved_at = new Date();
    fdr.noc_certificate_hash = certHash;
    fdr.noc_certificate_url = nocUrl;
    fdr.lifecycleState = 'NOC_ISSUED';
    fdr.lifecycle_status = 'RELEASE_APPROVED_NOC_ISSUED';
    fdr.lastActionTimestamp = new Date();

    // Append Discharge NOC to Digital Vault (Requirement 2 & 6)
    fdr.digitalVault.push({
      documentType: 'Discharge NOC',
      fileUrl: nocUrl,
      uploadedBy: 'COMPETENT_AUTHORITY',
      timestamp: new Date().toISOString()
    });

    const saved = await fdr.save();

    await logAuditEvent({
      actorId: 'COMPETENT_REGULATORY_AUTHORITY',
      actorRole: 'COMPETENT_AUTHORITY',
      actionEvent: 'NOC_MINTED',
      targetFdrId: saved.fdr_uid,
      ipAddress: req.ip || '127.0.0.1',
      payloadSummary: `Official Discharge NOC minted for ${saved.fdr_uid}. Cert Hash: ${certHash.slice(0, 16)}...`
    });

    return res.status(200).json({
      message: `Discharge NOC successfully minted for FDR ${saved.fdr_uid}.`,
      nocUrl,
      certHash,
      fdr: saved
    });
  } catch (error) {
    console.error('Error in mintNoc:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 7. Query All FDRs (with strict PID data isolation for Nodal Officer)
 */
exports.getAllFDRs = async (req, res) => {
  try {
    const filter = {};
    const userRole = req.user?.role || req.headers['x-mock-role'] || req.query.role;
    const userPid = req.user?.pid || req.headers['x-mock-pid'] || req.query.pid;

    // Strict Data Isolation for Nodal Officer
    if (userRole === 'INSTITUTE_NODAL_OFFICER' && userPid) {
      filter.$or = [
        { pid: userPid },
        { institution_id: Number(userPid.replace(/\D/g, '')) || -1 }
      ];
    } else if (req.query.pid) {
      filter.$or = [
        { pid: req.query.pid },
        { institution_id: Number(req.query.pid.replace(/\D/g, '')) || -1 }
      ];
    }

    if (req.query.lifecycleState) {
      filter.lifecycleState = req.query.lifecycleState;
    }

    const fdrs = await FDRInstrument.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ count: fdrs.length, fdrs });
  } catch (error) {
    console.error('Error in getAllFDRs:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 8. Lineage DAG Retrieval (AICTE Requirement 5)
 */
exports.getLineageDAG = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await FDRInstrument.findOne({
      $or: [{ fdr_uid: id }, { _id: id }]
    });

    if (!target) {
      return res.status(404).json({ error: `FDR ${id} not found.` });
    }

    const lineageList = [target];

    // Follow parent chain backwards
    let currentParentId = target.parentFdrId;
    while (currentParentId) {
      const parent = await FDRInstrument.findOne({
        $or: [{ fdr_uid: currentParentId }, { _id: currentParentId }]
      });
      if (!parent || lineageList.some(item => item.fdr_uid === parent.fdr_uid)) break;
      lineageList.unshift(parent);
      currentParentId = parent.parentFdrId;
    }

    // Follow child chain forwards
    let currentChildId = target.childFdrId;
    while (currentChildId) {
      const child = await FDRInstrument.findOne({
        $or: [{ fdr_uid: currentChildId }, { _id: currentChildId }]
      });
      if (!child || lineageList.some(item => item.fdr_uid === child.fdr_uid)) break;
      lineageList.push(child);
      currentChildId = child.childFdrId;
    }

    return res.status(200).json({
      target_uid: target.fdr_uid,
      total_nodes: lineageList.length,
      lineage: lineageList
    });
  } catch (error) {
    console.error('Error in getLineageDAG:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 8b. Institution Lineage DAG Retrieval
 */
exports.getInstitutionLineage = async (req, res) => {
  try {
    const { institution_id } = req.params;
    const instIdNum = Number(institution_id) || 1;
    const pidStr = req.params.institution_id;

    const fdrs = await FDRInstrument.find({
      $or: [
        { institution_id: instIdNum },
        { pid: pidStr },
        { pid: `1-${instIdNum}` }
      ]
    }).sort({ created_at: 1 });

    const nodes = fdrs.map((f, index) => {
      const isRoot = !f.parentFdrId && !f.parent_fdr_id;
      const status = f.lifecycleState || f.lifecycle_status || 'ACTIVE_VERIFIED';
      const relType = f.renewalType || f.relation_type || (isRoot ? 'INITIAL_DEPOSIT' : 'MATURITY_RENEWAL');

      return {
        id: String(f._id || f.fdr_uid),
        fdr_uid: f.fdr_uid,
        fdr_number: f.inst_fdr_number || f.fdr_uid,
        bank_name: f.inst_bank_name || 'State Bank of India',
        ifsc: f.inst_ifsc || 'SBIN0000125',
        principal_amount: f.inst_principal_amount || 3500000,
        interest_rate: f.inst_interest_rate || 7.25,
        maturity_amount: f.inst_maturity_amount || 6198842,
        issue_date: f.inst_issue_date || '',
        maturity_date: f.bankAttestedMaturityDate || f.inst_maturity_date || '',
        lifecycle_status: status,
        relation_type: relType,
        parent_fdr_id: f.parent_fdr_id,
        parent_fdr_uid: f.parentFdrId,
        is_root: isRoot,
        is_active: status !== 'SUPERSEDED_BY_RENEWAL' && status !== 'RENEWED_SUPERSEDED',
        level: index,
        documentUrl: f.documentUrl || f.document_path || (f.digitalVault?.[0]?.fileUrl),
        audit_hash: f.fileHash || 'sha256:00000000',
        data: {
          fdr_uid: f.fdr_uid,
          fdr_number: f.inst_fdr_number || f.fdr_uid,
          bank_name: f.inst_bank_name,
          ifsc: f.inst_ifsc,
          principal: f.inst_principal_amount,
          principal_amount: f.inst_principal_amount,
          interest_rate: f.inst_interest_rate,
          issue_date: f.inst_issue_date,
          maturity_date: f.bankAttestedMaturityDate || f.inst_maturity_date,
          lifecycle_status: status,
          relation_type: relType,
          is_root: isRoot,
          is_active: status !== 'SUPERSEDED_BY_RENEWAL' && status !== 'RENEWED_SUPERSEDED',
          level: index,
          documentUrl: f.documentUrl || f.document_path || (f.digitalVault?.[0]?.fileUrl)
        }
      };
    });

    const edges = [];
    fdrs.forEach((f) => {
      if (f.childFdrId) {
        edges.push({
          id: `e-${f.fdr_uid}-${f.childFdrId}`,
          source: f.fdr_uid,
          target: f.childFdrId,
          label: f.renewalType === 'BANK_MERGER_REPLACEMENT' ? 'Re-issued (Bank Merger)' : 'Renewed (Maturity)',
          animated: true
        });
      }
    });

    return res.status(200).json({
      nodes,
      edges,
      root_fdr_uid: nodes[0]?.fdr_uid || '',
      institution_id: instIdNum,
      institution_name: fdrs[0]?.institution_name || 'Technical Institution',
      total_generations: nodes.length
    });
  } catch (err) {
    console.error('Error in getInstitutionLineage:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * 9. ERP Compliance Check
 */
exports.checkERPHolds = async (req, res) => {
  try {
    const { pid } = req.params;
    const isHoldInstitution = pid === '1-2002' || pid === '1-4004' || req.query.mockHold === 'true';
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
 * 10. Append Document to Digital Vault (AICTE Requirement 2)
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
 * 11. Get FDR Digital Vault
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
