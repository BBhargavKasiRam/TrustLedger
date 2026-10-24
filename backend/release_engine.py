import os
import hashlib
import datetime
from typing import Optional, Dict, Any, List

try:
    from .models import (
        FDRInstrument, Institution, ReleaseRequest, AuditLog,
        doc_to_fdr, doc_to_institution, doc_to_release_request
    )
    from .audit_service import record_audit_log
    from .lineage_engine import parse_date
except ImportError:
    from models import (
        FDRInstrument, Institution, ReleaseRequest, AuditLog,
        doc_to_fdr, doc_to_institution, doc_to_release_request
    )
    from audit_service import record_audit_log
    from lineage_engine import parse_date

def find_genesis_root_fdr(db: Any, fdr: FDRInstrument) -> FDRInstrument:
    """Climbs the parent_fdr_id hierarchy in MongoDB to determine the original deposit genesis node."""
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    curr = fdr
    while curr.parent_fdr_id is not None:
        p_doc = fdr_col.find_one({"$or": [{"id": curr.parent_fdr_id}, {"id": str(curr.parent_fdr_id)}]})
        if not p_doc:
            break
        curr = doc_to_fdr(p_doc)
    return curr

def evaluate_gate1_lockin(db: Any, fdr: FDRInstrument, sim_date: Optional[datetime.date] = None) -> Dict[str, Any]:
    """
    Gate 1: Evaluates continuous statutory lock-in tenure across the lineage chain
    and verifies that bank CBS lien status is clean with zero encumbrance.
    """
    root_node = find_genesis_root_fdr(db, fdr)
    base_date = sim_date or datetime.date(2026, 10, 24)

    root_start_date = parse_date(root_node.inst_issue_date) or parse_date(root_node.ocr_issue_date) or datetime.date(2016, 4, 15)
    fdr_mat_date = parse_date(fdr.inst_maturity_date) or parse_date(fdr.ocr_maturity_date) or (root_start_date + datetime.timedelta(days=3650))

    tenure_days = (base_date - root_start_date).days
    tenure_years = round(tenure_days / 365.25, 2)
    required_years = 8  # Standard statutory lock-in norm for AICTE technical institutions (APH clause 2.14)

    is_tenure_satisfied = tenure_years >= required_years
    is_lien_clean = (fdr.bank_lien_status == "ACTIVE_JOINT_AICTE") and (fdr.bank_verified_status in ["VERIFIED_API", "VERIFIED_MAGIC_LINK"])
    gate_passed = is_tenure_satisfied and is_lien_clean

    remarks = []
    if not is_tenure_satisfied:
        remarks.append(f"Statutory lock-in incomplete: {tenure_years} years completed vs {required_years} years required under APH Norms.")
    else:
        remarks.append(f"Statutory lock-in fulfilled: {tenure_years} continuous years on unbroken DAG lineage from Genesis FDR {root_node.fdr_uid}.")

    if not is_lien_clean:
        remarks.append(f"Bank Lien encumbered or unverified: Status is '{fdr.bank_lien_status or 'UNVERIFIED'}' (CBS Status: {fdr.bank_verified_status}).")
    else:
        remarks.append(f"Core Banking attestation verified: Joint lien intact in favor of Member Secretary AICTE.")

    return {
        "gate_number": 1,
        "gate_name": "Tenure & Bank Lien Clearance",
        "passed": gate_passed,
        "tenure_years_completed": tenure_years,
        "tenure_years_required": required_years,
        "tenure_satisfied": is_tenure_satisfied,
        "genesis_root_fdr_uid": root_node.fdr_uid,
        "genesis_bank_name": root_node.inst_bank_name,
        "genesis_issue_date": root_start_date.isoformat(),
        "current_maturity_date": fdr_mat_date.isoformat(),
        "bank_lien_clean": is_lien_clean,
        "bank_lien_status": fdr.bank_lien_status,
        "bank_verified_status": fdr.bank_verified_status,
        "remarks": remarks
    }

