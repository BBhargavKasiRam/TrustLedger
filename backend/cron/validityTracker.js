const cron = require('node-cron');
const crypto = require('crypto');
const mongoose = require('mongoose');
const FDRInstrument = require('../models/FDRInstrument');

/**
 * Standard pure JavaScript Date math with uniform UTC handling.
 * Calculates exact difference in calendar days between Date.now() and maturityDateStr.
 */
function calculateDaysRemainingUtc(maturityDateStr) {
  if (!maturityDateStr) return 9999;
  try {
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const dateOnly = String(maturityDateStr).split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length < 3) return 9999;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const day = parseInt(parts[2], 10);

    const matUtc = Date.UTC(year, month, day);
    return Math.ceil((matUtc - todayUtc) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 9999;
  }
}

/**
 * Automated Reminder Dispatcher (AICTE Requirement 4.2)
 * Simulated SMS/Email notification dispatcher and cryptographic audit log recorder.
 */
async function dispatchAutomatedAlert(instituteEmail, state, fdrUid, institutionName, daysRemaining) {
  const timestamp = new Date();
  const recipient = instituteEmail || 'nodal.officer@apex.edu.in';
  const instLabel = institutionName || 'Approved Technical Institution';

  // 1. Console.log simulated SMS/Email payload
  console.log('================================================================================');
  console.log(`[AUTOMATED SLA DISPATCHER] Automated Statutory Maturity Alert Dispatched`);
  console.log(`[TIMESTAMP] ${timestamp.toISOString()}`);
  console.log(`[RECIPIENT] ${recipient} (Institute Nodal Officer)`);
  console.log(`[INSTITUTION] ${instLabel}`);
  console.log(`[TARGET FDR UID] ${fdrUid}`);
  console.log(`[TRANSITION STATE] ${state}`);
  console.log(`[DAYS REMAINING] ${daysRemaining} days`);
  console.log(`[PAYLOAD] ALERT: AICTE Security Deposit (${fdrUid}) maturing in ${daysRemaining} days (Lifecycle: ${state}). Mandatory renewal under Approval Process Handbook (APH 2026-31) Clause 2.14 is required. Failure to renew triggers regulatory soft-hold on Annual Extension of Approval (EoA).`);
  console.log('================================================================================');

  // 2. Log dispatch event in the "Audit & Defaulter Registry" (audit_logs collection)
  try {
    const db = mongoose.connection.db;
    if (db) {
      const auditCollection = db.collection('audit_logs');
      const lastLog = await auditCollection.find().sort({ id: -1 }).limit(1).toArray();
      const prevHash = (lastLog.length > 0 && lastLog[0].row_hash) ? lastLog[0].row_hash : ('0'.repeat(64));
      const nextId = (lastLog.length > 0 && typeof lastLog[0].id === 'number') ? lastLog[0].id + 1 : 1;

      const actionType = state === 'EXPIRED_ACTION_REQUIRED' ? 'ESCALATION_DEFAULT_NOTICE' : 'AUTOMATED_MATURITY_ALERT';
      const payloadSummary = `Automated ${state} statutory reminder dispatched to ${recipient} for ${fdrUid}. Lock-in balance: ${daysRemaining} days remaining. Regulatory audit entry recorded.`;

      const rawData = `${prevHash}AUTOMATED_CRON_ENGINE${actionType}${payloadSummary}${timestamp.toISOString().replace(/\.\d+Z$/, '')}`;
      const rowHash = crypto.createHash('sha256').update(rawData).digest('hex');

      await auditCollection.insertOne({
        id: nextId,
        timestamp,
        actor_role: 'AUTOMATED_CRON_ENGINE',
        actor_name: 'AICTE Temporal Validity Watchdog',
        action_type: actionType,
        target_fdr_uid: fdrUid,
        payload_summary: payloadSummary,
        prev_hash: prevHash,
        row_hash: rowHash
      });
    }
  } catch (err) {
    console.warn('[dispatchAutomatedAlert] Audit log recording warning:', err.message);
  }
}

/**
 * Sweeps all FDRs, computes remaining days, transitions states, and dispatches reminders.
 */
