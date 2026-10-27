const crypto = require('crypto');
const AuditLedger = require('../models/AuditLedger');

const GENESIS_BLOCK_HASH = '0'.repeat(64);

/**
 * Commits an immutable cryptographically chained block to the AuditLedger.
 */
async function logAuditEvent({
  actorId = 'SYSTEM_OPERATOR',
  actorRole = 'SYSTEM',
  actionEvent,
  targetFdrId = null,
  ipAddress = '127.0.0.1',
  payloadSummary
}) {
  try {
    // Fetch most recent block
    const lastEntry = await AuditLedger.findOne().sort({ timestamp: -1, _id: -1 });
    const previousBlockHash = (lastEntry && lastEntry.currentBlockHash) 
      ? lastEntry.currentBlockHash 
      : GENESIS_BLOCK_HASH;

    const timestamp = new Date();
    const rawData = `${previousBlockHash}|${timestamp.toISOString()}|${actorRole}|${actionEvent}|${targetFdrId || ''}|${payloadSummary}`;
    const currentBlockHash = crypto.createHash('sha256').update(rawData).digest('hex');

    const entry = new AuditLedger({
      timestamp,
      actorId,
      actorRole,
      actionEvent,
      targetFdrId,
      ipAddress,
      previousBlockHash,
      currentBlockHash,
      payloadSummary
    });

    await entry.save();
    return entry;
  } catch (err) {
    console.warn('[AuditLogger] Error writing audit block:', err.message);
    return null;
  }
}

/**
 * Validates the entire sequential SHA-256 cryptographic chain
 */
async function verifyAuditChain() {
  const logs = await AuditLedger.find().sort({ timestamp: 1, _id: 1 });
  if (logs.length === 0) {
    return {
      integrity_verified: true,
      total_records: 0,
      broken_at_index: null,
      message: 'AuditLedger is currently empty. Genesis state valid.'
    };
  }

  let expectedPrevHash = GENESIS_BLOCK_HASH;

  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];
    if (entry.previousBlockHash !== expectedPrevHash) {
      return {
        integrity_verified: false,
        total_records: logs.length,
        broken_at_index: i,
        broken_entry_id: entry._id,
        expected_prev_hash: expectedPrevHash,
        actual_prev_hash: entry.previousBlockHash,
        message: `CHAIN COMPROMISED: Hash pointer mismatch detected at block index ${i}.`
      };
    }

    // Verify current block hash integrity
    const rawData = `${entry.previousBlockHash}|${new Date(entry.timestamp).toISOString()}|${entry.actorRole}|${entry.actionEvent}|${entry.targetFdrId || ''}|${entry.payloadSummary}`;
    const recalculatedHash = crypto.createHash('sha256').update(rawData).digest('hex');

    if (recalculatedHash !== entry.currentBlockHash) {
      return {
        integrity_verified: false,
        total_records: logs.length,
        broken_at_index: i,
        broken_entry_id: entry._id,
        expected_hash: recalculatedHash,
        actual_hash: entry.currentBlockHash,
        message: `CHAIN COMPROMISED: Block digest mismatch at block index ${i}. Data was modified after minting.`
      };
    }

    expectedPrevHash = entry.currentBlockHash;
  }

  return {
    integrity_verified: true,
    total_records: logs.length,
    head_block_hash: expectedPrevHash,
    message: `Cryptographic SHA-256 hash chain verified 100% intact from Genesis to Head (${logs.length} blocks verified).`
  };
}

module.exports = {
  logAuditEvent,
  verifyAuditChain,
  GENESIS_BLOCK_HASH
};
