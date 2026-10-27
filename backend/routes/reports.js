const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const FDRInstrument = require('../models/FDRInstrument');
const { authenticateJWT, requireRole } = require('../middleware/auth');

/**
 * AICTE Requirement 8: Consolidated Executive Dashboard Reporting Endpoint
 * GET /api/reports/fdr-stats
 */
router.get('/fdr-stats', authenticateJWT, async (req, res) => {
  try {
    const userRole = req.user?.role || req.headers['x-mock-role'] || req.query.role;
    const userPid = req.user?.pid || req.headers['x-mock-pid'] || req.query.pid;

    const matchStage = {};
    // Strict isolation for Nodal Officer
    if (userRole === 'INSTITUTE_NODAL_OFFICER' && userPid) {
      matchStage.$or = [
        { pid: userPid },
        { institution_id: Number(userPid.replace(/\D/g, '')) || -1 }
      ];
    } else if (req.query.pid) {
      matchStage.$or = [
        { pid: req.query.pid },
        { institution_id: Number(req.query.pid.replace(/\D/g, '')) || -1 }
      ];
    }

    const allRecords = await FDRInstrument.find(matchStage);

    let activeCount = 0;
    let activeTotalPrincipal = 0;
    let expiringWarningCount = 0;
    let expiringTotalPrincipal = 0;
    let expiredOverdueCount = 0;
    let expiredTotalPrincipal = 0;
    let renewedCount = 0;
    let renewedTotalPrincipal = 0;
    let releasedNocCount = 0;
    let releasedTotalPrincipal = 0;
    let pendingVerificationCount = 0;
    let discrepancyCount = 0;
    let totalGrossPrincipal = 0;

    allRecords.forEach(fdr => {
      const state = fdr.lifecycleState || fdr.lifecycle_status;
      const principal = Number(fdr.inst_principal_amount) || 0;
      totalGrossPrincipal += principal;

      if (fdr.flags && fdr.flags.length > 0) {
        discrepancyCount++;
      }

      switch (state) {
        case 'ACTIVE_COMPLIANT':
        case 'ACTIVE_VERIFIED':
          activeCount++;
          activeTotalPrincipal += principal;
          break;
        case 'MATURITY_T90':
        case 'MATURITY_T60':
        case 'MATURITY_T30':
          expiringWarningCount++;
          expiringTotalPrincipal += principal;
          break;
        case 'EXPIRED_ACTION_REQUIRED':
          expiredOverdueCount++;
          expiredTotalPrincipal += principal;
          break;
        case 'SUPERSEDED_BY_RENEWAL':
        case 'RENEWED_SUPERSEDED':
          renewedCount++;
          renewedTotalPrincipal += principal;
          break;
        case 'NOC_ISSUED':
        case 'RELEASE_APPROVED_NOC_ISSUED':
          releasedNocCount++;
          releasedTotalPrincipal += principal;
          break;
        case 'SUBMITTED':
        case 'PENDING_BANK_VERIFICATION':
        case 'NOC_RELEASE_REQUESTED':
        case 'PENDING_COMPETENT_AUTHORITY':
          pendingVerificationCount++;
          break;
        default:
          if (fdr.flags?.length > 0) {
            // discrepancy handled
          } else {
            activeCount++;
            activeTotalPrincipal += principal;
          }
      }
    });

    return res.status(200).json({
      role_context: userRole || 'GLOBAL_EXECUTIVE',
      pid_isolated: userRole === 'INSTITUTE_NODAL_OFFICER' ? userPid : null,
      summary: {
        total_records: allRecords.length,
        total_gross_principal: totalGrossPrincipal,
        active_compliant: { count: activeCount, principal: activeTotalPrincipal },
        expiring_t90_t30: { count: expiringWarningCount, principal: expiringTotalPrincipal },
        matured_overdue: { count: expiredOverdueCount, principal: expiredTotalPrincipal },
        renewed_replaced: { count: renewedCount, principal: renewedTotalPrincipal },
        released_noc_issued: { count: releasedNocCount, principal: releasedTotalPrincipal },
        pending_verification: { count: pendingVerificationCount },
        discrepancies_flagged: { count: discrepancyCount }
      }
    });
  } catch (error) {
    console.error('Error generating fdr-stats:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AICTE Requirement 8: Consolidated CSV Export Endpoint
 * GET /api/reports/export-csv
 */
router.get('/export-csv', async (req, res) => {
  try {
    const filter = {};
    if (req.query.pid) {
      filter.$or = [
        { pid: req.query.pid },
        { institution_id: Number(req.query.pid.replace(/\D/g, '')) || -1 }
      ];
    }

    const fdrs = await FDRInstrument.find(filter).sort({ created_at: -1 });

    const fields = [
      { label: 'FDR UID', value: 'fdr_uid' },
      { label: 'Institution PID', value: 'pid' },
      { label: 'Institution Name', value: 'institution_name' },
      { label: 'Bank Name', value: 'inst_bank_name' },
      { label: 'IFSC Code', value: 'inst_ifsc' },
      { label: 'FDR Receipt No', value: 'inst_fdr_number' },
      { label: 'Claimed Principal (INR)', value: 'inst_principal_amount' },
      { label: 'Bank Confirmed Principal (INR)', value: 'bank_confirmed_principal' },
      { label: 'Issue Date', value: 'inst_issue_date' },
      { label: 'Maturity Date', value: 'inst_maturity_date' },
      { label: 'Lifecycle State', value: 'lifecycleState' },
      { label: 'Lien Status', value: 'bank_lien_status' },
      { label: 'Discrepancy Flags', value: (row) => (row.flags && row.flags.length > 0 ? row.flags.join('; ') : 'CLEAN') },
      { label: 'Parent FDR UID', value: 'parentFdrId' },
      { label: 'Child FDR UID', value: 'childFdrId' },
      { label: 'Digital Vault Items', value: (row) => (row.digitalVault ? row.digitalVault.length : 0) },
      { label: 'SLA Breached', value: (row) => (row.slaBreached ? 'YES' : 'NO') }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(fdrs);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=AICTE_FDR_Consolidated_Report.csv');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
