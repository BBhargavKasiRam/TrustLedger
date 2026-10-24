import hashlib
import datetime
from typing import Optional, Dict, Any, List
from pymongo.database import Database
try:
    from .models import AuditLog
except ImportError:
    from models import AuditLog

GENESIS_HASH = "0" * 64

def compute_audit_hash(
    prev_hash: str,
    actor_role: str,
    action_type: str,
    payload_summary: str,
    timestamp_str: str
) -> str:
    """Computes SHA-256 hash for immutable audit ledger document."""
    raw_data = f"{prev_hash}{actor_role}{action_type}{payload_summary}{timestamp_str}"
    return hashlib.sha256(raw_data.encode("utf-8")).hexdigest()

def record_audit_log(
    db: Any,
    actor_role: str,
    actor_name: str,
    action_type: str,
    payload_summary: str,
    target_fdr_uid: Optional[str] = None,
    timestamp: Optional[datetime.datetime] = None
) -> AuditLog:
    """
    Appends a new cryptographically chained audit log entry to the MongoDB audit_logs collection.
    Fetches the most recent document, takes its SHA-256 row_hash as prev_hash, and generates the new block.
    """
    if timestamp is None:
        timestamp = datetime.datetime.utcnow()
    
    # Standardize timestamp to second precision so MongoDB serialization does not alter hash
    timestamp = timestamp.replace(microsecond=0)
    timestamp_str = timestamp.isoformat()

    collection = db.audit_logs if hasattr(db, "audit_logs") else db

    # Fetch most recent audit document
    last_log = collection.find_one(sort=[("id", -1)])
    if not last_log:
        last_log = collection.find_one(sort=[("_id", -1)])

    prev_hash = last_log.get("row_hash") if last_log else GENESIS_HASH

    row_hash = compute_audit_hash(
        prev_hash=prev_hash,
        actor_role=actor_role,
        action_type=action_type,
        payload_summary=payload_summary,
        timestamp_str=timestamp_str
    )

    last_id = last_log.get("id") if (last_log and isinstance(last_log.get("id"), int)) else 0
    next_id = last_id + 1

    new_log_doc = {
        "id": next_id,
        "timestamp": timestamp,
        "actor_role": actor_role,
        "actor_name": actor_name,
        "action_type": action_type,
        "target_fdr_uid": target_fdr_uid,
        "payload_summary": payload_summary,
        "prev_hash": prev_hash,
        "row_hash": row_hash
    }

    res = collection.insert_one(new_log_doc)
    new_log_doc["_id"] = str(res.inserted_id)
    return AuditLog(**new_log_doc)

def verify_audit_chain(db: Any) -> Dict[str, Any]:
    """Recalculates the entire audit ledger from Genesis to head and verifies SHA-256 chain integrity."""
    collection = db.audit_logs if hasattr(db, "audit_logs") else db
    logs: List[Dict[str, Any]] = list(collection.find().sort("id", 1))
    
    if not logs:
        return {
            "integrity_verified": True,
            "total_records": 0,
            "broken_at_id": None,
            "message": "Audit ledger is currently empty. Genesis state valid."
        }

    expected_prev = GENESIS_HASH
    for log in logs:
        ts = log.get("timestamp")
        if isinstance(ts, datetime.datetime):
            timestamp_str = ts.replace(microsecond=0).isoformat()
        else:
            timestamp_str = str(ts)
        log_id = log.get("id", str(log.get("_id")))
        prev_hash = log.get("prev_hash")
        row_hash = log.get("row_hash")
        actor_role = log.get("actor_role", "")
        action_type = log.get("action_type", "")
        payload_summary = log.get("payload_summary", "")

        # 1. Verify link back to previous row
        if prev_hash != expected_prev:
            return {
                "integrity_verified": False,
                "total_records": len(logs),
                "broken_at_id": log_id,
                "message": f"Hash chain broken at Log #{log_id}: prev_hash mismatch. Expected {expected_prev}, found {prev_hash}"
            }
        
        # 2. Re-compute SHA-256 hash
        computed_hash = compute_audit_hash(
            prev_hash=prev_hash,
            actor_role=actor_role,
            action_type=action_type,
            payload_summary=payload_summary,
            timestamp_str=timestamp_str
        )

        if computed_hash != row_hash:
            return {
                "integrity_verified": False,
                "total_records": len(logs),
                "broken_at_id": log_id,
                "message": f"Tampering detected at Log #{log_id}: row_hash {row_hash} does not match recalculated hash {computed_hash}"
            }

        expected_prev = row_hash

    return {
        "integrity_verified": True,
        "total_records": len(logs),
        "broken_at_id": None,
        "latest_block_hash": expected_prev,
        "message": f"All {len(logs)} audit ledger records cryptographically verified with zero discrepancies."
    }