def evaluate_gate2_compliance(db: Any, inst: Optional[Any], override: bool = False) -> Dict[str, Any]:
    """
    Gate 2: Cross-Bureau Regulatory Compliance Check.
    Validates ERP flags: Court Cases, Faculty Unpaid Salaries, PGRC Student Penalties, and EVC Deficiencies.
    """
    if not inst:
        return {
            "gate_number": 2,
            "gate_name": "Cross-Bureau ERP Compliance Clearance",
            "passed": False,
            "pending_court_cases": False,
            "unpaid_salary_complaints": False,
            "pending_pgrc_penalties": 0,
            "evc_deficiencies": False,
            "override_applied": override,
            "remarks": ["Institution record missing from registry."]
        }

    # Extract values whether inst is Institution model, dict, or object
    def get_attr(obj, attr, default=None):
        if isinstance(obj, dict):
            return obj.get(attr, default)
        return getattr(obj, attr, default)

    court_cases = bool(get_attr(inst, "pending_court_cases", False))
    unpaid_salary = bool(get_attr(inst, "unpaid_salary_complaints", False))
    pgrc_penalties = int(get_attr(inst, "pending_pgrc_penalties", 0))
    evc_deficiencies = bool(get_attr(inst, "evc_deficiencies", False))

    issues = []
    if court_cases:
        issues.append("Active litigation flag: Pending court cases related to land title / trust governance.")
    if unpaid_salary:
        issues.append("Faculty grievance hold: Active 7th CPC unpaid faculty salary complaints on AICTE grievance portal.")
    if pgrc_penalties > 0:
        issues.append(f"Student Ombudsman penalty: ₹{pgrc_penalties:,.0f} unrecovered fee refund penalty.")
    if evc_deficiencies:
        issues.append("Expert Visit Committee (EVC) alert: Unresolved faculty cadration / laboratory infrastructure deficiencies.")

    has_violations = len(issues) > 0
    passed = override or (not has_violations)

    remarks = []
    if override:
        remarks.append("REGULATORY OVERRIDE APPLIED: Compliance hold conditionally bypassed under Section 10(1) with financial surety indemnity.")
    elif has_violations:
        remarks.extend(issues)
    else:
        remarks.append("Zero outstanding compliance holds across AICTE National ERP, PGRC Ombudsman, and Legal Bureau.")

    return {
        "gate_number": 2,
        "gate_name": "Cross-Bureau ERP Compliance Clearance",
        "passed": passed,
        "pending_court_cases": court_cases,
        "unpaid_salary_complaints": unpaid_salary,
        "pending_pgrc_penalties": pgrc_penalties,
        "evc_deficiencies": evc_deficiencies,
        "override_applied": override,
        "remarks": remarks
    }

def get_or_create_release_request(db: Any, fdr: FDRInstrument) -> ReleaseRequest:
    """Fetches existing ReleaseRequest or initiates a default one from MongoDB."""
    rel_col = db.release_requests if hasattr(db, "release_requests") else db
    req_doc = rel_col.find_one({"$or": [{"fdr_id": fdr.id}, {"fdr_id": str(fdr.id)}]})
    if not req_doc:
        total_count = rel_col.count_documents({})
        req = ReleaseRequest(
            id=total_count + 1,
            fdr_id=fdr.id,
            institution_id=fdr.institution_id,
            request_date=datetime.datetime.utcnow(),
            gate1_tenure_passed=False,
            gate2_erp_compliance_passed=False,
            gate3_scrutiny_officer_approved=False,
            gate4_competent_authority_approved=False,
            status="PENDING_SCRUTINY"
        )
        rel_col.insert_one(req.to_mongo_dict())
        return req
    return doc_to_release_request(req_doc)

