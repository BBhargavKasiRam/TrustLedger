import os
import shutil
import uuid
import datetime
from typing import List, Optional, Dict, Any, Union
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import dotenv

# Load .env configuration
_curr_dir = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(_curr_dir, ".env"))
dotenv.load_dotenv(os.path.join(_curr_dir, "..", ".env"))
dotenv.load_dotenv()

try:
    from .database import (
        get_db, db, client, institutions_col, fdr_instruments_col,
        audit_logs_col, release_requests_col, clean_mongo_doc, clean_mongo_docs
    )
    from .models import (
        Institution, FDRInstrument, ReleaseRequest, AuditLog,
        doc_to_fdr, doc_to_institution, doc_to_release_request, doc_to_audit_log
    )
    from .schemas import (
        InstitutionResponse,
        FDRInstrumentResponse,
        ReleaseRequestResponse,
        AuditLogResponse,
        AuditVerifyResponse,
        DashboardSummaryResponse,
        PresetSample,
        ForensicsAnalyzeResponse,
        FDRSubmitRequest,
        IFSCResponse,
        Tier1CBSVerifyResponse,
        Tier2MagicLinkRequest,
        Tier2MagicLinkResponse,
        Tier2AttestationRequest,
        Tier2AttestationResponse,
        TemporalTimeTravelRequest,
        TemporalTimeTravelResponse,
        LineageGraphResponse,
        LinkRenewalRequest,
        LinkRenewalResponse,
        ReleaseInitiateRequest,
        Gate3SignoffRequest,
        Gate4ApproveRequest,
        ReleaseStatusResponse,
        NOCVerificationResponse,
        ExecutiveAnalyticsResponse
    )
    from .audit_service import verify_audit_chain, record_audit_log
    from .seed import seed_database
    from .fdr_generator import generate_all_samples, STATIC_DIR, SAMPLE_FDRS_DIR
    from .forensics_engine import run_full_forensics_pipeline
    from .bank_gateway import (
        lookup_rbi_ifsc,
        run_tier1_cbs_verification,
        generate_tier2_magic_link,
        submit_tier2_bank_attestation
    )
    from .lineage_engine import (
        run_temporal_time_travel,
        build_lineage_graph,
        link_renewal_child_fdr
    )
    from .release_engine import (
        initiate_release_evaluation,
        signoff_gate3_scrutiny,
        approve_gate4_authority,
        verify_discharge_noc,
        get_release_status,
        get_executive_analytics
    )
except ImportError:
    from database import (
        get_db, db, client, institutions_col, fdr_instruments_col,
        audit_logs_col, release_requests_col, clean_mongo_doc, clean_mongo_docs
    )
    from models import (
        Institution, FDRInstrument, ReleaseRequest, AuditLog,
        doc_to_fdr, doc_to_institution, doc_to_release_request, doc_to_audit_log
    )
    from schemas import (
        InstitutionResponse,
        FDRInstrumentResponse,
        ReleaseRequestResponse,
        AuditLogResponse,
        AuditVerifyResponse,
        DashboardSummaryResponse,
        PresetSample,
        ForensicsAnalyzeResponse,
        FDRSubmitRequest,
        IFSCResponse,
        Tier1CBSVerifyResponse,
        Tier2MagicLinkRequest,
        Tier2MagicLinkResponse,
        Tier2AttestationRequest,
        Tier2AttestationResponse,
        TemporalTimeTravelRequest,
        TemporalTimeTravelResponse,
        LineageGraphResponse,
        LinkRenewalRequest,
        LinkRenewalResponse,
        ReleaseInitiateRequest,
        Gate3SignoffRequest,
        Gate4ApproveRequest,
        ReleaseStatusResponse,
        NOCVerificationResponse,
        ExecutiveAnalyticsResponse
    )
    from audit_service import verify_audit_chain, record_audit_log
    from seed import seed_database
    from fdr_generator import generate_all_samples, STATIC_DIR, SAMPLE_FDRS_DIR
    from forensics_engine import run_full_forensics_pipeline
    from bank_gateway import (
        lookup_rbi_ifsc,
        run_tier1_cbs_verification,
        generate_tier2_magic_link,
        submit_tier2_bank_attestation
    )
    from lineage_engine import (
        run_temporal_time_travel,
        build_lineage_graph,
        link_renewal_child_fdr
    )
    from release_engine import (
        initiate_release_evaluation,
        signoff_gate3_scrutiny,
        approve_gate4_authority,
        verify_discharge_noc,
        get_release_status,
        get_executive_analytics
    )

