const FDRInstrument = require('../models/FDRInstrument');

/**
 * FDR Submission POST Controller
 * Extracts req.file.path (the secure Cloudinary URL) and saves it to documentUrl in MongoDB
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
      documentUrl: documentUrl,
      document_path: documentUrl,
      lifecycle_status: 'SUBMITTED'
    });

    const savedFDR = await newFDR.save();

    return res.status(201).json({
      message: `FDR ${savedFDR.fdr_uid} submitted successfully with supporting document.`,
      fdr: savedFDR,
      documentUrl: savedFDR.documentUrl
    });
  } catch (error) {
    console.error('Error in submitFDR controller:', error);
    return res.status(500).json({ error: error.message });
  }
};