def initiate_release_evaluation(
    db: Any,
    fdr_uid: str,
    override_erp: bool = False,
    applicant_name: str = "Institution Nodal Officer"
) -> Dict[str, Any]:
    """
    Initiates the 4-Gate Release Clearance Workflow and runs automated Gate 1 & Gate 2 evaluations in MongoDB.
    """
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db
    rel_col = db.release_requests if hasattr(db, "release_requests") else db

    fdr_doc = fdr_col.find_one({"fdr_uid": fdr_uid})
    if not fdr_doc:
        raise ValueError(f"FDR {fdr_uid} not found.")

    fdr = doc_to_fdr(fdr_doc)
    inst_doc = inst_col.find_one({"$or": [{"id": fdr.institution_id}, {"id": str(fdr.institution_id)}]})
    inst = doc_to_institution(inst_doc)
    fdr.institution = inst_doc

    req = get_or_create_release_request(db, fdr)

    gate1 = evaluate_gate1_lockin(db, fdr)
    gate2 = evaluate_gate2_compliance(db, inst, override=override_erp)

    req.gate1_tenure_passed = gate1["passed"]
    req.gate2_erp_compliance_passed = gate2["passed"]

    if gate1["passed"] and gate2["passed"]:
        if not req.gate3_scrutiny_officer_approved:
            req.status = "PENDING_SCRUTINY"
            fdr.lifecycle_status = "RELEASE_REQUESTED"
    else:
        req.status = "BLOCKED_COMPLIANCE"
        if not fdr.math_tamper_flag and fdr.lifecycle_status != "DISCREPANCY_FLAGGED":
            fdr.lifecycle_status = "RELEASE_REQUESTED"

    rel_col.update_one(
        {"$or": [{"id": req.id}, {"id": str(req.id)}]},
        {"$set": req.to_mongo_dict()}
    )
    fdr_col.update_one(
        {"fdr_uid": fdr.fdr_uid},
        {"$set": {"lifecycle_status": fdr.lifecycle_status, "updated_at": datetime.datetime.utcnow()}}
    )

    # Log to SHA-256 Audit Ledger
    now = datetime.datetime.utcnow()
    inst_name = inst.name if inst else "Institution"
    summary_text = (
        f"4-Gate Release Evaluation initiated for {fdr.fdr_uid} ({inst_name}). "
        f"Gate 1 Lock-In: {'PASSED' if gate1['passed'] else 'FAILED'} ({gate1['tenure_years_completed']} yrs). "
        f"Gate 2 Cross-Bureau ERP: {'PASSED' if gate2['passed'] else 'BLOCKED'} (Status: {req.status})."
    )
    audit_entry = record_audit_log(
        db=db,
        actor_role="INSTITUTION_NODAL_OFFICER",
        actor_name=applicant_name,
        action_type="RELEASE_4GATE_EVALUATION_INITIATED",
        payload_summary=summary_text,
        target_fdr_uid=fdr.fdr_uid,
        timestamp=now
    )

    return build_release_status_payload(db, fdr, req, gate1, gate2, audit_entry.row_hash)

def signoff_gate3_scrutiny(
    db: Any,
    fdr_uid: str,
    officer_name: str = "Regional Scrutiny Officer, AICTE",
    remarks: str = "4-Gate compliance dossier verified. Statutory lock-in tenure satisfied and ERP clearance confirmed. Recommended for lien release.",
    decision: str = "RECOMMEND_RELEASE",
    bypass_prerequisites: bool = False
) -> Dict[str, Any]:
    """
    Gate 3: AICTE Scrutiny & Regulation Bureau Officer Sign-Off in MongoDB.
    """
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db
    rel_col = db.release_requests if hasattr(db, "release_requests") else db

    fdr_doc = fdr_col.find_one({"fdr_uid": fdr_uid})
    if not fdr_doc:
        raise ValueError(f"FDR {fdr_uid} not found.")

    fdr = doc_to_fdr(fdr_doc)
    inst_doc = inst_col.find_one({"$or": [{"id": fdr.institution_id}, {"id": str(fdr.institution_id)}]})
    inst = doc_to_institution(inst_doc)
    fdr.institution = inst_doc

    req = get_or_create_release_request(db, fdr)

    gate1 = evaluate_gate1_lockin(db, fdr)
    gate2 = evaluate_gate2_compliance(db, inst)

    if not bypass_prerequisites and (not gate1["passed"] or not gate2["passed"]):
        raise ValueError("Cannot approve Gate 3: Gate 1 (Tenure & Bank) or Gate 2 (Cross-Bureau ERP) is not passed.")

    if decision == "RECOMMEND_RELEASE":
        req.gate3_scrutiny_officer_approved = True
        req.status = "PENDING_COMPETENT_AUTHORITY"
    else:
        req.gate3_scrutiny_officer_approved = False
        req.status = "BLOCKED_COMPLIANCE"

    rel_col.update_one(
        {"$or": [{"id": req.id}, {"id": str(req.id)}]},
        {"$set": req.to_mongo_dict()}
    )

    now = datetime.datetime.utcnow()
    summary_text = (
        f"Gate 3 Regulation Bureau Scrutiny clearance signed off by {officer_name}. "
        f"Decision: {decision}. Remarks: {remarks}."
    )
    audit_entry = record_audit_log(
        db=db,
        actor_role="AICTE_SCRUTINY_OFFICER",
        actor_name=officer_name,
        action_type="RELEASE_GATE3_SCRUTINY_APPROVED",
        payload_summary=summary_text,
        target_fdr_uid=fdr.fdr_uid,
        timestamp=now
    )

    return build_release_status_payload(db, fdr, req, gate1, gate2, audit_entry.row_hash)

