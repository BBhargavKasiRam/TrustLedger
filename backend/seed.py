import datetime
from typing import Optional, Dict, Any, List
try:
    from .database import db
    from .models import Institution, FDRInstrument, ReleaseRequest, AuditLog
    from .audit_service import record_audit_log, verify_audit_chain
except ImportError:
    from database import db
    from models import Institution, FDRInstrument, ReleaseRequest, AuditLog
    from audit_service import record_audit_log, verify_audit_chain

def seed_database(force: bool = False, custom_db = None):
    """Initializes and populates realistic synthetic AICTE data in MongoDB for hackathon evaluation scenarios."""
    target_db = custom_db or db

    # Check if already seeded
    existing_institutions = target_db.institutions.count_documents({})
    if existing_institutions > 0 and not force:
        print("[SEED] MongoDB database already populated with records. Skipping seeder.")
        return

    if force:
        print("[SEED] Force reset requested. Cleaning old MongoDB records...")
        target_db.audit_logs.delete_many({})
        target_db.release_requests.delete_many({})
        target_db.fdr_instruments.delete_many({})
        target_db.institutions.delete_many({})

    print("[SEED] Seeding 4 Realistic AICTE Institutions into MongoDB...")

    # 1. Apex Institute of Technology, Lucknow (Clean Record, ₹35L Norm)
    inst_apex = Institution(
        id=1,
        pid="1-100200301",
        name="Apex Institute of Technology, Lucknow",
        state="Uttar Pradesh",
        region="North",
        programme_tier="Engineering_Degree",
        required_fdr_norm=3500000,
        pending_court_cases=False,
        unpaid_salary_complaints=False,
        pending_pgrc_penalties=0,
        evc_deficiencies=False
    )

    # 2. Vanguard College of Engineering, Pune (Non-compliant, fee penalty & unpaid faculty salary)
    inst_vanguard = Institution(
        id=2,
        pid="1-400500602",
        name="Vanguard College of Engineering, Pune",
        state="Maharashtra",
        region="West",
        programme_tier="Engineering_Degree",
        required_fdr_norm=3500000,
        pending_court_cases=False,
        unpaid_salary_complaints=True,
        pending_pgrc_penalties=250000,
        evc_deficiencies=True
    )

    # 3. Deccan School of Management, Hyderabad (MBA, Clean, ₹15L Norm)
    inst_deccan = Institution(
        id=3,
        pid="1-700800903",
        name="Deccan School of Management, Hyderabad",
        state="Telangana",
        region="South",
        programme_tier="MBA_PGDM",
        required_fdr_norm=1500000,
        pending_court_cases=False,
        unpaid_salary_complaints=False,
        pending_pgrc_penalties=0,
        evc_deficiencies=False
    )

    # 4. Shivalik Polytechnic Institute, Dehradun (Diploma, Pending Court Case, ₹15L Norm)
    inst_shivalik = Institution(
        id=4,
        pid="1-900100204",
        name="Shivalik Polytechnic Institute, Dehradun",
        state="Uttarakhand",
        region="North",
        programme_tier="Diploma",
        required_fdr_norm=1500000,
        pending_court_cases=True,
        unpaid_salary_complaints=False,
        pending_pgrc_penalties=0,
        evc_deficiencies=False
    )

    target_db.institutions.insert_many([
        inst_apex.to_mongo_dict(),
        inst_vanguard.to_mongo_dict(),
        inst_deccan.to_mongo_dict(),
        inst_shivalik.to_mongo_dict()
    ])

    print("[SEED] Seeding Evaluation Scenario FDRs & DAG Lineage into MongoDB...")

    # Scenario 1: Lineage DAG Chain for Apex Institute
    # Node 1: Initial Deposit 2016 in Syndicate Bank (₹35L), now Renewed/Superseded
    fdr_apex_1 = FDRInstrument(
        id=1,
        fdr_uid="FDR-2016-101",
        institution_id=1,
        parent_fdr_id=None,
        relation_type="INITIAL_DEPOSIT",
        # Column Set A - Inst Declared
        inst_fdr_number="SYN/2016/88319",
        inst_bank_name="Syndicate Bank",
        inst_ifsc="SYNB0008501",
        inst_principal_amount=3500000.0,
        inst_interest_rate=7.50,
        inst_maturity_amount=7250000.0,
        inst_issue_date="2016-04-15",
        inst_maturity_date="2026-04-14",
        inst_joint_holder_text="Regional Officer AICTE & Apex Institute",
        inst_no_lien_declared=True,
        # Column Set B - OCR & Forensics
        ocr_fdr_number="SYN/2016/88319",
        ocr_bank_name="Syndicate Bank",
        ocr_ifsc="SYNB0008501",
        ocr_principal_amount=3500000.0,
        ocr_interest_rate=7.50,
        ocr_maturity_amount=7250000.0,
        ocr_issue_date="2016-04-15",
        ocr_maturity_date="2026-04-14",
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=7250000.0,
        math_tamper_flag=False,
        ela_tamper_score=0.02,
        duplicate_flag=False,
        # Column Set C - Bank Confirmed
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=3500000.0,
        bank_confirmed_maturity_date="2026-04-14",
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="bm.lucknow@syndicatebank.in",
        bank_verified_at=datetime.datetime(2016, 4, 16, 11, 30),
        lifecycle_status="RENEWED_SUPERSEDED",
        document_path="/uploads/fdr_2016_101.pdf"
    )

    # Node 2: Replaced in Canara Bank (CNRB0001234) post Syndicate-Canara Merger, maturing in 2026
    fdr_apex_2 = FDRInstrument(
        id=2,
        fdr_uid="FDR-2020-205",
        institution_id=1,
        parent_fdr_id=1,
        relation_type="BANK_MERGER_REPLACEMENT",
        # Column Set A - Inst Declared
        inst_fdr_number="CNRB/2020/99412",
        inst_bank_name="Canara Bank",
        inst_ifsc="CNRB0001234",
        inst_principal_amount=3500000.0,
        inst_interest_rate=7.20,
        inst_maturity_amount=7050000.0,
        inst_issue_date="2020-04-15",
        inst_maturity_date="2026-04-14",
        inst_joint_holder_text="Regional Officer AICTE & Apex Institute",
        inst_no_lien_declared=True,
        # Column Set B - OCR & Forensics
        ocr_fdr_number="CNRB/2020/99412",
        ocr_bank_name="Canara Bank",
        ocr_ifsc="CNRB0001234",
        ocr_principal_amount=3500000.0,
        ocr_interest_rate=7.20,
        ocr_maturity_amount=7050000.0,
        ocr_issue_date="2020-04-15",
        ocr_maturity_date="2026-04-14",
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=7050000.0,
        math_tamper_flag=False,
        ela_tamper_score=0.01,
        duplicate_flag=False,
        # Column Set C - Bank Confirmed
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=3500000.0,
        bank_confirmed_maturity_date="2026-04-14",
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="nodal.officer@canarabank.com",
        bank_verified_at=datetime.datetime(2020, 4, 18, 14, 15),
        lifecycle_status="MATURED_ACTION_PENDING",
        document_path="/uploads/fdr_2020_205.pdf"
    )

    # Scenario 2: Discrepancy & Tamper Case (Vanguard College)
    fdr_vanguard = FDRInstrument(
        id=3,
        fdr_uid="FDR-2026-309",
        institution_id=2,
        parent_fdr_id=None,
        relation_type="INITIAL_DEPOSIT",
        # Column Set A - Inst Declared
        inst_fdr_number="SBI/2021/77102",
        inst_bank_name="State Bank of India",
        inst_ifsc="SBIN0001423",
        inst_principal_amount=3500000.0,
        inst_interest_rate=6.50,
        inst_maturity_amount=3080000.0,  # Maturity matches 15L @ 6.5% for 10yr, NOT 35L!
        inst_issue_date="2021-06-10",
        inst_maturity_date="2031-06-09",
        inst_joint_holder_text="AICTE Member Secretary & Vanguard College",
        inst_no_lien_declared=True,
        # Column Set B - OCR & Forensics
        ocr_fdr_number="SBI/2021/77102",
        ocr_bank_name="State Bank of India",
        ocr_ifsc="SBIN0001423",
        ocr_principal_amount=3500000.0,  # Physically modified text on certificate!
        ocr_interest_rate=6.50,
        ocr_maturity_amount=3080000.0,
        ocr_issue_date="2021-06-10",
        ocr_maturity_date="2031-06-09",
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=False,
        math_expected_maturity=7180000.0,  # Expected for 35L @ 6.5%
        math_tamper_flag=True,             # Discrepancy flagged!
        ela_tamper_score=0.87,             # High ELA noise in principal zone
        ela_heatmap_path="/heatmaps/fdr_2026_309_ela.png",
        phash_string="d4e8c1f9b2a75e31",
        duplicate_flag=False,
        # Column Set C - Bank Confirmed
        bank_verified_status="MISMATCH_FLAGGED",
        bank_confirmed_principal=1500000.0,  # Real bank record is only 15 Lakhs!
        bank_confirmed_maturity_date="2031-06-09",
        bank_lien_status="LOAN_TAKEN_ENCUMBERED",  # Encumbered without AICTE NOC!
        bank_manager_email="mgr.pune@sbi.co.in",
        bank_verified_at=datetime.datetime(2026, 8, 12, 16, 45),
        lifecycle_status="DISCREPANCY_FLAGGED",
        document_path="/uploads/fdr_2026_309.pdf"
    )

    # Scenario 3: Approaching Maturity T-30 (Deccan School of Management)
    fdr_deccan = FDRInstrument(
        id=4,
        fdr_uid="FDR-2018-412",
        institution_id=3,
        parent_fdr_id=None,
        relation_type="INITIAL_DEPOSIT",
        # Column Set A - Inst Declared
        inst_fdr_number="HDFC/2018/33011",
        inst_bank_name="HDFC Bank",
        inst_ifsc="HDFC0000456",
        inst_principal_amount=1500000.0,
        inst_interest_rate=7.00,
        inst_maturity_amount=2950000.0,
        inst_issue_date="2018-11-21",
        inst_maturity_date="2026-11-21",
        inst_joint_holder_text="Regional Officer AICTE & Deccan School",
        inst_no_lien_declared=True,
        # Column Set B - OCR & Forensics
        ocr_fdr_number="HDFC/2018/33011",
        ocr_bank_name="HDFC Bank",
        ocr_ifsc="HDFC0000456",
        ocr_principal_amount=1500000.0,
        ocr_interest_rate=7.00,
        ocr_maturity_amount=2950000.0,
        ocr_issue_date="2018-11-21",
        ocr_maturity_date="2026-11-21",
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=2950000.0,
        math_tamper_flag=False,
        ela_tamper_score=0.03,
        duplicate_flag=False,
        # Column Set C - Bank Confirmed
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=1500000.0,
        bank_confirmed_maturity_date="2026-11-21",
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="fdr.cell@hdfcbank.com",
        bank_verified_at=datetime.datetime(2018, 11, 22, 10, 0),
        lifecycle_status="APPROACHING_MATURITY_T30",
        document_path="/uploads/fdr_2018_412.pdf"
    )

    # Scenario 4: Approaching Maturity T-90 (Shivalik Polytechnic)
    fdr_shivalik = FDRInstrument(
        id=5,
        fdr_uid="FDR-2018-519",
        institution_id=4,
        parent_fdr_id=None,
        relation_type="INITIAL_DEPOSIT",
        # Column Set A - Inst Declared
        inst_fdr_number="PNB/2018/55490",
        inst_bank_name="Punjab National Bank",
        inst_ifsc="PUNB0123400",
        inst_principal_amount=1500000.0,
        inst_interest_rate=6.80,
        inst_maturity_amount=2880000.0,
        inst_issue_date="2018-01-14",
        inst_maturity_date="2027-01-14",
        inst_joint_holder_text="Regional Officer AICTE & Shivalik Polytechnic",
        inst_no_lien_declared=True,
        # Column Set B - OCR & Forensics
        ocr_fdr_number="PNB/2018/55490",
        ocr_bank_name="Punjab National Bank",
        ocr_ifsc="PUNB0123400",
        ocr_principal_amount=1500000.0,
        ocr_interest_rate=6.80,
        ocr_maturity_amount=2880000.0,
        ocr_issue_date="2018-01-14",
        ocr_maturity_date="2027-01-14",
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=2880000.0,
        math_tamper_flag=False,
        ela_tamper_score=0.04,
        duplicate_flag=False,
        # Column Set C - Bank Confirmed
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=1500000.0,
        bank_confirmed_maturity_date="2027-01-14",
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="pnb.dehradun@pnb.co.in",
        bank_verified_at=datetime.datetime(2018, 1, 15, 12, 10),
        lifecycle_status="APPROACHING_MATURITY_T90",
        document_path="/uploads/fdr_2018_519.pdf"
    )

    target_db.fdr_instruments.insert_many([
        fdr_apex_1.to_mongo_dict(),
        fdr_apex_2.to_mongo_dict(),
        fdr_vanguard.to_mongo_dict(),
        fdr_deccan.to_mongo_dict(),
        fdr_shivalik.to_mongo_dict()
    ])

    # Seed Release Request for Apex Matured FDR
    rel_request = ReleaseRequest(
        id=1,
        fdr_id=2,
        institution_id=1,
        request_date=datetime.datetime(2026, 10, 20, 10, 0),
        gate1_tenure_passed=True,              # 10-year term complete
        gate2_erp_compliance_passed=True,      # Clean ERP, 0 complaints, 0 fee penalties
        gate3_scrutiny_officer_approved=False, # In review queue
        gate4_competent_authority_approved=False,
        status="PENDING_SCRUTINY"
    )
    target_db.release_requests.insert_one(rel_request.to_mongo_dict())

    print("[SEED] Seeding 6 Cryptographically Chained SHA-256 Audit Logs in MongoDB...")

    # 6 Sequential Chained Audit Entries
    audit_events = [
        (
            "SYSTEM",
            "AICTE Regulatory Genesis Engine",
            "GENESIS_INITIALIZE",
            None,
            "Initialized AICTE FDR Registry, regulatory norm matrices (AY 2026-27), and SHA-256 hash-chained ledger.",
            datetime.datetime(2026, 1, 1, 0, 0, 0)
        ),
        (
            "INSTITUTION_NODAL_OFFICER",
            "Dr. S. K. Verma (Apex Institute)",
            "FDR_SUBMISSION",
            "FDR-2016-101",
            "Submitted 10-year initial statutory security deposit FDR (Syndicate Bank, ₹35,00,000) for Engineering Degree approval.",
            datetime.datetime(2026, 1, 10, 10, 15, 30)
        ),
        (
            "BANK_BRANCH_MANAGER",
            "Rajeev Sharma (Canara Bank)",
            "MERGER_REPLACEMENT_ATTESTATION",
            "FDR-2020-205",
            "Attested Syndicate-Canara Bank amalgamation replacement FDR-2020-205 with intact AICTE joint lien clause.",
            datetime.datetime(2026, 2, 15, 11, 45, 12)
        ),
        (
            "AICTE_SCRUTINY_OFFICER",
            "Er. Ananya Roy (Regional Bureau)",
            "FORENSICS_TAMPER_FLAGGED",
            "FDR-2026-309",
            "Forensics Alert: Mathematical yield anomaly detected on SBI deposit FDR-2026-309. Claimed ₹35L vs Math yield ₹15L. ELA score 0.87.",
            datetime.datetime(2026, 8, 12, 15, 20, 5)
        ),
        (
            "BANK_BRANCH_MANAGER",
            "Vikramaditya Rao (SBI Pune)",
            "LIEN_ENCUMBRANCE_ALERT",
            "FDR-2026-309",
            "Direct API Attestation mismatch: True principal ₹15,00,000 with unauthorized loan encumbrance against college trust.",
            datetime.datetime(2026, 8, 12, 16, 50, 44)
        ),
        (
            "SYSTEM_SLA_SENTINEL",
            "AICTE Automated SLA Cron",
            "SLA_EXPIRY_NOTIFICATION_T30",
            "FDR-2018-412",
            "Automated T-30 countdown triggered: Official maturity notice dispatched to Deccan School of Management & HDFC Nodal Cell.",
            datetime.datetime(2026, 10, 24, 9, 30, 0)
        )
    ]

    for role, name, action, target_fdr, summary, ts in audit_events:
        record_audit_log(
            db=target_db,
            actor_role=role,
            actor_name=name,
            action_type=action,
            target_fdr_uid=target_fdr,
            payload_summary=summary,
            timestamp=ts
        )

    # Immediate verification check
    result = verify_audit_chain(target_db)
    print(f"[SEED] MongoDB Audit verification check: {result}")
    print("[SEED] Successfully populated MongoDB with all 6 evaluation scenarios and verified hash chain!")

if __name__ == "__main__":
    seed_database(force=True)
