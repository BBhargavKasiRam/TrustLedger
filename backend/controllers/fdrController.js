const FDRInstrument = require('../models/FDRInstrument');

/**
 * FDR Submission POST Controller (AICTE Requirement 1 & 2)
 * Saves file to Cloudinary and appends Initial FDR Scan into digitalVault array
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

    // Extract the secure Cloudinary URL from Multer-Cloudinary
    const documentUrl = req.file ? req.file.path : (req.body.documentUrl || null);
    const fdrUid = `FDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

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
      inst_issue_date: inst_issue_date || new Date().toISOString().split('T')[0],
      inst_maturity_date: inst_maturity_date || new Date().toISOString().split('T')[0],
      inst_joint_holder_text: inst_joint_holder_text || 'JOINTLY IN THE NAME OF AICTE AND INSTITUTION',
      inst_no_lien_declared: inst_no_lien_declared === true || inst_no_lien_declared === 'true',
      digitalVault: initialVault,
      documentUrl: documentUrl,
      document_path: documentUrl,
      lifecycle_status: 'SUBMITTED'
    });

    const savedFDR = await newFDR.save();

    return res.status(201).json({
      message: `FDR ${savedFDR.fdr_uid} submitted successfully with Digital Vault initial entry.`,
      fdr: savedFDR,
      digitalVault: savedFDR.digitalVault,
      documentUrl: savedFDR.documentUrl
    });
  } catch (error) {
    console.error('Error in submitFDR controller:', error);
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
 * Bank Attestation Submission with Supporting PDF (AICTE Requirement 2 & 3)
 */
exports.submitBankAttestation = async (req, res) => {
  try {
    const {
      fdr_uid,
      attested_principal,
      attested_maturity_date,
      lien_status,
      manager_remarks,
      manager_email
    } = req.body;

    const fileUrl = req.file ? req.file.path : (req.body.fileUrl || `https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v${Date.now()}/vidyakosh_fdrs/Bank_Attestation_${fdr_uid}.pdf`);

    const vaultEntry = {
      documentType: 'Bank Attestation PDF',
      fileUrl,
      uploadedBy: 'BANK_BRANCH_MANAGER',
      timestamp: new Date().toISOString()
    };

    const updated = await FDRInstrument.findOneAndUpdate(
      { fdr_uid },
      {
        $set: {
          bank_confirmed_principal: Number(attested_principal),
          bank_confirmed_maturity_date: attested_maturity_date,
          bank_lien_status: lien_status,
          bank_verified_status: 'VERIFIED_MAGIC_LINK',
          bank_manager_email: manager_email || 'bm.attestation@bank.in',
          bank_verified_at: new Date()
        },
        $push: { digitalVault: vaultEntry }
      },
      { new: true }
    );

    return res.status(200).json({
      message: `Bank attestation and supporting document recorded in Digital Vault for ${fdr_uid}.`,
      fdr: updated,
      vaultEntry
    });
  } catch (error) {
    console.error('Error in submitBankAttestation:', error);
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