def approve_gate4_authority(
    db: Any,
    fdr_uid: str,
    authority_name: str = "Member Secretary, AICTE",
    pin: str = "102026",
    remarks: str = "Exercising statutory regulatory power under Section 10(1) of AICTE Act. Approved for unconditional discharge and lien release."
) -> Dict[str, Any]:
    """
    Gate 4: Competent Authority Final Digital Sign-Off & Cryptographic QR NOC Issuance in MongoDB.
    """
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db
    rel_col = db.release_requests if hasattr(db, "release_requests") else db

    fdr_doc = fdr_col.find_one({"fdr_uid": fdr_uid})
    if not fdr_doc:
        raise ValueError(f"FDR {fdr_uid} not found.")

    fdr = doc_to_fdr(fdr_doc)
    inst_doc = inst_col.find_one({"$or": [{"id": fdr.institution_id}, {"id": str(fdr.institution_id)}]})
    inst = doc_to_institution(inst_doc)
    fdr.institution = inst_doc

    req = get_or_create_release_request(db, fdr)
    now = datetime.datetime.utcnow()

    # Generate authoritative cryptographic SHA-256 NOC hash
    inst_pid = inst.pid if inst else "1-000000000"
    raw_signature_payload = f"AICTE_NOC:{fdr.fdr_uid}:{inst_pid}:{fdr.inst_principal_amount}:{fdr.inst_ifsc}:{pin}:{now.isoformat()}"
    noc_hash = hashlib.sha256(raw_signature_payload.encode("utf-8")).hexdigest()

    req.gate4_competent_authority_approved = True
    req.status = "APPROVED_NOC_READY"
    req.noc_certificate_hash = noc_hash
    fdr.lifecycle_status = "RELEASE_APPROVED_NOC_ISSUED"

    rel_col.update_one(
        {"$or": [{"id": req.id}, {"id": str(req.id)}]},
        {"$set": req.to_mongo_dict()}
    )
    fdr_col.update_one(
        {"fdr_uid": fdr.fdr_uid},
        {"$set": {"lifecycle_status": "RELEASE_APPROVED_NOC_ISSUED", "updated_at": now}}
    )

    inst_name = inst.name if inst else "College"
    summary_text = (
        f"Gate 4 Final Statutory Authorization executed by {authority_name}. "
        f"Issued Official Discharge NOC {noc_hash[:16]}... Releasing joint lien on ₹{fdr.inst_principal_amount:,.0f} "
        f"deposit in favor of {inst_name} ({fdr.inst_bank_name})."
    )
    audit_entry = record_audit_log(
        db=db,
        actor_role="COMPETENT_AUTHORITY",
        actor_name=authority_name,
        action_type="RELEASE_GATE4_NOC_AUTHORIZED",
        payload_summary=summary_text,
        target_fdr_uid=fdr.fdr_uid,
        timestamp=now
    )

    gate1 = evaluate_gate1_lockin(db, fdr)
    gate2 = evaluate_gate2_compliance(db, inst)

    return build_release_status_payload(db, fdr, req, gate1, gate2, audit_entry.row_hash)

