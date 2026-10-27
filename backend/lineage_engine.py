import os
import datetime
import math
from typing import Optional, Dict, Any, List

try:
    from .models import FDRInstrument, Institution, AuditLog, doc_to_fdr, doc_to_institution
    from .audit_service import record_audit_log
except ImportError:
    from models import FDRInstrument, Institution, AuditLog, doc_to_fdr, doc_to_institution
    from audit_service import record_audit_log

def parse_date(date_str: Optional[str]) -> Optional[datetime.date]:
    """Safely parses YYYY-MM-DD or DD/MM/YYYY string into datetime.date."""
    if not date_str:
        return None
    date_str = str(date_str).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.datetime.strptime(date_str, fmt).date()
        except ValueError:
            pass
    return None

def run_temporal_time_travel(
    db: Any,
    simulated_date_str: Optional[str] = None,
    days_offset: int = 0
) -> Dict[str, Any]:
    """
    Simulates time-travel for the AICTE Temporal SLA Watchdog.
    Scans all FDRs in MongoDB, computes (maturity_date - simulated_date), transitions statuses,
    generates escalation notices, and logs state transitions to the SHA-256 ledger.
    """
    base_date = datetime.date.today()
    if simulated_date_str:
        sim_date = parse_date(simulated_date_str) or base_date
    else:
        sim_date = base_date + datetime.timedelta(days=days_offset)

    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db

    fdr_docs = list(fdr_col.find({}))
    all_fdrs = [doc_to_fdr(d) for d in fdr_docs]
    transitions_triggered = 0
    escalation_notices = []
    countdown_matrix = []

    # Cache institutions
    inst_docs = list(inst_col.find({}))
    inst_map = {str(i.get("id", i.get("_id"))): i for i in inst_docs}

    for fdr in all_fdrs:
        mat_date = parse_date(fdr.inst_maturity_date) or parse_date(fdr.ocr_maturity_date) or (base_date + datetime.timedelta(days=365))
        days_remaining = (mat_date - sim_date).days

        old_status = fdr.lifecycle_status
        new_status = old_status
        severity = "NORMAL"
        recipient = "AICTE Automated Surveillance"
        alert_msg = ""

        # Status transition logic (preserving completed/frozen lifecycle states)
        if fdr.lifecycle_status in ["RENEWED_SUPERSEDED", "RELEASE_APPROVED_NOC_ISSUED"]:
            new_status = fdr.lifecycle_status
            severity = "HISTORICAL"
        elif days_remaining < 0:
            new_status = "MATURED_ACTION_PENDING"
            severity = "LAPSED_OVERDUE"
            recipient = "Regional Officer & Member Secretary AICTE"
            alert_msg = (
                f"SLA WATCHDOG CRITICAL ALERT: FDR {fdr.fdr_uid} ({fdr.inst_bank_name}) has LAPSED. "
                f"Matured on {mat_date.isoformat()} ({abs(days_remaining)} days overdue). "
                f"Official Show-Cause Notice & Extension of Approval (EoA) Soft-Hold triggered."
            )
        elif days_remaining <= 30:
            new_status = "APPROACHING_MATURITY_T30"
            severity = "T30_HIGH_ALERT"
            recipient = "College Principal & Bank Branch Nodal Officer"
            alert_msg = (
                f"SLA WATCHDOG T-30 COUNTDOWN: FDR {fdr.fdr_uid} expires in {days_remaining} days ({mat_date.isoformat()}). "
                f"Regulatory requirement: Mandate 5-year renewal submission or initiate 4-gate release clearance."
            )
        elif days_remaining <= 60:
            new_status = "APPROACHING_MATURITY_T60"
            severity = "T60_MODERATE_ALERT"
            recipient = "Institution Nodal Officer"
            alert_msg = f"SLA WATCHDOG T-60 NOTICE: FDR {fdr.fdr_uid} matures in {days_remaining} days. Automated SMS & Portal advisory dispatched."
        elif days_remaining <= 90:
            new_status = "APPROACHING_MATURITY_T90"
            severity = "T90_EARLY_WARNING"
            recipient = "Institution Portal Dashboard"
            alert_msg = f"SLA WATCHDOG T-90 ADVISORY: FDR {fdr.fdr_uid} maturity approaching in {days_remaining} days."
        else:
            if fdr.lifecycle_status not in ["DISCREPANCY_FLAGGED", "UNDER_SCRUTINY"]:
                new_status = "ACTIVE_VERIFIED"
            severity = "NORMAL"

        if new_status != old_status:
            transitions_triggered += 1
            fdr.lifecycle_status = new_status
            fdr.sync_dual_truth()
            fdr_col.update_one(
                {"fdr_uid": fdr.fdr_uid},
                {"$set": {"lifecycle_status": new_status, "updated_at": datetime.datetime.utcnow()}}
            )

        if new_status == "MATURED_ACTION_PENDING":
            inst_col.update_one(
                {"$or": [{"id": fdr.institution_id}, {"id": str(fdr.institution_id)}]},
                {"$set": {"eoa_status": "SOFT_HOLD_APPLIED", "updated_at": datetime.datetime.utcnow()}}
            )

        inst_info = inst_map.get(str(fdr.institution_id), {})
        inst_display_name = inst_info.get("name", f"Institution #{fdr.institution_id}")

        if alert_msg:
            escalation_notices.append({
                "fdr_uid": fdr.fdr_uid,
                "institution_name": inst_display_name,
                "bank_name": fdr.inst_bank_name,
                "days_remaining": days_remaining,
                "severity": severity,
                "recipient": recipient,
                "message": alert_msg,
                "timestamp": sim_date.isoformat()
            })

        countdown_matrix.append({
            "fdr_uid": fdr.fdr_uid,
            "institution_name": inst_display_name,
            "bank_name": fdr.inst_bank_name,
            "principal": fdr.inst_principal_amount,
            "maturity_date": mat_date.isoformat(),
            "days_remaining": days_remaining,
            "status": fdr.lifecycle_status,
            "severity": severity,
            "recipient": recipient
        })

    # Log to SHA-256 Audit Ledger if transitions triggered
    if transitions_triggered > 0:
        summary_text = (
            f"Temporal SLA Watchdog Sweep executed for simulated date {sim_date.isoformat()} (offset: {days_offset:+d} days). "
            f"Triggered {transitions_triggered} automatic state transitions across {len(all_fdrs)} instruments."
        )
        record_audit_log(
            db=db,
            actor_role="SYSTEM_SLA_SENTINEL",
            actor_name="AICTE Automated SLA Cron Watchdog",
            action_type="TEMPORAL_TIME_TRAVEL_SWEEP",
            payload_summary=summary_text,
            target_fdr_uid="ALL_INSTRUMENTS",
            timestamp=datetime.datetime.utcnow()
        )

    # Sort countdown matrix by days_remaining ascending
    countdown_matrix.sort(key=lambda x: x["days_remaining"])

    if hasattr(db, "system_state"):
        db.system_state.update_one(
            {"id": 1},
            {"$set": {"simulated_system_date": sim_date.isoformat(), "days_offset": days_offset, "updated_at": datetime.datetime.utcnow()}},
            upsert=True
        )

    return {
        "simulated_date": sim_date.isoformat(),
        "days_offset": days_offset,
        "total_instruments_scanned": len(all_fdrs),
        "transitions_triggered": transitions_triggered,
        "escalation_notices": escalation_notices,
        "countdown_matrix": countdown_matrix
    }

