const { logAuditEvent } = require('./auditLogger');

/**
 * AICTE Requirement 7: Automated Alert & Escalation Matrix Dispatcher
 * Dispatches simulated SMS/Email notifications and commits immutable audit trail events.
 */
async function dispatchAlert({
  recipient,
  role = 'INSTITUTE_NODAL_OFFICER',
  alertType = 'STATUTORY_MATURITY_REMINDER',
  fdrUid = null,
  message,
  actorId = 'AICTE_ESCALATION_ENGINE'
}) {
  const timestamp = new Date().toISOString();
  const targetEmail = recipient || 'officer@aicte-india.org';

  // 1. Log simulated SMS/Email payload to terminal
  console.log('--------------------------------------------------------------------------------');
  console.log(`[ALERT DISPATCHED] Type: [${alertType}] ➔ To: [${targetEmail}] Role: [${role}]`);
  console.log(`[TIMESTAMP] ${timestamp}`);
  if (fdrUid) console.log(`[FDR UID] ${fdrUid}`);
  console.log(`[NOTIFICATION MESSAGE] ${message}`);
  console.log('--------------------------------------------------------------------------------');

  // 2. Commit audit event to immutable AuditLedger (Req 7 & Req 9)
  const auditResult = await logAuditEvent({
    actorId,
    actorRole: 'AUTOMATED_CRON_ENGINE',
    actionEvent: 'ALERT_DISPATCHED',
    targetFdrId: fdrUid,
    payloadSummary: `[${alertType}] Dispatched to ${targetEmail} (${role}): ${message.slice(0, 140)}`
  });

  return {
    success: true,
    alertType,
    recipient: targetEmail,
    role,
    fdrUid,
    dispatchedAt: timestamp,
    auditBlockLogged: !!auditResult
  };
}

module.exports = {
  dispatchAlert
};
