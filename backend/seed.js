const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config();

const FDRInstrument = require('./models/FDRInstrument');
const AuditLedger = require('./models/AuditLedger');
const { encrypt } = require('./utils/encryption');

const GENESIS_BLOCK_HASH = '0'.repeat(64);

async function seedDatabase() {
  let mongoUri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/vidyakosh';
  let memoryServer = null;

  try {
    console.log('[Seed] Attempting connection to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected to MongoDB successfully.');
  } catch (err) {
    console.warn('[Seed] External MongoDB connection failed:', err.message);
    console.log('[Seed] Activating resilient in-memory MongoDB server fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to in-memory MongoDB instance:', mongoUri);
  }

  // Clean existing FDRs and AuditLedger
  console.log('[Seed] Clearing existing FDR instruments and AuditLedger collections...');
  await FDRInstrument.deleteMany({});
  await mongoose.connection.db.collection('AuditLedger').deleteMany({});
  console.log('[Seed] Database cleaned.');

  let previousBlockHash = GENESIS_BLOCK_HASH;

  // Helper to commit sequentially chained audit blocks
  async function createAuditBlock(actorRole, actorId, actionEvent, targetFdrId, payloadSummary, timestamp) {
    const rawData = `${previousBlockHash}|${timestamp.toISOString()}|${actorRole}|${actionEvent}|${targetFdrId || ''}|${payloadSummary}`;
    const currentBlockHash = crypto.createHash('sha256').update(rawData).digest('hex');

    const block = new AuditLedger({
      timestamp,
      actorId,
      actorRole,
      actionEvent,
      targetFdrId,
      ipAddress: '10.0.4.12',
      previousBlockHash,
      currentBlockHash,
      payloadSummary
    });

    await block.save();
    previousBlockHash = currentBlockHash;
    return block;
  }

  const now = new Date();
  const formatUtcDate = (d) => d.toISOString().split('T')[0];

  console.log('[Seed] Creating 5 Engineered AICTE Test Scenarios...');

  // -------------------------------------------------------------------------
  // Case 1: Vanguard College of Engineering (Clean, 100% Matched, ACTIVE_VERIFIED)
  // -------------------------------------------------------------------------
  const v1Date = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const v1Maturity = new Date(now.getTime() + (10 * 365 - 365) * 24 * 60 * 60 * 1000);
  const v1Uid = 'FDR-2024-8841';

  const vanguardFDR = new FDRInstrument({
    fdr_uid: v1Uid,
    institution_id: 2001,
    institution_name: 'Vanguard College of Engineering',
    pid: '1-2001',
    inst_fdr_number: 'SBI-FDR-992014',
    inst_bank_name: 'State Bank of India',
    inst_ifsc: 'SBIN0000125',
    inst_principal_amount: 3500000,
    inst_interest_rate: 7.25,
    inst_maturity_amount: 6198842,
    inst_issue_date: formatUtcDate(v1Date),
    inst_maturity_date: formatUtcDate(v1Maturity),
    inst_joint_holder_text: 'JOINTLY IN THE NAME OF AICTE AND VANGUARD COLLEGE OF ENGINEERING',
    inst_no_lien_declared: true,
    fileHash: crypto.createHash('sha256').update('vanguard-genuine-fdr-receipt').digest('hex'),
    flags: [],
    duplicate_flag: false,
    tenure_violation_flag: false,
    data_mismatch_flag: false,
    lien_encumbrance_flag: false,
    tenure_months: 120,
    digitalVault: [
      {
        documentType: 'Initial FDR Scan',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000001/vidyakosh_fdrs/Vanguard_Genuine_FDR.pdf',
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        documentType: 'Bank Attestation PDF',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000002/vidyakosh_fdrs/SBI_BranchMgr_Attestation_8841.pdf',
        uploadedBy: 'BANK_BRANCH_MANAGER',
        timestamp: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    bank_verified_status: 'VERIFIED_MAGIC_LINK',
    bank_confirmed_principal: 3500000,
    bank_confirmed_maturity_date: formatUtcDate(v1Maturity),
    bankAttestedMaturityDate: formatUtcDate(v1Maturity),
    bank_lien_status: 'ACTIVE_JOINT_AICTE',
    bank_manager_email: 'bm.newdelhi@sbi.co.in',
    bank_verified_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    lifecycle_status: 'ACTIVE_VERIFIED',
    lifecycleState: 'ACTIVE_VERIFIED',
    daysRemaining: Math.ceil((v1Maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    bankAccountNumber: encrypt('000030192849182'),
    maskedBankAccountNumber: 'XXXX-XXXX-9182'
  });
  await vanguardFDR.save();

  // -------------------------------------------------------------------------
  // Case 2: State Institute of Technology (Discrepancy: ₹35L claimed vs ₹15L bank, Unauthorized Lien)
  // -------------------------------------------------------------------------
  const sitDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const sitMaturity = new Date(now.getTime() + 9 * 365 * 24 * 60 * 60 * 1000);
  const sitUid = 'FDR-2024-4192';

  const stateTechFDR = new FDRInstrument({
    fdr_uid: sitUid,
    institution_id: 2003,
    institution_name: 'State Institute of Technology',
    pid: '1-2003',
    inst_fdr_number: 'PNB-FDR-551092',
    inst_bank_name: 'Punjab National Bank',
    inst_ifsc: 'PUNB0014200',
    inst_principal_amount: 3500000,
    inst_interest_rate: 7.00,
    inst_maturity_amount: 5800000,
    inst_issue_date: formatUtcDate(sitDate),
    inst_maturity_date: formatUtcDate(sitMaturity),
    inst_joint_holder_text: 'STATE INSTITUTE OF TECH',
    inst_no_lien_declared: true,
    fileHash: crypto.createHash('sha256').update('sit-tampered-receipt-file').digest('hex'),
    flags: ['DATA_MISMATCH_FLAG', 'LIEN_ENCUMBRANCE_FLAG'],
    duplicate_flag: false,
    data_mismatch_flag: true,
    lien_encumbrance_flag: true,
    tenure_months: 114,
    digitalVault: [
      {
        documentType: 'Initial FDR Scan',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000010/vidyakosh_fdrs/SIT_Claim_FDR.pdf',
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        documentType: 'Bank Attestation PDF',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000011/vidyakosh_fdrs/PNB_Manager_Encumbered_Attestation.pdf',
        uploadedBy: 'BANK_BRANCH_MANAGER',
        timestamp: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    bank_verified_status: 'MISMATCH_FLAGGED',
    bank_confirmed_principal: 1500000,
    bank_confirmed_maturity_date: formatUtcDate(sitMaturity),
    bankAttestedMaturityDate: formatUtcDate(sitMaturity),
    bank_lien_status: 'LOAN_ENCUMBERED_UNAUTHORIZED',
    bank_manager_email: 'bm.lucknow@pnb.co.in',
    bank_verified_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
    lifecycle_status: 'DISCREPANCY_FLAGGED',
    lifecycleState: 'DISCREPANCY_FLAGGED',
    daysRemaining: Math.ceil((sitMaturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    slaBreached: true,
    slaBreachReason: 'UNREVIEWED_DISCREPANCY_7_DAYS',
    bankAccountNumber: encrypt('000099482715421'),
    maskedBankAccountNumber: 'XXXX-XXXX-5421'
  });
  await stateTechFDR.save();

  // -------------------------------------------------------------------------
  // Case 3: Deccan School of Management (Approaching Maturity: T-30, 29 Days Left)
  // -------------------------------------------------------------------------
  const dsmDate = new Date(now.getTime() - 9.9 * 365 * 24 * 60 * 60 * 1000);
  const dsmMaturity = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000);
  const dsmUid = 'FDR-2015-7731';

  const deccanFDR = new FDRInstrument({
    fdr_uid: dsmUid,
    institution_id: 2004,
    institution_name: 'Deccan School of Management',
    pid: '1-2004',
    inst_fdr_number: 'CAN-FDR-810923',
    inst_bank_name: 'Canara Bank',
    inst_ifsc: 'CNRB0001092',
    inst_principal_amount: 3500000,
    inst_interest_rate: 8.50,
    inst_maturity_amount: 7200000,
    inst_issue_date: formatUtcDate(dsmDate),
    inst_maturity_date: formatUtcDate(dsmMaturity),
    inst_joint_holder_text: 'JOINTLY IN THE NAME OF AICTE AND DECCAN SCHOOL OF MANAGEMENT',
    inst_no_lien_declared: true,
    fileHash: crypto.createHash('sha256').update('deccan-maturing-fdr-doc').digest('hex'),
    flags: [],
    duplicate_flag: false,
    tenure_months: 120,
    digitalVault: [
      {
        documentType: 'Initial FDR Scan',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000020/vidyakosh_fdrs/Deccan_Initial_FDR.pdf',
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date(now.getTime() - 9 * 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    bank_verified_status: 'VERIFIED_MAGIC_LINK',
    bank_confirmed_principal: 3500000,
    bank_confirmed_maturity_date: formatUtcDate(dsmMaturity),
    bankAttestedMaturityDate: formatUtcDate(dsmMaturity),
    bank_lien_status: 'ACTIVE_JOINT_AICTE',
    bank_manager_email: 'bm.hyderabad@canarabank.com',
    lifecycle_status: 'APPROACHING_MATURITY_T30',
    lifecycleState: 'MATURITY_T30',
    daysRemaining: 29,
    bankAccountNumber: encrypt('000055219984711'),
    maskedBankAccountNumber: 'XXXX-XXXX-4711'
  });
  await deccanFDR.save();

  // -------------------------------------------------------------------------
  // Case 4: Apex Institute of Technology (Lineage: Parent Expired & Superseded + Child Renewal Active)
  // -------------------------------------------------------------------------
  const parentDate = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000);
  const parentMaturity = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const parentUid = 'FDR-2014-1008';
  const childUid = 'FDR-2024-9921';

  const apexParentFDR = new FDRInstrument({
    fdr_uid: parentUid,
    childFdrId: childUid,
    institution_id: 2005,
    institution_name: 'Apex Institute of Technology',
    pid: '1-2005',
    inst_fdr_number: 'HDFC-FDR-001928',
    inst_bank_name: 'HDFC Bank',
    inst_ifsc: 'HDFC0000240',
    inst_principal_amount: 3500000,
    inst_interest_rate: 8.00,
    inst_maturity_amount: 6800000,
    inst_issue_date: formatUtcDate(parentDate),
    inst_maturity_date: formatUtcDate(parentMaturity),
    bankAttestedMaturityDate: formatUtcDate(parentMaturity),
    inst_joint_holder_text: 'JOINTLY IN THE NAME OF AICTE AND APEX INSTITUTE',
    inst_no_lien_declared: true,
    fileHash: crypto.createHash('sha256').update('apex-parent-deposit-scan').digest('hex'),
    flags: [],
    tenure_months: 120,
    digitalVault: [
      {
        documentType: 'Initial FDR Scan',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000030/vidyakosh_fdrs/Apex_Historical_Parent_2014.pdf',
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    bank_verified_status: 'VERIFIED_MAGIC_LINK',
    bank_confirmed_principal: 3500000,
    bank_confirmed_maturity_date: formatUtcDate(parentMaturity),
    bank_lien_status: 'ACTIVE_JOINT_AICTE',
    lifecycle_status: 'RENEWED_SUPERSEDED',
    lifecycleState: 'SUPERSEDED_BY_RENEWAL',
    daysRemaining: -5,
    bankAccountNumber: encrypt('000078192348512'),
    maskedBankAccountNumber: 'XXXX-XXXX-8512'
  });
  await apexParentFDR.save();

  const childMaturity = new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000);
  const apexChildFDR = new FDRInstrument({
    fdr_uid: childUid,
    parentFdrId: parentUid,
    renewalType: '5_YEAR_RENEWAL',
    institution_id: 2005,
    institution_name: 'Apex Institute of Technology',
    pid: '1-2005',
    inst_fdr_number: 'HDFC-FDR-992144',
    inst_bank_name: 'HDFC Bank',
    inst_ifsc: 'HDFC0000240',
    inst_principal_amount: 3500000,
    inst_interest_rate: 7.75,
    inst_maturity_amount: 5120000,
    inst_issue_date: formatUtcDate(now),
    inst_maturity_date: formatUtcDate(childMaturity),
    bankAttestedMaturityDate: formatUtcDate(childMaturity),
    inst_joint_holder_text: 'JOINTLY IN THE NAME OF AICTE AND APEX INSTITUTE',
    inst_no_lien_declared: true,
    fileHash: crypto.createHash('sha256').update('apex-child-renewal-deposit-scan').digest('hex'),
    flags: [],
    tenure_months: 60,
    digitalVault: [
      {
        documentType: 'Initial FDR Scan',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000031/vidyakosh_fdrs/Apex_Child_Renewal_FDR.pdf',
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: now.toISOString()
      }
    ],
    bank_verified_status: 'VERIFIED_MAGIC_LINK',
    bank_confirmed_principal: 3500000,
    bank_confirmed_maturity_date: formatUtcDate(childMaturity),
    bank_lien_status: 'ACTIVE_JOINT_AICTE',
    lifecycle_status: 'ACTIVE_VERIFIED',
    lifecycleState: 'ACTIVE_VERIFIED',
    daysRemaining: Math.ceil((childMaturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    bankAccountNumber: encrypt('000078192348512'),
    maskedBankAccountNumber: 'XXXX-XXXX-8512'
  });
  await apexChildFDR.save();

  // -------------------------------------------------------------------------
  // Case 5: Shivalik Polytechnic (Trackable Release Workflow: Matured yesterday, Gates 1, 2, 3 Approved, Pending Gate 4 Competent Authority)
  // -------------------------------------------------------------------------
  const shivDate = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000);
  const shivMaturity = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // Matured yesterday (T-0)
  const shivUid = 'FDR-2014-4004';

  const shivalikFDR = new FDRInstrument({
    fdr_uid: shivUid,
    institution_id: 4004,
    institution_name: 'Shivalik Polytechnic Institute',
    pid: '1-4004',
    inst_fdr_number: 'BOB-FDR-771920',
    inst_bank_name: 'Bank of Baroda',
    inst_ifsc: 'BARB0DEHRAD',
    inst_principal_amount: 3500000,
    inst_interest_rate: 8.10,
    inst_maturity_amount: 6750000,
    inst_issue_date: formatUtcDate(shivDate),
    inst_maturity_date: formatUtcDate(shivMaturity),
    bankAttestedMaturityDate: formatUtcDate(shivMaturity),
    inst_joint_holder_text: 'JOINTLY IN THE NAME OF AICTE AND SHIVALIK POLYTECHNIC',
    inst_no_lien_declared: true,
    fileHash: crypto.createHash('sha256').update('shivalik-discharge-ready-deposit').digest('hex'),
    flags: [],
    tenure_months: 120,
    digitalVault: [
      {
        documentType: 'Initial FDR Scan',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000040/vidyakosh_fdrs/Shivalik_Original_FDR.pdf',
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        documentType: 'Statutory Clearance',
        fileUrl: 'https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v1729000041/vidyakosh_fdrs/AICTE_Regional_Clearance_Shivalik.pdf',
        uploadedBy: 'AICTE_SCRUTINY_OFFICER',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      }
    ],
    bank_verified_status: 'VERIFIED_MAGIC_LINK',
    bank_confirmed_principal: 3500000,
    bank_confirmed_maturity_date: formatUtcDate(shivMaturity),
    bank_lien_status: 'ACTIVE_JOINT_AICTE',
    lifecycle_status: 'PENDING_AUTHORITY_SIGN_OFF',
    lifecycleState: 'PENDING_COMPETENT_AUTHORITY',
    daysRemaining: -1,
    
    // 4-Gate Workflow Status
    gate1_tenure_passed: true,
    gate2_erp_compliance_passed: true,
    gate3_scrutiny_officer_approved: true,
    gate3_remarks: 'All statutory compliance, court cases, and faculty obligations cleared under APH 2026-31. Recommended for final discharge certificate minting.',
    gate3_reviewed_at: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    gate4_competent_authority_approved: false,
    release_requested_at: new Date(now.getTime() - 24 * 60 * 60 * 1000),

    bankAccountNumber: encrypt('000044910293841'),
    maskedBankAccountNumber: 'XXXX-XXXX-3841'
  });
  await shivalikFDR.save();

  // -------------------------------------------------------------------------
  // Chronological Blockchain Commit Sequence (Oldest to Newest)
  // -------------------------------------------------------------------------
  const t_minus_40d = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
  const t_minus_35d = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  const t_minus_30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const t_minus_25d = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000);
  const t_minus_10d = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const t_minus_1d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const t_minus_6h = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  // Block 1 (Genesis + 1): State Institute initial submission (40 days ago)
  await createAuditBlock('INSTITUTE_NODAL_OFFICER', '1-2003', 'FDR_SUBMISSION', sitUid, 'Deposit submitted claiming ₹35,00,000 for State Institute of Technology.', t_minus_40d);

  // Block 2: State Institute bank attestation discrepancy flagged (35 days ago)
  await createAuditBlock('BANK_BRANCH_MANAGER', 'bm.lucknow@pnb.co.in', 'BANK_DISCREPANCY_FLAGGED', sitUid, 'Bank CBS detected severe discrepancy: Actual principal ₹15,00,000, Lien: LOAN_ENCUMBERED_UNAUTHORIZED.', t_minus_35d);

  // Block 3: Vanguard initial submission (30 days ago)
  await createAuditBlock('INSTITUTE_NODAL_OFFICER', '1-2001', 'FDR_SUBMISSION', v1Uid, 'Initial FDR deposit submission of ₹35,00,000 for Vanguard College.', t_minus_30d);

  // Block 4: Vanguard bank attestation verified clean (25 days ago)
  await createAuditBlock('BANK_BRANCH_MANAGER', 'bm.newdelhi@sbi.co.in', 'BANK_ATTESTATION_VERIFIED', v1Uid, 'Bank Branch Manager confirmed ₹35,00,000 principal & Joint AICTE Lien with zero discrepancies.', t_minus_25d);

  // Block 5: State Institute SLA escalation alert (10 days ago)
  await createAuditBlock('AUTOMATED_CRON_ENGINE', 'AICTE_ESCALATION_ENGINE', 'ALERT_DISPATCHED', sitUid, 'SLA Breach Alert: Unresolved discrepancy > 7 days dispatched to Member Secretary.', t_minus_10d);

  // Block 6: Deccan T-30 Statutory Warning (1 day ago)
  await createAuditBlock('AUTOMATED_CRON_ENGINE', 'AICTE_ESCALATION_ENGINE', 'ALERT_DISPATCHED', dsmUid, 'Automated T-30 Statutory Maturity Warning Dispatched to Deccan Nodal Officer. Renewal window unlocked.', t_minus_1d);

  // Block 7: Shivalik Release requested (1 day ago)
  await createAuditBlock('INSTITUTE_NODAL_OFFICER', '1-4004', 'NOC_RELEASE_REQUESTED', shivUid, 'Tenure completed (T-0). Nodal Officer requested official Release and Refund NOC.', t_minus_1d);

  // Block 8: Shivalik Gate 3 Scrutiny Sign-Off (6 hours ago)
  await createAuditBlock('AICTE_SCRUTINY_OFFICER', 'scrutiny.hq@aicte-india.org', 'GATE_3_SIGN_OFF', shivUid, 'Gate 3 Scrutiny Bureau clearance completed. Recommended to Competent Authority for DSC PIN sign-off.', t_minus_6h);

  // Block 9: Apex Renewal Linking (Now)
  await createAuditBlock('INSTITUTE_NODAL_OFFICER', '1-2005', 'RENEWAL_LINKING', childUid, `Deposit renewal completed. Expired deposit ${parentUid} superseded by Child ${childUid} (Type: 5_YEAR_RENEWAL).`, now);

  console.log('[Seed] Seeding completed successfully!');
  console.log(`[Seed] 5 test scenarios created in MongoDB.`);
  console.log(`[Seed] AuditLedger head block hash: ${previousBlockHash}`);

  // Test verifyAuditChain to verify mathematical integrity
  const { verifyAuditChain } = require('./utils/auditLogger');
  const chainCheck = await verifyAuditChain();
  console.log(`[Seed] Audit Chain Verification Result:`, chainCheck);

  if (memoryServer) {
    await memoryServer.stop();
  }
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
