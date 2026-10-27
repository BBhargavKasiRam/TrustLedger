import datetime
from typing import Optional, Dict, Any, List
try:
    from .database import db
    from .models import (
        Institution, FDRInstrument, ReleaseRequest, AuditLog,
        UserRecord, EvaluationScenarioRecord, SystemStateRecord,
        CircularRecord, RBIBankDirectoryRecord
    )
    from .audit_service import record_audit_log, verify_audit_chain
except ImportError:
    from database import db
    from models import (
        Institution, FDRInstrument, ReleaseRequest, AuditLog,
        UserRecord, EvaluationScenarioRecord, SystemStateRecord,
        CircularRecord, RBIBankDirectoryRecord
    )
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
        print("[SEED] Force reset requested. Cleaning old MongoDB records across all collections...")
        target_db.audit_logs.delete_many({})
        target_db.release_requests.delete_many({})
        target_db.fdr_instruments.delete_many({})
        target_db.institutions.delete_many({})
        target_db.users.delete_many({})
        target_db.rbi_ifsc_directory.delete_many({})
        target_db.evaluation_scenarios.delete_many({})
        target_db.system_state.delete_many({})
        target_db.circulars.delete_many({})

    print("[SEED] Seeding 5 Official Role Presets into MongoDB (users)...")
    users_data = [
        UserRecord(
            id=1,
            role="INSTITUTION_NODAL_OFFICER",
            user_id="1-100200301",
            user_name="Dr. Rameshwar Sharma",
            designation="Registrar & Nodal Officer",
            institution_id=1,
            institution_pid="1-100200301",
            institution_name="Apex Institute of Technology, Lucknow",
            label="Apex Institute (Clean Matured ₹35L)",
            icon="🏫"
        ),
        UserRecord(
            id=2,
            role="INSTITUTION_NODAL_OFFICER",
            user_id="1-400500602",
            user_name="Prof. Sneha Deshmukh",
            designation="Finance Officer",
            institution_id=2,
            institution_pid="1-400500602",
            institution_name="Vanguard College of Engineering, Pune",
            label="Vanguard College (PGRC Dues ₹12.5L)",
            icon="🏫"
        ),
        UserRecord(
            id=3,
            role="AICTE_SCRUTINY_OFFICER",
            user_id="officer.rb@aicte-india.org",
            user_name="Er. Amitav Sen",
            designation="Senior Scrutiny Officer, Regulation Bureau",
            department="Regulation & Approval Bureau, AICTE New Delhi",
            label="AICTE Scrutiny Officer (Regulation Desk)",
            icon="🔍"
        ),
        UserRecord(
            id=4,
            role="COMPETENT_AUTHORITY",
            user_id="ms@aicte-india.org",
            user_name="Prof. Rajive Kumar",
            designation="Member Secretary & Competent Authority",
            department="Executive Council, AICTE Headquarters",
            label="Member Secretary / Competent Authority",
            icon="🏛️"
        ),
        UserRecord(
            id=5,
            role="BANK_BRANCH_MANAGER",
            user_id="mgr.pune@sbi.co.in",
            user_name="Mr. Rajesh Khurana",
            designation="Chief Branch Manager",
            bank_name="State Bank of India (IFSC: SBIN0001234)",
            branch_name="Shivaji Nagar Branch, Pune",
            label="SBI Branch Manager (Bank Attestation Portal)",
            icon="🏦"
        )
    ]
    target_db.users.insert_many([u.to_mongo_dict() for u in users_data])

    print("[SEED] Seeding RBI IFSC Banking Directory into MongoDB...")
    rbi_records = [
        RBIBankDirectoryRecord(
            ifsc="CNRB0001234",
            bank_name="Canara Bank",
            branch_name="Hazratganj Branch, Lucknow",
            branch_address="45/B Mahatma Gandhi Marg, Hazratganj, Lucknow, UP - 226001",
            whitelisted_domain="canarabank.com",
            cbs_supported=True,
            mock_cbs_balance=3500000.0,
            mock_lien_status="ACTIVE_JOINT_AICTE"
        ),
        RBIBankDirectoryRecord(
            ifsc="SBIN0001234",
            bank_name="State Bank of India",
            branch_name="Shivaji Nagar Branch, Pune",
            branch_address="F.C. Road, Shivaji Nagar, Pune, MH - 411005",
            whitelisted_domain="sbi.co.in",
            cbs_supported=True,
            mock_cbs_balance=1500000.0,
            mock_lien_status="LOAN_TAKEN_ENCUMBERED"
        ),
        RBIBankDirectoryRecord(
            ifsc="SBIN0000125",
            bank_name="State Bank of India",
            branch_name="Clock Tower Main Branch, Dehradun",
            branch_address="Rajpur Road, Clock Tower, Dehradun, UK - 248001",
            whitelisted_domain="sbi.co.in",
            cbs_supported=True,
            mock_cbs_balance=1500000.0,
            mock_lien_status="ACTIVE_JOINT_AICTE"
        ),
        RBIBankDirectoryRecord(
            ifsc="HDFC0000456",
            bank_name="HDFC Bank",
            branch_name="Banjara Hills Branch, Hyderabad",
            branch_address="Road No. 12, Banjara Hills, Hyderabad, TS - 500034",
            whitelisted_domain="hdfcbank.com",
            cbs_supported=True,
            mock_cbs_balance=1500000.0,
            mock_lien_status="ACTIVE_JOINT_AICTE"
        ),
        RBIBankDirectoryRecord(
            ifsc="PUNB0123400",
            bank_name="Punjab National Bank",
            branch_name="Gomti Nagar Branch, Lucknow",
            branch_address="Vibhuti Khand, Gomti Nagar, Lucknow, UP - 226010",
            whitelisted_domain="pnb.co.in",
            cbs_supported=True,
            mock_cbs_balance=3500000.0,
            mock_lien_status="ACTIVE_JOINT_AICTE"
        )
    ]
    target_db.rbi_ifsc_directory.insert_many([r.to_mongo_dict() for r in rbi_records])

    print("[SEED] Seeding SIH26265 Evaluation Scenarios Check Matrix into MongoDB...")
    scenarios_data = [
        EvaluationScenarioRecord(
            id=1,
            title="New FDR Submission & AI Forensics",
            subtitle="Vision AI OCR extraction, Compound Math ($A=P(1+r/n)^{nt}$), & OpenCV ELA heatmap",
            workflow_target="FORENSICS",
            target_fdr_uid="sample_1",
            description="College uploads scanned FDR certificate. Multimodal OCR, Error Level Analysis (ELA), and compound yield calculation detect tampering.",
            is_verified=True
        ),
        EvaluationScenarioRecord(
            id=2,
            title="Validity Tracking & Central Repository",
            subtitle="Dual-Truth Tri-Party Registry comparing College Claim vs Vision AI vs Bank Truth",
            workflow_target="SCRUTINY_INBOX",
            target_fdr_uid="FDR-2020-205",
            description="Centralized regulatory vault displaying side-by-side College Claim, AI Extracted data, and Bank Confirmed ledger status.",
            is_verified=True
        ),
        EvaluationScenarioRecord(
            id=4,
            title="Renewal/Replacement & DAG Lineage Graph",
            subtitle="Git-style Directed Acyclic Graph tracking 10-year lock-in & Syndicate-to-Canara merger",
            workflow_target="RELEASE_WATCHLIST",
            target_fdr_uid="FDR-2020-205",
            description="Interactive Directed Acyclic Graph tracking parent-child instrument lineage across bank mergers and renewals over a decade.",
            is_verified=True
        ),
        EvaluationScenarioRecord(
            id=5,
            title="Discrepancy Identification & Bank Verification",
            subtitle="Catching ₹20L tampered yield and unmasking secret bank loan encumbrance",
            workflow_target="BANK_GATEWAY",
            target_fdr_uid="FDR-2026-309",
            description="3-tier bank confirmation catching ₹20L maturity fraud and unmasking secret bank loan encumbrance without joint consent.",
            is_verified=True
        ),
        EvaluationScenarioRecord(
            id=6,
            title="Authorized Release & Cryptographic QR NOC",
            subtitle="4-Gate cross-bureau statutory release workflow & bank-verifiable QR Discharge Certificate",
            workflow_target="RELEASE_WATCHLIST",
            target_fdr_uid="FDR-2020-205",
            description="4-Gate statutory clearance verifying tenure and cross-bureau dues before minting a bank-verifiable digital QR Discharge NOC.",
            is_verified=True
        )
    ]
    target_db.evaluation_scenarios.insert_many([s.to_mongo_dict() for s in scenarios_data])

    print("[SEED] Seeding System State into MongoDB...")
    sys_state = SystemStateRecord(
        id=1,
        simulated_system_date=datetime.date.today().strftime("%Y-%m-%d"),
        days_offset=0,
        national_corpus_locked=13500000.0,
        active_institutions_count=4
    )
    target_db.system_state.insert_one(sys_state.to_mongo_dict())

    print("[SEED] Seeding Official AICTE & Ministry Circulars into MongoDB...")
    circulars_data = [
        CircularRecord(
            id="AICTE-APH-2026-31-CLAUSE-2.14",
            reference_no="AICTE/AB/APH/2026-31/01",
            title="Approval Process Handbook (APH 2026-31) — Clause 2.14: Security Deposit Norms & Joint Lien",
            date="15 January 2026",
            category="APH_NORMS",
            summary="Mandatory guidelines regarding statutory fixed deposits for Technical Institutions, minimum lock-in period (8 to 10 years), joint pledge with Member Secretary AICTE, and non-encumbrance declarations.",
            signatory_designation="Member Secretary, AICTE",
            pdf_download_url="/static/circulars/APH_2026_Clause_2.14.pdf",
            badge_text="STATUTORY NORM"
        ),
        CircularRecord(
            id="AICTE-REG-2026-CIRC-088",
            reference_no="AICTE/REG/2026/CIRC-088",
            title="Advisory on Mandatory Banking Attestation via Core Banking System (CBS) APIs & RBI Whitelisted Routing",
            date="20 February 2026",
            category="BANKING_SOP",
            summary="Directives issued to all Scheduled Commercial Banks and AICTE approved technical institutions mandating digital CBS balance attestation and precluding manual scanned branch letters without cryptographic validation.",
            signatory_designation="Adviser-I (Regulation Bureau), AICTE",
            pdf_download_url="/static/circulars/AICTE_Circular_088_CBS_Attestation.pdf",
            badge_text="BANKING ADVISORY"
        ),
        CircularRecord(
            id="AICTE-FIN-2026-SOP-4GATE",
            reference_no="AICTE/FIN/2026/SOP-RELEASE",
            title="Standard Operating Procedure (SOP) for 4-Gate Statutory Release, Discharge & Lien Revocation",
            date="10 March 2026",
            category="RELEASE_SOP",
            summary="Comprehensive procedure governing refund of security deposit on completion of approved lock-in tenure. Prescribes real-time check against Student Ombudsman (PGRC) dues, faculty 7th CPC salary complaints, and legal stays.",
            signatory_designation="Director (Finance & Administration), AICTE",
            pdf_download_url="/static/circulars/AICTE_SOP_4Gate_Release.pdf",
            badge_text="OFFICIAL SOP"
        ),
        CircularRecord(
            id="AICTE-LEGAL-2026-NOTIF-77",
            reference_no="AICTE/LEGAL/2026/NOTIF-77",
            title="Gazette Notification — Amalgamation & Lineage Continuity for Pledged Instruments During Public Bank Mergers",
            date="05 April 2026",
            category="LEGAL_GAZETTE",
            summary="Legal mandate ensuring that joint lien rights of AICTE remain unaffected during sovereign bank mergers (e.g., Syndicate Bank into Canara Bank, Allahabad Bank into Indian Bank). Mandates issuance of Lineage Continuation Deeds.",
            signatory_designation="Legal Affairs Cell, Ministry of Education, Govt of India",
            pdf_download_url="/static/circulars/Gazette_Notification_Bank_Mergers_Lineage.pdf",
            badge_text="GAZETTE NOTIFICATION"
        )
    ]
    target_db.circulars.insert_many([c.to_mongo_dict() for c in circulars_data])

    print("[SEED] Seeding 4 Realistic AICTE Institutions into MongoDB...")

    # 1. Apex Institute of Technology, Lucknow (Clean Record, ₹35L Norm)
    inst_apex = Institution(
        id=1,
        pid="1-100200301",
        name="Apex Institute of Technology, Lucknow",
        city="Lucknow",
        state="Uttar Pradesh",
        region="North",
        programme_tier="Engineering_Degree",
        required_fdr_norm=3500000,
        eoa_status="COMPLIANT",
        pending_court_cases=False,
        unpaid_salary_complaints=False,
        pending_pgrc_penalties=0,
        pgrc_penalty_amount=0.0,
        unpaid_salary_cases=0,
        legal_stay_active=False,
        evc_deficiencies=False,
        erp_remarks="All regulatory cell clearances intact."
    )

    # 2. Vanguard College of Engineering, Pune (Non-compliant, fee penalty & unpaid faculty salary)
    inst_vanguard = Institution(
        id=2,
        pid="1-400500602",
        name="Vanguard College of Engineering, Pune",
        city="Pune",
        state="Maharashtra",
        region="West",
        programme_tier="Engineering_Degree",
        required_fdr_norm=3500000,
        eoa_status="SOFT_HOLD_APPLIED",
        pending_court_cases=False,
        unpaid_salary_complaints=True,
        pending_pgrc_penalties=250000,
        pgrc_penalty_amount=250000.0,
        unpaid_salary_cases=3,
        legal_stay_active=False,
        evc_deficiencies=True,
        erp_remarks="Student Ombudsman penalty ₹2.5L and 3 faculty salary grievances pending."
    )

    # 3. Deccan School of Management, Hyderabad (MBA, Clean, ₹15L Norm)
    inst_deccan = Institution(
        id=3,
        pid="1-700800903",
        name="Deccan School of Management, Hyderabad",
        city="Hyderabad",
        state="Telangana",
        region="South",
        programme_tier="MBA_PGDM",
        required_fdr_norm=1500000,
        eoa_status="COMPLIANT",
        pending_court_cases=False,
        unpaid_salary_complaints=False,
        pending_pgrc_penalties=0,
        pgrc_penalty_amount=0.0,
        unpaid_salary_cases=0,
        legal_stay_active=False,
        evc_deficiencies=False,
        erp_remarks="Compliant under APH Chapter IV norms."
    )

    # 4. Shivalik Polytechnic Institute, Dehradun (Diploma, Pending Court Case, ₹15L Norm)
    inst_shivalik = Institution(
        id=4,
        pid="1-900100204",
        name="Shivalik Polytechnic Institute, Dehradun",
        city="Dehradun",
        state="Uttarakhand",
        region="North",
        programme_tier="Diploma",
        required_fdr_norm=1500000,
        eoa_status="SOFT_HOLD_APPLIED",
        pending_court_cases=True,
        unpaid_salary_complaints=False,
        pending_pgrc_penalties=0,
        pgrc_penalty_amount=0.0,
        unpaid_salary_cases=0,
        legal_stay_active=True,
        evc_deficiencies=False,
        erp_remarks="Civil litigation in High Court of Uttarakhand regarding Trust land."
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
        inst_fdr_number="SYN/2016/88319",
        inst_bank_name="Syndicate Bank",
        inst_ifsc="SYNB0008831",
        inst_principal_amount=3500000,
        inst_interest_rate=7.25,
        inst_maturity_amount=7183000,
        inst_issue_date="2016-04-15",
        inst_maturity_date="2020-04-14",
        inst_joint_holder_text="Regional Officer, North Western Regional Office, AICTE & Chairman, Apex Educational Society",
        inst_no_lien_declared=True,
        ocr_fdr_number="SYN/2016/88319",
        ocr_bank_name="Syndicate Bank",
        ocr_ifsc="SYNB0008831",
        ocr_principal_amount=3500000,
        ocr_interest_rate=7.25,
        ocr_maturity_amount=7183000,
        ocr_issue_date="2016-04-15",
        ocr_maturity_date="2020-04-14",
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=7183000,
        math_tamper_flag=False,
        ela_tamper_score=0.05,
        ela_heatmap_path="/static/sample_fdrs/sample_1_ela.jpg",
        phash_string="8f12a3b4c5d6e7f8",
        duplicate_flag=False,
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=3500000,
        bank_confirmed_maturity_date="2020-04-14",
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="cbs.verifier@syndicatebank.in",
        bank_verified_at=datetime.datetime(2020, 4, 15, 10, 0, 0),
        magic_link_token="tok_syn_verified_2020",
        lifecycle_status="RENEWED_SUPERSEDED",
        document_path="/static/sample_fdrs/sample_1_genuine_sbi.jpg"
    )

    today = datetime.date.today()

    # Relative Dates computed dynamically from current system date:
    # 1. Deccan FDR-2018-412: Expires exactly 29 days from today (T-30 Final Notice amber alert)
    deccan_mat_date = (today + datetime.timedelta(days=29)).strftime("%Y-%m-%d")
    deccan_issue_date = (today - datetime.timedelta(days=365 * 8) + datetime.timedelta(days=29)).strftime("%Y-%m-%d")

    # 2. Shivalik FDR-2018-519: Expired 5 days ago ([LAPSED_OVERDUE] red alert & EoA soft-hold)
    shivalik_mat_date = (today - datetime.timedelta(days=5)).strftime("%Y-%m-%d")
    shivalik_issue_date = (today - datetime.timedelta(days=365 * 8) - datetime.timedelta(days=5)).strftime("%Y-%m-%d")

    # 3. Apex Child FDR-2020-205: Matured 10 days ago (10-year lock-in fulfilled, ready for release)
    apex2_mat_date = (today - datetime.timedelta(days=10)).strftime("%Y-%m-%d")

    # 4. Vanguard FDR-2026-309: Active 5-year tampered deposit
    vanguard_issue_date = (today - datetime.timedelta(days=120)).strftime("%Y-%m-%d")
    vanguard_mat_date = (today + datetime.timedelta(days=365 * 5)).strftime("%Y-%m-%d")

    # Node 2: Bank Merger Replacement 2020 in Canara Bank (Amalgamation of Syndicate into Canara)
    fdr_apex_2 = FDRInstrument(
        id=2,
        fdr_uid="FDR-2020-205",
        institution_id=1,
        parent_fdr_id=1,
        relation_type="BANK_MERGER_REPLACEMENT",
        inst_fdr_number="CNRB/2020/99241",
        inst_bank_name="Canara Bank",
        inst_ifsc="CNRB0001234",
        inst_principal_amount=3500000,
        inst_interest_rate=7.40,
        inst_maturity_amount=7850000,
        inst_issue_date="2020-04-15",
        inst_maturity_date=apex2_mat_date,
        inst_joint_holder_text="Member Secretary, AICTE & President, Apex Educational Society",
        inst_no_lien_declared=True,
        ocr_fdr_number="CNRB/2020/99241",
        ocr_bank_name="Canara Bank",
        ocr_ifsc="CNRB0001234",
        ocr_principal_amount=3500000,
        ocr_interest_rate=7.40,
        ocr_maturity_amount=7850000,
        ocr_issue_date="2020-04-15",
        ocr_maturity_date=apex2_mat_date,
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=7850000,
        math_tamper_flag=False,
        ela_tamper_score=0.08,
        ela_heatmap_path="/static/sample_fdrs/sample_1_ela.jpg",
        phash_string="8f12a3b4c5d6e7f9",
        duplicate_flag=False,
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=3500000,
        bank_confirmed_maturity_date=apex2_mat_date,
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="bm.hazratganj@canarabank.com",
        bank_verified_at=datetime.datetime.now() - datetime.timedelta(days=10),
        magic_link_token="tok_canara_verified_2026",
        lifecycle_status="MATURED_ACTION_PENDING",
        document_path="/static/sample_fdrs/sample_1_genuine_sbi.jpg"
    )

    # Scenario 2: Vanguard College Tampered Amount & Hidden Encumbrance
    fdr_vanguard = FDRInstrument(
        id=3,
        fdr_uid="FDR-2026-309",
        institution_id=2,
        parent_fdr_id=None,
        relation_type="INITIAL_DEPOSIT",
        inst_fdr_number="SBI/2026/TAMPERED/902",
        inst_bank_name="State Bank of India",
        inst_ifsc="SBIN0001234",
        inst_principal_amount=3500000,
        inst_interest_rate=7.50,
        inst_maturity_amount=4987000,
        inst_issue_date=vanguard_issue_date,
        inst_maturity_date=vanguard_mat_date,
        inst_joint_holder_text="Regional Officer, AICTE Western Region & Secretary, Vanguard Society",
        inst_no_lien_declared=True,
        ocr_fdr_number="SBI/2026/TAMPERED/902",
        ocr_bank_name="State Bank of India",
        ocr_ifsc="SBIN0001234",
        ocr_principal_amount=3500000,
        ocr_interest_rate=7.50,
        ocr_maturity_amount=4987000,
        ocr_issue_date=vanguard_issue_date,
        ocr_maturity_date=vanguard_mat_date,
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=2171500,
        math_tamper_flag=True,
        ela_tamper_score=0.87,
        ela_heatmap_path="/static/sample_fdrs/sample_2_ela.jpg",
        phash_string="1a2b3c4d5e6f7a8b",
        duplicate_flag=False,
        bank_verified_status="MISMATCH_FLAGGED",
        bank_confirmed_principal=1500000,
        bank_confirmed_maturity_date=vanguard_mat_date,
        bank_lien_status="LOAN_TAKEN_ENCUMBERED",
        bank_manager_email="mgr.pune@sbi.co.in",
        bank_verified_at=datetime.datetime.now() - datetime.timedelta(days=70),
        magic_link_token="tok_vanguard_fraud_check",
        lifecycle_status="DISCREPANCY_FLAGGED",
        document_path="/static/sample_fdrs/sample_2_tampered_amount.jpg"
    )

    # Scenario 3: Deccan School of Management Approaching Maturity T-30 (Expires in 29 days)
    fdr_deccan = FDRInstrument(
        id=4,
        fdr_uid="FDR-2018-412",
        institution_id=3,
        parent_fdr_id=None,
        relation_type="INITIAL_DEPOSIT",
        inst_fdr_number="HDFC/2018/88412",
        inst_bank_name="HDFC Bank",
        inst_ifsc="HDFC0000456",
        inst_principal_amount=1500000,
        inst_interest_rate=7.00,
        inst_maturity_amount=2602000,
        inst_issue_date=deccan_issue_date,
        inst_maturity_date=deccan_mat_date,
        inst_joint_holder_text="Regional Officer, Southern Region, AICTE & Deccan Educational Trust",
        inst_no_lien_declared=True,
        ocr_fdr_number="HDFC/2018/88412",
        ocr_bank_name="HDFC Bank",
        ocr_ifsc="HDFC0000456",
        ocr_principal_amount=1500000,
        ocr_interest_rate=7.00,
        ocr_maturity_amount=2602000,
        ocr_issue_date=deccan_issue_date,
        ocr_maturity_date=deccan_mat_date,
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=2602000,
        math_tamper_flag=False,
        ela_tamper_score=0.12,
        ela_heatmap_path="/static/sample_fdrs/sample_1_ela.jpg",
        phash_string="9a8b7c6d5e4f3a2b",
        duplicate_flag=False,
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=1500000,
        bank_confirmed_maturity_date=deccan_mat_date,
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="cbs.api@hdfcbank.com",
        bank_verified_at=datetime.datetime.now() - datetime.timedelta(days=20),
        magic_link_token="tok_deccan_verified",
        lifecycle_status="APPROACHING_MATURITY_T30",
        document_path="/static/sample_fdrs/sample_1_genuine_sbi.jpg"
    )

    # Scenario 4: Shivalik Polytechnic Overdue Instrument (Expired 5 days ago)
    fdr_shivalik = FDRInstrument(
        id=5,
        fdr_uid="FDR-2018-519",
        institution_id=4,
        parent_fdr_id=None,
        relation_type="INITIAL_DEPOSIT",
        inst_fdr_number="SBI/2018/SHIV/519",
        inst_bank_name="State Bank of India",
        inst_ifsc="SBIN0000125",
        inst_principal_amount=1500000,
        inst_interest_rate=6.80,
        inst_maturity_amount=2535000,
        inst_issue_date=shivalik_issue_date,
        inst_maturity_date=shivalik_mat_date,
        inst_joint_holder_text="Regional Officer, Northern Regional Office, AICTE & Shivalik Welfare Trust",
        inst_no_lien_declared=True,
        ocr_fdr_number="SBI/2018/SHIV/519",
        ocr_bank_name="State Bank of India",
        ocr_ifsc="SBIN0000125",
        ocr_principal_amount=1500000,
        ocr_interest_rate=6.80,
        ocr_maturity_amount=2535000,
        ocr_issue_date=shivalik_issue_date,
        ocr_maturity_date=shivalik_mat_date,
        ocr_joint_clause_found=True,
        ocr_no_lien_clause_found=True,
        math_expected_maturity=2535000,
        math_tamper_flag=False,
        ela_tamper_score=0.10,
        ela_heatmap_path="/static/sample_fdrs/sample_1_ela.jpg",
        phash_string="3c2b1a4f5e6d7a8b",
        duplicate_flag=False,
        bank_verified_status="VERIFIED_API",
        bank_confirmed_principal=1500000,
        bank_confirmed_maturity_date=shivalik_mat_date,
        bank_lien_status="ACTIVE_JOINT_AICTE",
        bank_manager_email="bm.dehradun@sbi.co.in",
        bank_verified_at=datetime.datetime.now() - datetime.timedelta(days=10),
        magic_link_token="tok_shivalik_verified",
        lifecycle_status="MATURED_ACTION_PENDING",
        document_path="/static/sample_fdrs/sample_1_genuine_sbi.jpg"
    )

    target_db.fdr_instruments.insert_many([
        fdr_apex_1.to_mongo_dict(),
        fdr_apex_2.to_mongo_dict(),
        fdr_vanguard.to_mongo_dict(),
        fdr_deccan.to_mongo_dict(),
        fdr_shivalik.to_mongo_dict()
    ])

    print("[SEED] Seeding 6 Cryptographically Chained SHA-256 Audit Logs in MongoDB...")
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
    print("[SEED] Successfully populated MongoDB across all collections with verified hash chain!")

if __name__ == "__main__":
    seed_database(force=True)