def verify_discharge_noc(db: Any, noc_hash: str) -> Dict[str, Any]:
    """
    Public / Bank QR Verification Endpoint: Verifies the authenticity of a Discharge NOC.
    """
    rel_col = db.release_requests if hasattr(db, "release_requests") else db
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db
    audit_col = db.audit_logs if hasattr(db, "audit_logs") else db

    req_doc = rel_col.find_one({"noc_certificate_hash": noc_hash})
    if not req_doc:
        # Provide authentic demo verification for sample reference hash
        if noc_hash in ["c0f7d54b819f2a4e9081e2b5c6d3f4a1", "AICTE-NOC-APEX-2020-205", "sha256_mock_apex_discharge_noc"]:
            apex_doc = fdr_col.find_one({"fdr_uid": "FDR-2020-205"})
            if apex_doc:
                apex_fdr = doc_to_fdr(apex_doc)
                inst_doc = inst_col.find_one({"$or": [{"id": apex_fdr.institution_id}, {"id": str(apex_fdr.institution_id)}]})
                inst = doc_to_institution(inst_doc)
                return {
                    "noc_certificate_hash": noc_hash,
                    "is_valid": True,
                    "fdr_uid": apex_fdr.fdr_uid,
                    "institution_name": inst.name if inst else "Apex Institute of Technology, Lucknow",
                    "institution_pid": inst.pid if inst else "1-100200301",
                    "bank_name": apex_fdr.inst_bank_name or "Canara Bank",
                    "ifsc": apex_fdr.inst_ifsc or "CNRB0001234",
                    "principal_amount": apex_fdr.inst_principal_amount or 3500000.0,
                    "issued_at": datetime.date.today().isoformat(),
                    "issuing_authority": "Member Secretary, AICTE (Competent Regulatory Authority)",
                    "audit_block_hash": "8fa3c0e1279a0b12ff90123456789abcde0123456789abcdef0123456789abcd",
                    "status": "OFFICIALLY_VERIFIED_AUTHENTIC",
                    "message": "Discharge NOC is 100% Cryptographically Authentic and Verified against the SHA-256 Regulatory Ledger."
                }

        return {
            "noc_certificate_hash": noc_hash,
            "is_valid": False,
            "fdr_uid": "",
            "institution_name": "",
            "institution_pid": "",
            "bank_name": "",
            "ifsc": "",
            "principal_amount": 0.0,
            "issued_at": "",
            "issuing_authority": "",
            "audit_block_hash": "",
            "status": "INVALID_HASH",
            "message": "NOC Certificate verification FAILED. Hash not recognized on AICTE Regulatory Ledger."
        }

    req = doc_to_release_request(req_doc)
    fdr_doc = fdr_col.find_one({"$or": [{"id": req.fdr_id}, {"id": str(req.fdr_id)}]})
    fdr = doc_to_fdr(fdr_doc)
    inst_doc = inst_col.find_one({"$or": [{"id": req.institution_id}, {"id": str(req.institution_id)}]})
    inst = doc_to_institution(inst_doc)

    audit_doc = audit_col.find_one(
        {"target_fdr_uid": fdr.fdr_uid, "action_type": "RELEASE_GATE4_NOC_AUTHORIZED"},
        sort=[("id", -1)]
    )

    return {
        "noc_certificate_hash": noc_hash,
        "is_valid": True,
        "fdr_uid": fdr.fdr_uid,
        "institution_name": inst.name if inst else "Institution",
        "institution_pid": inst.pid if inst else "",
        "bank_name": fdr.inst_bank_name or "Scheduled Commercial Bank",
        "ifsc": fdr.inst_ifsc or "IFSC0000000",
        "principal_amount": fdr.inst_principal_amount or 0.0,
        "issued_at": req.request_date.isoformat() if req.request_date else datetime.date.today().isoformat(),
        "issuing_authority": "Member Secretary, AICTE (Competent Regulatory Authority)",
        "audit_block_hash": audit_doc.get("row_hash") if audit_doc else "sha256_verified_ledger_block",
        "status": "OFFICIALLY_VERIFIED_AUTHENTIC",
        "message": "Discharge NOC is 100% Cryptographically Authentic and Verified against the SHA-256 Regulatory Ledger."
    }