app = FastAPI(
    title="AICTE FDR & Security Deposit Regulatory Portal",
    description="Backend API for Problem Statement SIH26265: Streamline of Security Deposit / FDR Portal for AICTE Regulation Bureau (MongoDB NoSQL Cloud)",
    version="2.0.0"
)

# Enable CORS for frontend Vite dev server (localhost:5173), Vercel deployments, and remote origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount static folder for sample FDR images, ELA heatmaps, and uploaded documents
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.on_event("startup")
def on_startup():
    """Initializes static asset folders, generates synthetic FDRs, and seeds MongoDB database."""
    os.makedirs(STATIC_DIR, exist_ok=True)
    os.makedirs(SAMPLE_FDRS_DIR, exist_ok=True)
    try:
        generate_all_samples()
    except Exception as e:
        print(f"[STARTUP WARNING] Synthetic FDR certificate generation notice: {e}")

    try:
        seed_database(force=False)
        print("[DATABASE] MongoDB connection verified and initialized successfully.")
    except Exception as e:
        print(f"[STARTUP WARNING] MongoDB seeding deferred during startup: {e}")
        print("[STARTUP NOTICE] If running on Render or cloud, ensure '0.0.0.0/0' is whitelisted in MongoDB Atlas Network Access.")

@app.get("/health")
@app.get("/api/health")
def health_check():
    """Health check endpoint for Render / cloud monitoring services."""
    db_status = "CONNECTED"
    details = "Atlas connection operational"
    try:
        client.admin.command("ping")
    except Exception as e:
        db_status = "DISCONNECTED"
        details = str(e)

    return {
        "status": "HEALTHY",
        "service": "TrustLedger AICTE Regulatory Portal",
        "database": db_status,
        "details": details,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.post("/api/admin/seed")
def admin_seed_database(force: bool = False):
    """Admin endpoint to trigger or re-run database seeding on demand."""
    try:
        seed_database(force=force)
        return {"status": "SUCCESS", "message": f"Database seeded successfully (force={force})"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database seeding failed: {str(e)}")

@app.get("/")
def root():
    return {
        "portal": "AICTE Centralized Security Deposit / FDR Portal (National Regulatory Corpus)",
        "regulatory_bureau": "Regulation & Approval Bureau, AICTE New Delhi",
        "statutory_mandate": "Approval Process Handbook (APH 2026-31), Clause 2.14 & Chapter IV Norms",
        "database_backend": "MongoDB Cloud (NoSQL Document Store)",
        "features": [
            "AI Pre-Scrutiny Forensics (OCR, Compound Math Anomaly, OpenCV ELA Heatmap, Perceptual Hash Collision)",
            "3-Tier Bank Verification Gateway (NeSL e-BG / CBS API Webhook, Cryptographic Zero-Login OTP Magic Link, Lead Bank Dashboard)",
            "Temporal SLA Watchdog & Time-Travel Engine (T-90, T-60, T-30, Matured Overdue Automated Notifications)",
            "Git-Style Directed Acyclic Graph (DAG) Lineage Tracker for 10-Year Lock-In & Bank Mergers",
            "4-Gate Statutory Release Engine with QR-Verifiable Discharge NOC",
            "Immutable Cryptographically Chained SHA-256 Audit Ledger"
        ],
        "status": "OPERATIONAL"
    }

@app.get("/api/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Any = Depends(get_db)):
    """Computes high-level KPI metrics from MongoDB for the Executive Regulatory Dashboard."""
    total_institutions = db.institutions.count_documents({})
    total_fdrs = db.fdr_instruments.count_documents({})
    active_compliant_fdrs = db.fdr_instruments.count_documents({
        "lifecycle_status": {
            "$in": [
                "ACTIVE_VERIFIED",
                "APPROACHING_MATURITY_T90",
                "APPROACHING_MATURITY_T60",
                "APPROACHING_MATURITY_T30"
            ]
        }
    })
    maturing_action_needed_count = db.fdr_instruments.count_documents({
        "lifecycle_status": {
            "$in": [
                "APPROACHING_MATURITY_T30",
                "MATURED_ACTION_PENDING"
            ]
        }
    })
    discrepancy_tamper_count = db.fdr_instruments.count_documents({
        "$or": [
            {"lifecycle_status": "DISCREPANCY_FLAGGED"},
            {"math_tamper_flag": True},
            {"bank_verified_status": "MISMATCH_FLAGGED"}
        ]
    })
    release_requests_pending = db.release_requests.count_documents({
        "status": "PENDING_SCRUTINY"
    })

    all_fdrs = list(db.fdr_instruments.find({}))
    total_security_deposit_locked = sum(
        f.get("inst_principal_amount") or 0.0 for f in all_fdrs
    )

    audit_status = verify_audit_chain(db)
    simulated_system_date = datetime.date.today().isoformat()

    return DashboardSummaryResponse(
        total_institutions=total_institutions,
        total_fdrs=total_fdrs,
        active_compliant_fdrs=active_compliant_fdrs,
        maturing_action_needed_count=maturing_action_needed_count,
        discrepancy_tamper_count=discrepancy_tamper_count,
        release_requests_pending=release_requests_pending,
        total_security_deposit_locked=total_security_deposit_locked,
        audit_chain_verified=audit_status["integrity_verified"],
        simulated_system_date=simulated_system_date
    )

@app.get("/api/institutions", response_model=List[InstitutionResponse])
def get_institutions(db: Any = Depends(get_db)):
    """Fetches list of registered AICTE institutions from MongoDB."""
    docs = list(db.institutions.find({}).sort("id", 1))
    return [InstitutionResponse(**clean_mongo_doc(d)) for d in docs]

@app.get("/api/institutions/{institution_id}", response_model=InstitutionResponse)
def get_institution(institution_id: Union[int, str], db: Any = Depends(get_db)):
    """Fetches an individual institution by ID from MongoDB."""
    query = {"$or": [{"id": institution_id}, {"id": str(institution_id)}]}
    try:
        query["$or"].append({"id": int(institution_id)})
    except Exception:
        pass
    doc = db.institutions.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Institution not found")
    return InstitutionResponse(**clean_mongo_doc(doc))

@app.get("/api/fdrs", response_model=List[FDRInstrumentResponse])
def get_fdrs(
    institution_id: Optional[Union[int, str]] = Query(None, description="Filter by Institution ID"),
    status: Optional[str] = Query(None, description="Filter by Lifecycle Status"),
    db: Any = Depends(get_db)
):
    """Fetches FDR instruments from MongoDB with optional institution and lifecycle status filters."""
    query: Dict[str, Any] = {}
    if institution_id is not None:
        try:
            int_id = int(institution_id)
            query["$or"] = [{"institution_id": int_id}, {"institution_id": str(institution_id)}]
        except Exception:
            query["institution_id"] = str(institution_id)
    if status:
        query["lifecycle_status"] = status

    fdr_docs = list(db.fdr_instruments.find(query).sort("id", 1))
    inst_docs = list(db.institutions.find({}))
    inst_map = {str(i.get("id", i.get("_id"))): clean_mongo_doc(i) for i in inst_docs}

    results = []
    for fdr in fdr_docs:
        fdr_clean = clean_mongo_doc(fdr)
        inst_key = str(fdr_clean.get("institution_id"))
        if inst_key in inst_map:
            fdr_clean["institution"] = inst_map[inst_key]
        results.append(FDRInstrumentResponse(**fdr_clean))
    return results

@app.get("/api/fdrs/sample-presets", response_model=List[PresetSample])
def get_sample_presets(db: Any = Depends(get_db)):
    """Returns the 4 generated sample scenarios for 1-click hackathon evaluation from MongoDB."""
    inst_apex = db.institutions.find_one({"pid": "1-100200301"})
    inst_vanguard = db.institutions.find_one({"pid": "1-400500602"})
    inst_deccan = db.institutions.find_one({"pid": "1-700800903"})
    inst_shivalik = db.institutions.find_one({"pid": "1-900100204"})

    return [
        PresetSample(
            id="sample_1",
            name="1. Genuine SBI ₹35L",
            institution_name="Apex Institute of Technology, Lucknow",
            institution_id=inst_apex.get("id", 1) if inst_apex else 1,
            expected_scenario="100% Compliant • Math Verified • AICTE Joint Lien Valid",
            risk_level="LOW_RISK",
            file_url="/static/sample_fdrs/sample_1_genuine_sbi.jpg",
            fdr_number="FDR-2026-881",
            bank_name="State Bank of India",
            principal_amount=3500000.0
        ),
        PresetSample(
            id="sample_2",
            name="2. Tampered Principal ₹15L->₹35L Fraud",
            institution_name="Vanguard College of Engineering, Pune",
            institution_id=inst_vanguard.get("id", 2) if inst_vanguard else 2,
            expected_scenario="Photoshop ELA Tamper Alert (0.89) • Compound Math Discrepancy",
            risk_level="HIGH_FRAUD",
            file_url="/static/sample_fdrs/sample_2_tampered_principal_pune.jpg",
            fdr_number="FDR-2026-992",
            bank_name="State Bank of India",
            principal_amount=3500000.0
        ),
        PresetSample(
            id="sample_3",
            name="3. Missing Joint-AICTE Clause & Shortfall",
            institution_name="Deccan School of Management, Hyderabad",
            institution_id=inst_deccan.get("id", 3) if inst_deccan else 3,
            expected_scenario="₹5L APH Norm Shortfall • Missing Joint Mandate & Lien Clause",
            risk_level="REGULATORY_VIOLATION",
            file_url="/static/sample_fdrs/sample_3_missing_clause_deccan.jpg",
            fdr_number="FDR-2026-774",
            bank_name="HDFC Bank",
            principal_amount=1000000.0
        ),
        PresetSample(
            id="sample_4",
            name="4. Duplicate pHash Scan Attack",
            institution_name="Shivalik Polytechnic Institute, Dehradun",
            institution_id=inst_shivalik.get("id", 4) if inst_shivalik else 4,
            expected_scenario="Perceptual Hash Duplicate Collision with FDR-2026-881",
            risk_level="DUPLICATE_COLLISION",
            file_url="/static/sample_fdrs/sample_4_duplicate_shivalik.jpg",
            fdr_number="FDR-2026-881",
            bank_name="State Bank of India",
            principal_amount=3500000.0
        )
    ]

@app.post("/api/fdrs/analyze-preview", response_model=ForensicsAnalyzeResponse)
async def analyze_fdr_preview(
    institution_id: int = Form(...),
    sample_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Any = Depends(get_db)
):
    """Executes the complete 5-stage AI, Math, and Pixel Forensics pipeline."""
    if sample_id:
        sample_map = {
            "sample_1": "sample_1_genuine_sbi.jpg",
            "sample_2": "sample_2_tampered_principal_pune.jpg",
            "sample_3": "sample_3_missing_clause_deccan.jpg",
            "sample_4": "sample_4_duplicate_shivalik.jpg",
        }
        filename = sample_map.get(sample_id, "sample_1_genuine_sbi.jpg")
        image_path = os.path.join(SAMPLE_FDRS_DIR, filename)
    elif file:
        uploads_dir = os.path.join(STATIC_DIR, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        unique_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        image_path = os.path.join(uploads_dir, unique_name)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    else:
        raise HTTPException(status_code=400, detail="Must provide either sample_id or an uploaded file.")

    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="FDR document file not found.")

    try:
        analysis_result = run_full_forensics_pipeline(
            db=db,
            image_path=image_path,
            institution_id=institution_id,
            sample_id=sample_id
        )
        return ForensicsAnalyzeResponse(**analysis_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensics Pipeline Error: {str(e)}")

@app.post("/api/fdrs/submit")
def submit_fdr(payload: FDRSubmitRequest, db: Any = Depends(get_db)):
    """Ingests, persists in MongoDB with Dual-Truth structure, and commits audit log entry."""
    analysis = payload.analysis
    ocr = analysis.ocr_data
    ela = analysis.ela_result
    math_res = analysis.math_result
    clauses = analysis.clause_result
    phash = analysis.phash_result

    inst_doc = db.institutions.find_one({"$or": [{"id": payload.institution_id}, {"id": str(payload.institution_id)}]})
    if not inst_doc:
        raise HTTPException(status_code=404, detail="Institution not found")
    inst = doc_to_institution(inst_doc)

    total_count = db.fdr_instruments.count_documents({})
    next_id = total_count + 1
    fdr_uid = f"FDR-2026-{100 + next_id}"
    lifecycle_status = "DISCREPANCY_FLAGGED" if analysis.has_discrepancy else "UNDER_SCRUTINY"

    new_fdr = FDRInstrument(
        id=next_id,
        fdr_uid=fdr_uid,
        institution_id=payload.institution_id,
        parent_fdr_id=payload.parent_fdr_id,
        relation_type=payload.relation_type,

        # Column Set A - inst_declared
        inst_fdr_number=payload.inst_fdr_number,
        inst_bank_name=payload.inst_bank_name,
        inst_ifsc=payload.inst_ifsc,
        inst_principal_amount=payload.inst_principal_amount,
        inst_interest_rate=payload.inst_interest_rate,
        inst_maturity_amount=payload.inst_maturity_amount,
        inst_issue_date=payload.inst_issue_date,
        inst_maturity_date=payload.inst_maturity_date,
        inst_joint_holder_text=payload.inst_joint_holder_text,
        inst_no_lien_declared=payload.inst_no_lien_declared,

        # Column Set B - ocr_extracted
        ocr_fdr_number=ocr.get("fdr_number"),
        ocr_bank_name=ocr.get("bank_name"),
        ocr_ifsc=ocr.get("ifsc"),
        ocr_principal_amount=ocr.get("principal_amount"),
        ocr_interest_rate=ocr.get("interest_rate"),
        ocr_maturity_amount=ocr.get("maturity_amount"),
        ocr_issue_date=ocr.get("issue_date"),
        ocr_maturity_date=ocr.get("maturity_date"),
        ocr_joint_clause_found=clauses.get("joint_clause_valid", False),
        ocr_no_lien_clause_found=clauses.get("no_lien_clause_valid", False),
        math_expected_maturity=math_res.get("expected_maturity"),
        math_tamper_flag=math_res.get("math_tamper_flag", False),
        ela_tamper_score=ela.get("ela_score"),
        ela_heatmap_path=ela.get("heatmap_url"),
        phash_string=phash.get("phash_string"),
        duplicate_flag=phash.get("duplicate_flag", False),

        # Column Set C - bank_confirmed initial state
        bank_verified_status="MISMATCH_FLAGGED" if analysis.has_discrepancy else "PENDING",
        bank_confirmed_principal=None,
        bank_confirmed_maturity_date=None,
        bank_lien_status=None,
        bank_manager_email=None,

        # Lifecycle
        lifecycle_status=lifecycle_status,
        document_path=analysis.document_path
    )

    db.fdr_instruments.insert_one(new_fdr.to_mongo_dict())

    action_type = "FORENSICS_DISCREPANCY_FLAGGED" if analysis.has_discrepancy else "FDR_SUBMISSION_SCRUTINY"
    summary_text = (
        f"College submitted FDR {new_fdr.fdr_uid} ({payload.inst_bank_name}, ₹{payload.inst_principal_amount:,.0f}). "
        f"Forensics status: {lifecycle_status}. ELA score: {ela.get('ela_score')}. "
        f"Math tamper: {math_res.get('math_tamper_flag')}. pHash duplicate: {phash.get('duplicate_flag')}."
    )

    audit_entry = record_audit_log(
        db=db,
        actor_role="INSTITUTION_NODAL_OFFICER",
        actor_name=f"Nodal Officer ({inst.name.split(',')[0]})",
        action_type=action_type,
        payload_summary=summary_text,
        target_fdr_uid=new_fdr.fdr_uid
    )

    fdr_clean = clean_mongo_doc(new_fdr.model_dump())
    fdr_clean["institution"] = clean_mongo_doc(inst_doc)

    return {
        "message": f"FDR {new_fdr.fdr_uid} submitted successfully with status {lifecycle_status}.",
        "fdr": fdr_clean,
        "audit_entry_hash": audit_entry.row_hash
    }

# ==============================================================================
# FEATURE MODULE 2: 3-TIER BANK VERIFICATION & MAGIC-LINK ATTESTATION ENDPOINTS
# ==============================================================================

@app.get("/api/bank/ifsc-lookup/{ifsc_code}", response_model=IFSCResponse)
async def get_ifsc_lookup(ifsc_code: str):
    """Fetches branch, address, city and whitelisted email domain from live RBI directory or local directory."""
    result = await lookup_rbi_ifsc(ifsc_code)
    return IFSCResponse(**result)

@app.post("/api/bank/tier1-cbs-verify/{fdr_uid}", response_model=Tier1CBSVerifyResponse)
def verify_tier1_cbs(fdr_uid: str, db: Any = Depends(get_db)):
    """Tier 1: Runs mock NeSL e-BG / Core Banking Webhook handshake to query authoritative bank balance."""
    fdr_doc = db.fdr_instruments.find_one({"fdr_uid": fdr_uid})
    if not fdr_doc:
        raise HTTPException(status_code=404, detail=f"FDR {fdr_uid} not found")
    fdr = doc_to_fdr(fdr_doc)
    result = run_tier1_cbs_verification(db, fdr)
    return Tier1CBSVerifyResponse(**result)

@app.post("/api/bank/tier2-generate-magic-link/{fdr_uid}", response_model=Tier2MagicLinkResponse)
def generate_magic_link(fdr_uid: str, payload: Tier2MagicLinkRequest, db: Any = Depends(get_db)):
    """Tier 2: Generates a signed cryptographic token and demo OTP for Branch Manager verification."""
    fdr_doc = db.fdr_instruments.find_one({"fdr_uid": fdr_uid})
    if not fdr_doc:
        raise HTTPException(status_code=404, detail=f"FDR {fdr_uid} not found")
    fdr = doc_to_fdr(fdr_doc)
    result = generate_tier2_magic_link(db, fdr, payload.branch_manager_email)
    return Tier2MagicLinkResponse(**result)

@app.post("/api/bank/tier2-submit-attestation", response_model=Tier2AttestationResponse)
def submit_bank_attestation(payload: Tier2AttestationRequest, db: Any = Depends(get_db)):
    """Tier 2: Submits branch manager attestation, runs Dual-Truth comparator, and commits to MongoDB."""
    try:
        result = submit_tier2_bank_attestation(
            db=db,
            fdr_uid=payload.fdr_uid,
            magic_link_token=payload.magic_link_token,
            otp_code=payload.otp_code,
            attested_principal=payload.attested_principal,
            attested_maturity_date=payload.attested_maturity_date,
            lien_status=payload.lien_status,
            manager_remarks=payload.manager_remarks,
            manager_email=payload.manager_email
        )
        return Tier2AttestationResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bank/fdr-session/{fdr_uid}")
def get_bank_fdr_session(fdr_uid: str, db: Any = Depends(get_db)):
    """Returns FDR and Institution context for the Zero-Login Bank Portal session from MongoDB."""
    fdr_doc = db.fdr_instruments.find_one({"fdr_uid": fdr_uid})
    if not fdr_doc:
        raise HTTPException(status_code=404, detail=f"FDR {fdr_uid} not found")
    fdr = doc_to_fdr(fdr_doc)
    inst_doc = db.institutions.find_one({"$or": [{"id": fdr.institution_id}, {"id": str(fdr.institution_id)}]})
    inst = doc_to_institution(inst_doc)
    return {
        "fdr_uid": fdr.fdr_uid,
        "institution_id": fdr.institution_id,
        "institution_name": inst.name if inst else "AICTE Enrolled Institution",
        "institution_pid": inst.pid if inst else "1-000000000",
        "programme_tier": inst.programme_tier if inst else "Engineering_Degree",
        "inst_fdr_number": fdr.inst_fdr_number,
        "inst_bank_name": fdr.inst_bank_name,
        "inst_ifsc": fdr.inst_ifsc,
        "inst_principal_amount": fdr.inst_principal_amount,
        "inst_interest_rate": fdr.inst_interest_rate,
        "inst_maturity_amount": fdr.inst_maturity_amount,
        "inst_issue_date": fdr.inst_issue_date,
        "inst_maturity_date": fdr.inst_maturity_date,
        "inst_joint_holder_text": fdr.inst_joint_holder_text,
        "inst_no_lien_declared": fdr.inst_no_lien_declared,
        "ocr_principal_amount": fdr.ocr_principal_amount,
        "ocr_maturity_amount": fdr.ocr_maturity_amount,
        "bank_confirmed_principal": fdr.bank_confirmed_principal,
        "bank_confirmed_maturity_date": fdr.bank_confirmed_maturity_date,
        "bank_lien_status": fdr.bank_lien_status,
        "bank_verified_status": fdr.bank_verified_status,
        "lifecycle_status": fdr.lifecycle_status,
        "document_path": fdr.document_path,
        "magic_link_token": fdr.magic_link_token or f"ml_{uuid.uuid4().hex[:12]}",
        "bank_manager_email": fdr.bank_manager_email or f"bm.{fdr.inst_ifsc[:4].lower()}@bank.gov.in"
    }

# ==============================================================================
# FEATURE MODULE 3: TEMPORAL SLA WATCHDOG & DAG LINEAGE GRAPH
# ==============================================================================

@app.post("/api/temporal/time-travel", response_model=TemporalTimeTravelResponse)
def post_temporal_time_travel(payload: TemporalTimeTravelRequest, db: Any = Depends(get_db)):
    """Interactive SLA Cron Watchdog Simulator: scans FDRs, simulates dates, transitions statuses, generates notices."""
    try:
        result = run_temporal_time_travel(
            db=db,
            simulated_date_str=payload.simulated_date,
            days_offset=payload.days_offset or 0
        )
        return TemporalTimeTravelResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/fdrs/lineage/{fdr_uid}", response_model=LineageGraphResponse)
def get_fdr_lineage(fdr_uid: str, db: Any = Depends(get_db)):
    """Builds full Directed Acyclic Graph (DAG) for the given FDR UID or root parent chain."""
    try:
        graph = build_lineage_graph(db, target_fdr_uid=fdr_uid)
        return LineageGraphResponse(**graph)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/fdrs/lineage-by-institution/{institution_id}", response_model=LineageGraphResponse)
def get_institution_lineage(institution_id: int, db: Any = Depends(get_db)):
    """Builds full Directed Acyclic Graph (DAG) for all FDRs of a given institution."""
    try:
        graph = build_lineage_graph(db, institution_id=institution_id)
        return LineageGraphResponse(**graph)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fdrs/link-renewal", response_model=LinkRenewalResponse)
def post_link_renewal(payload: LinkRenewalRequest, db: Any = Depends(get_db)):
    """Links a new Child FDR in the DAG lineage tree and supersedes the parent FDR in MongoDB."""
    try:
        payload_dict = payload.dict() if hasattr(payload, 'dict') else payload.model_dump()
        result = link_renewal_child_fdr(db, payload.parent_fdr_uid, payload_dict)
        return LinkRenewalResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# FEATURE MODULE 4: 4-GATE RELEASE CLEARANCE & QR DISCHARGE NOC GENERATOR
# ==============================================================================

@app.post("/api/release/initiate/{fdr_uid}", response_model=ReleaseStatusResponse)
def post_initiate_release(fdr_uid: str, payload: ReleaseInitiateRequest = ReleaseInitiateRequest(), db: Any = Depends(get_db)):
    """Initiates 4-Gate Release workflow and executes automated Gate 1 & Gate 2 evaluations in MongoDB."""
    try:
        result = initiate_release_evaluation(
            db=db,
            fdr_uid=fdr_uid,
            override_erp=payload.override_erp_compliance or False,
            applicant_name=payload.applicant_name or "Institution Nodal Officer"
        )
        return ReleaseStatusResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/release/status/{fdr_uid}", response_model=ReleaseStatusResponse)
def get_fdr_release_status(fdr_uid: str, db: Any = Depends(get_db)):
    """Returns the current 4-Gate clearance and NOC issuance status for an FDR."""
    try:
        result = get_release_status(db=db, fdr_uid=fdr_uid)
        return ReleaseStatusResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/release/gate3-scrutiny-signoff/{fdr_uid}", response_model=ReleaseStatusResponse)
def post_gate3_signoff(fdr_uid: str, payload: Gate3SignoffRequest, db: Any = Depends(get_db)):
    """Gate 3: Scrutiny Officer clearance sign-off."""
    try:
        result = signoff_gate3_scrutiny(
            db=db,
            fdr_uid=fdr_uid,
            officer_name=payload.officer_name or "Regional Scrutiny Officer, AICTE",
            remarks=payload.scrutiny_remarks or "Verified and recommended",
            decision=payload.decision or "RECOMMEND_RELEASE",
            bypass_prerequisites=payload.bypass_prerequisites or False
        )
        return ReleaseStatusResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/release/gate4-authority-approve/{fdr_uid}", response_model=ReleaseStatusResponse)
def post_gate4_approve(fdr_uid: str, payload: Gate4ApproveRequest, db: Any = Depends(get_db)):
    """Gate 4: Competent Authority final DSC authorization & Discharge NOC generation."""
    try:
        result = approve_gate4_authority(
            db=db,
            fdr_uid=fdr_uid,
            authority_name=payload.authority_name or "Member Secretary, AICTE",
            pin=payload.digital_signature_pin or "102026",
            remarks=payload.final_remarks or "Approved for release"
        )
        return ReleaseStatusResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/release/verify-noc/{noc_hash}", response_model=NOCVerificationResponse)
def get_verify_noc(noc_hash: str, db: Any = Depends(get_db)):
    """Public / Bank QR verification endpoint for Cryptographic Discharge NOCs."""
    result = verify_discharge_noc(db=db, noc_hash=noc_hash)
    return NOCVerificationResponse(**result)

@app.get("/api/analytics/executive-summary", response_model=ExecutiveAnalyticsResponse)
def get_executive_summary_analytics(db: Any = Depends(get_db)):
    """Aggregated financial exposure, lifecycle health, and compliance hold analytics from MongoDB."""
    try:
        result = get_executive_analytics(db=db)
        return ExecutiveAnalyticsResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================

@app.get("/api/fdrs/{fdr_id}", response_model=FDRInstrumentResponse)
def get_fdr(fdr_id: Union[int, str], db: Any = Depends(get_db)):
    query = {"$or": [{"id": fdr_id}, {"id": str(fdr_id)}]}
    try:
        query["$or"].append({"id": int(fdr_id)})
    except Exception:
        pass
    fdr_doc = db.fdr_instruments.find_one(query)
    if not fdr_doc:
        raise HTTPException(status_code=404, detail="FDR Instrument not found")
    fdr_clean = clean_mongo_doc(fdr_doc)
    inst_doc = db.institutions.find_one({"$or": [{"id": fdr_clean.get("institution_id")}, {"id": str(fdr_clean.get("institution_id"))}]})
    if inst_doc:
        fdr_clean["institution"] = clean_mongo_doc(inst_doc)
    return FDRInstrumentResponse(**fdr_clean)

@app.get("/api/audit", response_model=List[AuditLogResponse])
def get_audit_trail(db: Any = Depends(get_db)):
    """Fetches cryptographically chained SHA-256 audit logs from MongoDB."""
    logs = list(db.audit_logs.find({}).sort("id", 1))
    return [AuditLogResponse(**clean_mongo_doc(l)) for l in logs]

@app.get("/api/audit/verify", response_model=AuditVerifyResponse)
def verify_audit(db: Any = Depends(get_db)):
    """Recalculates every SHA-256 block hash from genesis to head."""
    result = verify_audit_chain(db)
    return AuditVerifyResponse(**result)

@app.post("/api/audit/reset-seed")
def reset_demo_database():
    """Resets MongoDB collections to the clean evaluation seed state."""
    seed_database(force=True)
    generate_all_samples()
    return {"message": "MongoDB database reset to clean evaluation seed state with 6 verified audit blocks."}