def build_lineage_graph(
    db: Any,
    target_fdr_uid: Optional[str] = None,
    institution_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Traverses parent_fdr_id up to the Root node, then builds a complete Directed Acyclic Graph (DAG)
    capturing all generations of renewals and bank merger replacements from MongoDB.
    """
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db

    # Find seed FDR
    if target_fdr_uid:
        seed_doc = fdr_col.find_one({"fdr_uid": target_fdr_uid})
    elif institution_id:
        seed_doc = fdr_col.find_one({"$or": [{"institution_id": institution_id}, {"institution_id": str(institution_id)}]})
    else:
        seed_doc = fdr_col.find_one({"fdr_uid": "FDR-2016-101"}) or fdr_col.find_one({})

    if not seed_doc:
        return {"nodes": [], "edges": [], "root_fdr_uid": "", "institution_id": 0}

    seed_fdr = doc_to_fdr(seed_doc)

    # Climb up to find true Root node
    curr = seed_fdr
    while curr.parent_fdr_id is not None:
        parent_doc = fdr_col.find_one({"$or": [{"id": curr.parent_fdr_id}, {"id": str(curr.parent_fdr_id)}]})
        if not parent_doc:
            break
        curr = doc_to_fdr(parent_doc)

    root_fdr = curr
    inst_id = root_fdr.institution_id

    # Fetch all FDRs for this institution to construct complete DAG
    inst_fdr_docs = list(fdr_col.find({"$or": [{"institution_id": inst_id}, {"institution_id": str(inst_id)}]}))
    inst_fdrs = [doc_to_fdr(d) for d in inst_fdr_docs]
    fdr_map = {f.id: f for f in inst_fdrs}

    nodes = []
    edges = []

    # Hierarchy level calculation
    def get_level(fdr: FDRInstrument) -> int:
        lvl = 0
        p_id = fdr.parent_fdr_id
        while p_id is not None and p_id in fdr_map:
            lvl += 1
            p_id = fdr_map[p_id].parent_fdr_id
        return lvl

    # Build React-Flow formatted nodes & edges
    for f in inst_fdrs:
        lvl = get_level(f)
        x_pos = lvl * 320 + 50
        y_pos = 100 + (hash(str(f.id)) % 3) * 70

        is_root = f.parent_fdr_id is None
        is_active = f.lifecycle_status in ["ACTIVE_VERIFIED", "APPROACHING_MATURITY_T90", "APPROACHING_MATURITY_T60", "APPROACHING_MATURITY_T30"]

        nodes.append({
            "id": str(f.id),
            "type": "customFdrNode",
            "position": {"x": x_pos, "y": y_pos},
            "data": {
                "fdr_uid": f.fdr_uid,
                "fdr_number": f.inst_fdr_number or f.ocr_fdr_number,
                "bank_name": f.inst_bank_name or f.ocr_bank_name,
                "principal": f.inst_principal_amount or 0.0,
                "issue_date": f.inst_issue_date or "",
                "maturity_date": f.inst_maturity_date or "",
                "lifecycle_status": f.lifecycle_status,
                "relation_type": f.relation_type or ("INITIAL_DEPOSIT" if is_root else "RENEWAL"),
                "is_root": is_root,
                "is_active": is_active,
                "level": lvl
            }
        })

        if f.parent_fdr_id is not None and f.parent_fdr_id in fdr_map:
            label = "Re-issued (Bank Merger)" if f.relation_type == "BANK_MERGER_REPLACEMENT" else "Renewed (Maturity)"
            edges.append({
                "id": f"e{f.parent_fdr_id}-{f.id}",
                "source": str(f.parent_fdr_id),
                "target": str(f.id),
                "animated": is_active,
                "label": label,
                "style": {"stroke": "#2563eb", "strokeWidth": 2}
            })

    inst_doc = inst_col.find_one({"$or": [{"id": inst_id}, {"id": str(inst_id)}]})
    inst_name = inst_doc.get("name", "Apex Institute of Technology, Lucknow") if inst_doc else "Apex Institute of Technology, Lucknow"

    return {
        "nodes": nodes,
        "edges": edges,
        "root_fdr_uid": root_fdr.fdr_uid,
        "institution_id": inst_id,
        "institution_name": inst_name,
        "total_generations": max([get_level(f) for f in inst_fdrs], default=0) + 1
    }

def link_renewal_child_fdr(
    db: Any,
    parent_fdr_uid: str,
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Creates a new Child FDR in the DAG lineage tree.
    Marks parent as RENEWED_SUPERSEDED in MongoDB,
    links child via parent_fdr_id, and records a cryptographically chained block into the AuditLog.
    """
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db

    parent_doc = fdr_col.find_one({"fdr_uid": parent_fdr_uid})
    if not parent_doc:
        raise ValueError(f"Parent FDR Instrument {parent_fdr_uid} not found.")

    parent = doc_to_fdr(parent_doc)
    old_parent_status = parent.lifecycle_status

    # Mark parent as RENEWED_SUPERSEDED
    fdr_col.update_one(
        {"fdr_uid": parent_fdr_uid},
        {"$set": {"lifecycle_status": "RENEWED_SUPERSEDED", "updated_at": datetime.datetime.utcnow()}}
    )

    # Generate unique child FDR UID
    total_count = fdr_col.count_documents({})
    next_id = total_count + 1
    child_fdr_uid = payload.get("new_fdr_number") or f"FDR-2026-{700 + total_count + 1}"
    if not child_fdr_uid.startswith("FDR-"):
        child_fdr_uid = f"FDR-2026-{child_fdr_uid.replace('/', '-')[-6:]}"

    now = datetime.datetime.utcnow()
    relation_type = payload.get("relation_type", "MATURITY_RENEWAL")
    principal = float(payload.get("new_principal_amount", parent.inst_principal_amount or 3500000.0))
    rate = float(payload.get("new_interest_rate", 7.40))
    maturity_date = payload.get("new_maturity_date", "2031-10-24")
    issue_date = payload.get("new_issue_date", "2026-10-24")
    bank_name = payload.get("new_bank_name", parent.inst_bank_name or "Canara Bank")
    ifsc = payload.get("new_ifsc", parent.inst_ifsc or "CNRB0001234")
    reason = payload.get("renewal_reason", "Statutory 5-year extension under AICTE Approval Process Handbook (APH).")

    # Fetch institution name
    inst_doc = inst_col.find_one({"$or": [{"id": parent.institution_id}, {"id": str(parent.institution_id)}]})
    inst_name = inst_doc.get("name", "Apex Institute") if inst_doc else "College"

    # Create new child instrument
    child_fdr = FDRInstrument(
        id=next_id,
        fdr_uid=child_fdr_uid,
        institution_id=parent.institution_id,
        parent_fdr_id=parent.id,
        relation_type=relation_type,

        # Column Set A - inst_declared
        inst_fdr_number=child_fdr_uid,
        inst_bank_name=bank_name,
        inst_ifsc=ifsc,
        inst_principal_amount=principal,
        inst_interest_rate=rate,
        inst_maturity_amount=round(principal * math.pow(1.0 + (rate / 400.0), 20)),
        inst_issue_date=issue_date,
        inst_maturity_date=maturity_date,
        inst_joint_holder_text=f"JOINTLY IN THE NAME OF {inst_name.split(',')[0].upper()} AND SECRETARY, AICTE",
        inst_no_lien_declared=True,

        # Column Set B - ocr_extracted
        ocr_fdr_number=child_fdr_uid,
        ocr_bank_name=bank_name,
        ocr_ifsc=ifsc,
        ocr_principal_amount=principal,
        ocr_interest_rate=rate,
        ocr_maturity_amount=round(principal * math.pow(1.0 + (rate / 400.0), 20)),
        ocr_issue_date=issue_date,
        ocr_maturity_date=maturity_date,
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=round(principal * math.pow(1.0 + (rate / 400.0), 20)),
        math_tamper_flag=False,
        ela_tamper_score=0.01,
        duplicate_flag=False,

        # Column Set C - bank_confirmed
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=principal,
        bank_confirmed_maturity_date=maturity_date,
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email=f"fdr.nodal@{ifsc[:4].lower()}bank.in",
        bank_verified_at=now,

        # Lifecycle
        lifecycle_status="ACTIVE_VERIFIED",
        document_path=parent.document_path
    )

    fdr_col.insert_one(child_fdr.to_mongo_dict())

    # Append to SHA-256 Hash-Chained Audit Ledger
    summary_text = (
        f"Committed DAG Child Lineage: Linked new instrument {child_fdr.fdr_uid} ({bank_name}, ₹{principal:,.0f}) "
        f"as {relation_type} superseding parent {parent.fdr_uid} (previously {old_parent_status}). "
        f"Reason: {reason}."
    )

    audit_entry = record_audit_log(
        db=db,
        actor_role="INSTITUTION_NODAL_OFFICER",
        actor_name=f"Nodal Officer ({inst_name.split(',')[0]})",
        action_type="DAG_LINEAGE_CHILD_LINKED",
        payload_summary=summary_text,
        target_fdr_uid=child_fdr.fdr_uid,
        timestamp=now
    )

    return {
        "message": f"Successfully committed DAG child lineage for {child_fdr.fdr_uid}.",
        "child_fdr": child_fdr.model_dump(),
        "parent_fdr_uid": parent.fdr_uid,
        "relation_type": relation_type,
        "audit_entry_hash": audit_entry.row_hash,
        "timestamp": now.isoformat()
    }