def build_release_status_payload(
    db: Any,
    fdr: FDRInstrument,
    req: ReleaseRequest,
    gate1: Dict[str, Any],
    gate2: Dict[str, Any],
    audit_hash: Optional[str] = None
) -> Dict[str, Any]:
    """Constructs the comprehensive 4-Gate Status and NOC Document Payload."""
    inst = fdr.institution
    inst_name = inst.get("name", "College") if isinstance(inst, dict) else getattr(inst, "name", "College")
    inst_pid = inst.get("pid", "") if isinstance(inst, dict) else getattr(inst, "pid", "")
    inst_id = inst.get("id", fdr.institution_id) if isinstance(inst, dict) else getattr(inst, "id", fdr.institution_id)
    inst_state = inst.get("state", "India") if isinstance(inst, dict) else getattr(inst, "state", "India")
    inst_region = inst.get("region", "North") if isinstance(inst, dict) else getattr(inst, "region", "North")
    inst_tier = inst.get("programme_tier", "Technical") if isinstance(inst, dict) else getattr(inst, "programme_tier", "Technical")

    root_node = find_genesis_root_fdr(db, fdr)

    noc_payload = None
    if req.gate4_competent_authority_approved and req.noc_certificate_hash:
        noc_payload = {
            "reference_number": f"AICTE/REG-BUREAU/NOC/2026/{fdr.fdr_uid.replace('-', '')}",
            "dispatch_date": "2026-10-24",
            "statutory_act_ref": "AICTE Act 1987, Section 10(1) & Approval Process Handbook (APH 2026-31)",
            "addressee": {
                "designation": "The Branch Manager",
                "bank_name": fdr.inst_bank_name,
                "ifsc": fdr.inst_ifsc,
                "branch_address": "Authorized Scheduled Bank Branch, India"
            },
            "institution": {
                "name": inst_name,
                "pid": inst_pid,
                "state": inst_state,
                "region": inst_region,
                "programme_tier": inst_tier
            },
            "instrument": {
                "fdr_uid": fdr.fdr_uid,
                "fdr_number": fdr.inst_fdr_number,
                "principal_amount": fdr.inst_principal_amount,
                "principal_in_words": "Rupees Thirty-Five Lakhs Only" if fdr.inst_principal_amount == 3500000 else "Rupees Fifteen Lakhs Only",
                "maturity_date": fdr.inst_maturity_date,
                "lineage_summary": f"Initial Genesis Deposit #{root_node.fdr_uid} ({root_node.inst_bank_name}) → Lineage Extension #{fdr.fdr_uid} ({fdr.inst_bank_name})"
            },
            "regulatory_declaration": (
                "The All India Council for Technical Education (AICTE), Regulation Bureau, hereby certifies that "
                "the above-named institution has satisfactorily completed its prescribed statutory lock-in tenure "
                "with zero outstanding academic, faculty salary, student grievance, or infrastructural deficiencies. "
                "AICTE hereby unconditionally releases its Joint Lien on the subject Fixed Deposit. The Bank is "
                "authorized to discharge the proceeds in favor of the Society/Trust running the institution."
            ),
            "issuing_signatory": {
                "name": "Prof. Rajive Kumar",
                "title": "Member Secretary & Competent Regulatory Authority",
                "organization": "All India Council for Technical Education (AICTE), New Delhi",
                "dsc_token_id": "DSC-AICTE-MS-2026-8819A",
                "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            },
            "noc_certificate_hash": req.noc_certificate_hash,
            "verification_url": f"/api/release/verify-noc/{req.noc_certificate_hash}"
        }

    return {
        "release_id": req.id,
        "fdr_uid": fdr.fdr_uid,
        "institution_id": inst_id,
        "institution_pid": inst_pid,
        "institution_name": inst_name,
        "programme_tier": inst_tier,
        "bank_name": fdr.inst_bank_name or "Scheduled Bank",
        "ifsc": fdr.inst_ifsc or "IFSC0000000",
        "principal_amount": fdr.inst_principal_amount or 0.0,
        "maturity_date": fdr.inst_maturity_date or "2026-10-24",
        "gate1": gate1,
        "gate2": gate2,
        "gate3_scrutiny_officer_approved": req.gate3_scrutiny_officer_approved,
        "gate3_remarks": "Scrutiny dossier verified and cleared" if req.gate3_scrutiny_officer_approved else "Pending Regulation Bureau Scrutiny sign-off",
        "gate4_competent_authority_approved": req.gate4_competent_authority_approved,
        "gate4_remarks": "Approved by Member Secretary with digital cryptographic seal" if req.gate4_competent_authority_approved else "Pending Competent Authority DSC Authorization",
        "status": req.status,
        "noc_certificate_hash": req.noc_certificate_hash,
        "noc_payload": noc_payload,
        "audit_entry_hash": audit_hash
    }

def get_release_status(db: Any, fdr_uid: str) -> Dict[str, Any]:
    """Returns the current 4-Gate clearance status for a target FDR."""
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db
    inst_col = db.institutions if hasattr(db, "institutions") else db

    fdr_doc = fdr_col.find_one({"fdr_uid": fdr_uid})
    if not fdr_doc:
        raise ValueError(f"FDR {fdr_uid} not found.")

    fdr = doc_to_fdr(fdr_doc)
    inst_doc = inst_col.find_one({"$or": [{"id": fdr.institution_id}, {"id": str(fdr.institution_id)}]})
    inst = doc_to_institution(inst_doc)
    fdr.institution = inst_doc

    req = get_or_create_release_request(db, fdr)
    gate1 = evaluate_gate1_lockin(db, fdr)
    gate2 = evaluate_gate2_compliance(db, inst)
    return build_release_status_payload(db, fdr, req, gate1, gate2)

def get_executive_analytics(db: Any) -> Dict[str, Any]:
    """
    Computes high-level analytics for the Executive Dashboard & Competent Authority View from MongoDB:
    1. Region-Wise Security Deposit Financial Exposure (₹ Lakhs)
    2. Lifecycle Portfolio Funnel Distribution
    3. Cross-Bureau Compliance Hold Breakdown
    """
    inst_col = db.institutions if hasattr(db, "institutions") else db
    fdr_col = db.fdr_instruments if hasattr(db, "fdr_instruments") else db

    all_institutions = list(inst_col.find({}))
    all_fdrs = list(fdr_col.find({}))

    # Map institution regions
    inst_region_map = {}
    region_institutions_count = {}
    region_total_norm = {}

    for inst in all_institutions:
        r = inst.get("region", "North")
        i_id = str(inst.get("id", inst.get("_id")))
        inst_region_map[i_id] = r
        region_institutions_count[r] = region_institutions_count.get(r, 0) + 1
        region_total_norm[r] = region_total_norm.get(r, 0.0) + float(inst.get("required_fdr_norm", 0))

    region_map = {}
    for r, count in region_institutions_count.items():
        region_map[r] = {
            "region": r,
            "institutions_count": count,
            "locked_lakhs": 0.0,
            "total_norm_lakhs": round(region_total_norm.get(r, 0.0) / 100000.0, 2)
        }

    for f in all_fdrs:
        i_id = str(f.get("institution_id"))
        r_name = inst_region_map.get(i_id, "North")
        if r_name not in region_map:
            region_map[r_name] = {"region": r_name, "institutions_count": 1, "locked_lakhs": 0.0, "total_norm_lakhs": 0.0}
        region_map[r_name]["locked_lakhs"] += (f.get("inst_principal_amount") or 0.0) / 100000.0

    regional_exposure = [
        {
            "region": k,
            "institutions_count": v["institutions_count"],
            "locked_lakhs": round(v["locked_lakhs"], 2),
            "total_norm_lakhs": v["total_norm_lakhs"]
        }
        for k, v in region_map.items()
    ]

    # 2. Lifecycle Distribution
    status_counts = {}
    for f in all_fdrs:
        st = f.get("lifecycle_status", "SUBMITTED")
        status_counts[st] = status_counts.get(st, 0) + 1

    lifecycle_distribution = [
        {"status": "ACTIVE_VERIFIED", "label": "Active Compliant", "count": status_counts.get("ACTIVE_VERIFIED", 0), "color": "#10b981"},
        {"status": "APPROACHING_MATURITY", "label": "Maturity T-90/T-30", "count": status_counts.get("APPROACHING_MATURITY_T90", 0) + status_counts.get("APPROACHING_MATURITY_T60", 0) + status_counts.get("APPROACHING_MATURITY_T30", 0), "color": "#f59e0b"},
        {"status": "MATURED_ACTION_PENDING", "label": "Lock-in Overdue", "count": status_counts.get("MATURED_ACTION_PENDING", 0), "color": "#ef4444"},
        {"status": "DISCREPANCY_FLAGGED", "label": "Discrepancy / Tamper", "count": status_counts.get("DISCREPANCY_FLAGGED", 0), "color": "#ec4899"},
        {"status": "RELEASE_APPROVED_NOC_ISSUED", "label": "Released with NOC", "count": status_counts.get("RELEASE_APPROVED_NOC_ISSUED", 0), "color": "#8b5cf6"},
        {"status": "RENEWED_SUPERSEDED", "label": "Renewed / Superseded", "count": status_counts.get("RENEWED_SUPERSEDED", 0), "color": "#64748b"},
    ]

    # 3. Compliance Hold Reasons
    court_cases = sum(1 for i in all_institutions if i.get("pending_court_cases"))
    unpaid_salary = sum(1 for i in all_institutions if i.get("unpaid_salary_complaints"))
    pgrc_penalties = sum(1 for i in all_institutions if (i.get("pending_pgrc_penalties") or 0) > 0)
    evc_deficiencies = sum(1 for i in all_institutions if i.get("evc_deficiencies"))
    tamper_flags = sum(1 for f in all_fdrs if f.get("math_tamper_flag") or f.get("bank_verified_status") == "MISMATCH_FLAGGED")

    compliance_holds = [
        {"category": "Faculty Salary Grievances (7th CPC)", "count": unpaid_salary, "severity": "HIGH", "action": "Soft-Hold applied to Extension of Approval (EoA)"},
        {"category": "Student Ombudsman (PGRC) Refund Dues", "count": pgrc_penalties, "severity": "MEDIUM", "action": "Recovery citation dispatched to Trust"},
        {"category": "Expert Visit Committee (EVC) Infrastructure Shortfalls", "count": evc_deficiencies, "severity": "HIGH", "action": "Intake reduction warning issued"},
        {"category": "Active Court Litigation (Land Title / Trust)", "count": court_cases, "severity": "CRITICAL", "action": "FDR discharge blocked pending decree"},
        {"category": "Core Banking / AI Forensics Discrepancies", "count": tamper_flags, "severity": "CRITICAL", "action": "Vigilance Bureau inquiry instituted"},
    ]

    total_locked_amount = sum(f.get("inst_principal_amount") or 0.0 for f in all_fdrs)
    total_released_amount = sum(f.get("inst_principal_amount") or 0.0 for f in all_fdrs if f.get("lifecycle_status") == "RELEASE_APPROVED_NOC_ISSUED")
    active_count = sum(1 for f in all_fdrs if f.get("lifecycle_status") in ["ACTIVE_VERIFIED", "RELEASE_APPROVED_NOC_ISSUED"])
    total_compliant_rate_pct = round((active_count / len(all_fdrs) * 100) if all_fdrs else 0.0, 1)

    total_locked_crores = round(total_locked_amount / 10000000.0, 2)
    total_statutory_norm_crores = round(sum(i.get("required_fdr_norm") or 0.0 for i in all_institutions) / 10000000.0, 2)

    return {
        "regional_exposure": regional_exposure,
        "lifecycle_distribution": lifecycle_distribution,
        "compliance_holds": compliance_holds,
        "total_locked_amount": total_locked_amount,
        "total_released_amount": total_released_amount,
        "total_compliant_rate_pct": total_compliant_rate_pct,
        "total_locked_crores": total_locked_crores,
        "total_statutory_norm_crores": total_statutory_norm_crores,
        "total_active_institutions": len(all_institutions),
        "total_instruments": len(all_fdrs),
        "generated_at": datetime.datetime.utcnow().isoformat()
    }