async function runDailyValidityTrackingSweep() {
  console.log(`[Validity Tracking Engine] Starting chronological validity sweep at ${new Date().toISOString()} (UTC)...`);
  
  try {
    const fdrs = await FDRInstrument.find({});
    let scannedCount = 0;
    let transitionsTriggered = 0;
    const sweepResults = [];

    for (const fdr of fdrs) {
      scannedCount++;
      // Skip already superseded or discharged instruments
      if (fdr.lifecycle_status === 'RENEWED_SUPERSEDED' || fdr.lifecycle_status === 'RELEASE_APPROVED_NOC_ISSUED') {
        continue;
      }

      // Check authoritative bank attested maturity date first, then fall back to college claimed date
      const matDateStr = fdr.bankAttestedMaturityDate || fdr.bank_confirmed_maturity_date || fdr.inst_maturity_date;
      if (!matDateStr) continue;

      const daysRemaining = calculateDaysRemainingUtc(matDateStr);
      let targetLifecycleState = 'ACTIVE_COMPLIANT';
      let targetLifecycleStatus = fdr.lifecycle_status || 'ACTIVE';

      // Determine state according to strict AICTE Requirement 4 rules
      if (daysRemaining < 0) {
        targetLifecycleState = 'EXPIRED_ACTION_REQUIRED';
        targetLifecycleStatus = 'MATURED_ACTION_PENDING';
      } else if (daysRemaining <= 30) {
        targetLifecycleState = 'MATURITY_T30';
        targetLifecycleStatus = 'APPROACHING_MATURITY_T30';
      } else if (daysRemaining <= 60) {
        targetLifecycleState = 'MATURITY_T60';
        targetLifecycleStatus = 'APPROACHING_MATURITY_T60';
      } else if (daysRemaining <= 90) {
        targetLifecycleState = 'MATURITY_T90';
        targetLifecycleStatus = 'APPROACHING_MATURITY_T90';
      } else {
        targetLifecycleState = 'ACTIVE_COMPLIANT';
        if (fdr.lifecycle_status === 'MATURED_ACTION_PENDING' || fdr.lifecycle_status?.startsWith('APPROACHING_MATURITY')) {
          targetLifecycleStatus = 'ACTIVE';
        }
      }

      const currentState = fdr.lifecycleState || fdr.lifecycle_status;
      const stateChanged = currentState !== targetLifecycleState;

      // Update document fields in MongoDB
      fdr.lifecycleState = targetLifecycleState;
      fdr.lifecycle_status = targetLifecycleStatus;
      fdr.daysRemaining = daysRemaining;

      // Ensure bankAttestedMaturityDate is populated
      if (!fdr.bankAttestedMaturityDate && (fdr.bank_confirmed_maturity_date || fdr.inst_maturity_date)) {
        fdr.bankAttestedMaturityDate = fdr.bank_confirmed_maturity_date || fdr.inst_maturity_date;
      }

      await fdr.save();

      // If transitioning into one of the warning states (T-90, T-60, T-30, Expired), trigger notification
      const isWarningState = ['MATURITY_T90', 'MATURITY_T60', 'MATURITY_T30', 'EXPIRED_ACTION_REQUIRED'].includes(targetLifecycleState);
      
      if (isWarningState) {
        transitionsTriggered++;
        const instituteEmail = `nodal.${fdr.inst_fdr_number ? fdr.inst_fdr_number.toLowerCase() : 'officer'}@aicte-india.org`;
        await dispatchAutomatedAlert(instituteEmail, targetLifecycleState, fdr.fdr_uid, fdr.inst_bank_name, daysRemaining);
      }

      sweepResults.push({
        fdr_uid: fdr.fdr_uid,
        maturity_date: matDateStr,
        days_remaining: daysRemaining,
        lifecycleState: targetLifecycleState,
        lifecycle_status: targetLifecycleStatus,
        stateChanged
      });
    }

    console.log(`[Validity Tracking Engine] Sweep completed: ${scannedCount} scanned, ${transitionsTriggered} warning transitions processed.`);
    return {
      timestamp: new Date().toISOString(),
      scanned_count: scannedCount,
      transitions_triggered: transitionsTriggered,
      results: sweepResults
    };
  } catch (error) {
    console.error('[Validity Tracking Engine] Error during sweep:', error);
    throw error;
  }
}

/**
 * Initializes the automated midnight UTC cron job (0 0 * * *)
 */
function initValidityTrackingCron() {
  console.log('[Cron Scheduler] Initializing Automated Validity & Maturity Tracking Daily Cron (0 0 * * *)...');
  
  // Schedule midnight job in UTC (0 0 * * *)
  const job = cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Scheduler] Firing Midnight UTC Automated Validity & Maturity Sweep (0 0 * * *)...');
    try {
      await runDailyValidityTrackingSweep();
    } catch (err) {
      console.error('[Cron Scheduler] Cron job sweep failed:', err);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  return job;
}

module.exports = {
  calculateDaysRemainingUtc,
  dispatchAutomatedAlert,
  runDailyValidityTrackingSweep,
  initValidityTrackingCron
};
