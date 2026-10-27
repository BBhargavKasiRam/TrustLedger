const cron = require('node-cron');
const FDRInstrument = require('../models/FDRInstrument');
const { dispatchAlert } = require('../utils/notifier');

/**
 * Pure JavaScript Date math with uniform UTC handling.
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
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const matUtc = Date.UTC(year, month, day);
    return Math.ceil((matUtc - todayUtc) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 9999;
  }
}

/**
 * AICTE Requirement 4 & 7: Automated Validity Sweep & Multi-Tier Escalation Matrix
 */
async function runDailyValidityTrackingSweep() {
  console.log(`[Validity Tracking Engine] Running automated validity & SLA escalation sweep at ${new Date().toISOString()}...`);

  try {
    const fdrs = await FDRInstrument.find({});
    let scannedCount = 0;
    let alertsTriggered = 0;
    let softHoldsApplied = 0;
    let slaBreachesDetected = 0;
    const now = Date.now();
    const sweepResults = [];

    for (const fdr of fdrs) {
      scannedCount++;
      // Skip already superseded or discharged instruments
      if (['SUPERSEDED_BY_RENEWAL', 'RENEWED_SUPERSEDED', 'NOC_ISSUED', 'RELEASE_APPROVED_NOC_ISSUED'].includes(fdr.lifecycleState)) {
        continue;
      }

      const matDateStr = fdr.bankAttestedMaturityDate || fdr.bank_confirmed_maturity_date || fdr.inst_maturity_date;
      const daysRemaining = calculateDaysRemainingUtc(matDateStr);
      let targetState = fdr.lifecycleState || 'ACTIVE_COMPLIANT';

      // 1. Calculate Maturity Transitions
      if (daysRemaining < 0) {
        targetState = 'EXPIRED_ACTION_REQUIRED';
        // AICTE Requirement 7: Overdue maturity without renewal -> Apply regulatory soft-hold on EoA
        if (!fdr.softHoldEoa) {
          fdr.softHoldEoa = true;
          softHoldsApplied++;
          await dispatchAlert({
            recipient: 'ro.north@aicte-india.org',
            role: 'AICTE_REGIONAL_OFFICER',
            alertType: 'REGULATORY_SOFT_HOLD_EOA',
            fdrUid: fdr.fdr_uid,
            message: `URGENT REGULATORY ACTION: FDR ${fdr.fdr_uid} for ${fdr.institution_name} (PID: ${fdr.pid}) has expired (${Math.abs(daysRemaining)} days overdue). Institutional Soft-Hold placed on Annual Extension of Approval (EoA).`
          });
          alertsTriggered++;
        }
      } else if (daysRemaining <= 30) {
        targetState = 'MATURITY_T30';
      } else if (daysRemaining <= 60) {
        targetState = 'MATURITY_T60';
      } else if (daysRemaining <= 90) {
        targetState = 'MATURITY_T90';
      }

      // 2. AICTE Requirement 7: Escalation Rule - Pending Bank Attestation > 72 hours (3 days)
      const createdAt = new Date(fdr.created_at || fdr.createdAt || Date.now()).getTime();
      const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

      if ((fdr.bank_verified_status === 'PENDING' || fdr.lifecycleState === 'SUBMITTED') && hoursSinceCreation > 72) {
        fdr.slaBreached = true;
        fdr.slaBreachReason = 'BANK_ATTESTATION_OVERDUE_72H';
        slaBreachesDetected++;
        await dispatchAlert({
          recipient: fdr.bank_manager_email || 'branchmgr.sbi@bank.co.in',
          role: 'BANK_BRANCH_MANAGER',
          alertType: 'BANK_MAGIC_LINK_REMINDER',
          fdrUid: fdr.fdr_uid,
          message: `URGENT: AICTE Security Deposit attestation for ${fdr.fdr_uid} (${fdr.institution_name}) is pending > 72 hours. Please access the secure magic link to verify principal & lien immediately.`
        });
        alertsTriggered++;
      }

      // 3. AICTE Requirement 7: Escalation Rule - Unreviewed Discrepancy > 7 days (168 hours)
      if (fdr.flags && fdr.flags.length > 0) {
        const lastAction = new Date(fdr.lastActionTimestamp || fdr.updated_at || Date.now()).getTime();
        const daysUnresolved = (now - lastAction) / (1000 * 60 * 60 * 24);

        if (daysUnresolved > 7 && !fdr.gate3_scrutiny_officer_approved) {
          fdr.slaBreached = true;
          fdr.slaBreachReason = 'UNREVIEWED_DISCREPANCY_7_DAYS';
          slaBreachesDetected++;
          await dispatchAlert({
            recipient: 'ms@aicte-india.org',
            role: 'COMPETENT_AUTHORITY',
            alertType: 'DISCREPANCY_SLA_BREACH',
            fdrUid: fdr.fdr_uid,
            message: `CRITICAL SLA BREACH: Discrepancy flags [${fdr.flags.join(', ')}] on FDR ${fdr.fdr_uid} (${fdr.institution_name}) have remained unreviewed for > 7 days. Member Secretary executive intervention required.`
          });
          alertsTriggered++;
        }
      }

      // 4. AICTE Requirement 4 & 7: T-90 and T-30 Reminders
      const isApproachingWarning = (targetState === 'MATURITY_T90' || targetState === 'MATURITY_T30');
      if (isApproachingWarning && fdr.lifecycleState !== targetState) {
        await dispatchAlert({
          recipient: `nodal.${fdr.pid || 'officer'}@apex.edu.in`,
          role: 'INSTITUTE_NODAL_OFFICER',
          alertType: targetState === 'MATURITY_T30' ? 'MATURITY_T30_URGENT_RENEWAL' : 'MATURITY_T90_RENEWAL_WINDOW_OPEN',
          fdrUid: fdr.fdr_uid,
          message: `AICTE Deposit Alert: Instrument ${fdr.fdr_uid} matures in ${daysRemaining} days (${targetState}). Renewal submission portal is now active. Complete renewal to avoid EoA hold.`
        });
        alertsTriggered++;
      }

      // Save updated state
      fdr.lifecycleState = targetState;
      fdr.daysRemaining = daysRemaining;
      if (!fdr.bankAttestedMaturityDate && matDateStr) {
        fdr.bankAttestedMaturityDate = matDateStr;
      }

      await fdr.save();

      sweepResults.push({
        fdr_uid: fdr.fdr_uid,
        maturity_date: matDateStr,
        days_remaining: daysRemaining,
        lifecycleState: targetState,
        softHoldEoa: fdr.softHoldEoa,
        slaBreached: fdr.slaBreached
      });
    }

    console.log(`[Validity Tracking Engine] Sweep complete: ${scannedCount} scanned, ${alertsTriggered} alerts dispatched, ${softHoldsApplied} soft-holds, ${slaBreachesDetected} SLA breaches.`);

    return {
      timestamp: new Date().toISOString(),
      scanned_count: scannedCount,
      alerts_dispatched: alertsTriggered,
      soft_holds_applied: softHoldsApplied,
      sla_breaches_detected: slaBreachesDetected,
      results: sweepResults
    };
  } catch (error) {
    console.error('[Validity Tracking Engine] Sweep error:', error);
    throw error;
  }
}

/**
 * Initializes the automated midnight UTC cron job (0 0 * * *)
 */
function initValidityTrackingCron() {
  console.log('[Cron Scheduler] Initializing Automated Validity & Maturity Tracking Daily Cron (0 0 * * *)...');
  
  const job = cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Scheduler] Firing Midnight UTC Automated Validity & Maturity Sweep (0 0 * * *)...');
    try {
      await runDailyValidityTrackingSweep();
    } catch (err) {
      console.error('[Cron Scheduler] Cron sweep error:', err);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  return job;
}

module.exports = {
  calculateDaysRemainingUtc,
  runDailyValidityTrackingSweep,
  initValidityTrackingCron
};
