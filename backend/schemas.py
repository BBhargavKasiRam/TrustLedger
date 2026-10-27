from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

class InstitutionBase(BaseModel):
    pid: str
    name: str
    city: Optional[str] = None
    state: str
    region: str
    programme_tier: str
    required_fdr_norm: int
    eoa_status: str = "COMPLIANT"
    pending_court_cases: bool = False
    unpaid_salary_complaints: bool = False
    pending_pgrc_penalties: int = 0
    evc_deficiencies: bool = False
    pgrc_penalty_amount: float = 0.0
    unpaid_salary_cases: int = 0
    legal_stay_active: bool = False
    erp_remarks: Optional[str] = None

class InstitutionResponse(InstitutionBase):
    id: Union[int, str]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DigitalVaultItemSchema(BaseModel):
    documentType: str
    fileUrl: str
    uploadedBy: str
    timestamp: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class FDRInstrumentResponse(BaseModel):
    id: Union[int, str]
    fdr_uid: str
    institution_id: Union[int, str]
    parent_fdr_id: Optional[Union[int, str]] = None
    relation_type: Optional[str] = None

    # Dual-Truth sub-objects
    inst_declared: Optional[Dict[str, Any]] = None
    ocr_extracted: Optional[Dict[str, Any]] = None
    bank_confirmed: Optional[Dict[str, Any]] = None

    # Column Set A - inst_declared
    inst_fdr_number: Optional[str] = None
    inst_bank_name: Optional[str] = None
    inst_ifsc: Optional[str] = None
    inst_principal_amount: Optional[float] = None
    inst_interest_rate: Optional[float] = None
    inst_maturity_amount: Optional[float] = None
    inst_issue_date: Optional[str] = None
    inst_maturity_date: Optional[str] = None
    inst_joint_holder_text: Optional[str] = None
    inst_no_lien_declared: bool = False

    # Column Set B - ocr_extracted
    ocr_fdr_number: Optional[str] = None
    ocr_bank_name: Optional[str] = None
    ocr_ifsc: Optional[str] = None
    ocr_principal_amount: Optional[float] = None
    ocr_interest_rate: Optional[float] = None
    ocr_maturity_amount: Optional[float] = None
    ocr_issue_date: Optional[str] = None
    ocr_maturity_date: Optional[str] = None
    ocr_joint_clause_found: bool = False
    ocr_no_lien_clause_found: bool = False
    math_expected_maturity: Optional[float] = None
    math_tamper_flag: bool = False
    ela_tamper_score: Optional[float] = None
    ela_heatmap_path: Optional[str] = None
    phash_string: Optional[str] = None
    duplicate_flag: bool = False

    # Column Set C - bank_confirmed
    bank_verified_status: str
    bank_confirmed_principal: Optional[float] = None
    bank_confirmed_maturity_date: Optional[str] = None
    bank_lien_status: Optional[str] = None
    bank_manager_email: Optional[str] = None
    bank_verified_at: Optional[datetime] = None
    magic_link_token: Optional[str] = None

    # Lifecycle & Workflow State
    lifecycle_status: str
    document_path: Optional[str] = None
    documentUrl: Optional[str] = None
    document_url: Optional[str] = None
    digitalVault: List[DigitalVaultItemSchema] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Attached institution info for convenience
    institution: Optional[InstitutionResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ReleaseRequestResponse(BaseModel):
    id: Union[int, str]
    fdr_id: Union[int, str]
    institution_id: Union[int, str]
    request_date: Optional[datetime] = None
    gate1_tenure_passed: bool
    gate2_erp_compliance_passed: bool
    gate3_scrutiny_officer_approved: bool
    gate4_competent_authority_approved: bool
    noc_certificate_hash: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: Union[int, str]
    timestamp: datetime
    actor_role: str
    actor_name: str
    action_type: str
    target_fdr_uid: Optional[str] = None
    payload_summary: str
    prev_hash: str
    row_hash: str

    model_config = ConfigDict(from_attributes=True)

class AuditVerifyResponse(BaseModel):
    integrity_verified: bool
    total_records: int
    broken_at_id: Optional[int] = None
    latest_block_hash: Optional[str] = None
    message: str

class DashboardSummaryResponse(BaseModel):
    total_institutions: int
    total_fdrs: int
    active_compliant_fdrs: int
    maturing_action_needed_count: int
    discrepancy_tamper_count: int
    release_requests_pending: int
    total_security_deposit_locked: float
    audit_chain_verified: bool
    simulated_system_date: str

class PresetSample(BaseModel):
    id: str
    name: str
    institution_name: str
    institution_id: int
    expected_scenario: str
    risk_level: str
    file_url: str
    fdr_number: str
    bank_name: str
    principal_amount: float

class ForensicsAnalyzeResponse(BaseModel):
    ocr_data: Dict[str, Any]
    ela_result: Dict[str, Any]
    math_result: Dict[str, Any]
    clause_result: Dict[str, Any]
    phash_result: Dict[str, Any]
    has_discrepancy: bool
    recommended_status: str
    document_path: str

class FDRSubmitRequest(BaseModel):
    institution_id: int
    parent_fdr_id: Optional[int] = None
    relation_type: Optional[str] = "INITIAL_DEPOSIT"
    
    # Institution self-declaration
    inst_fdr_number: str
    inst_bank_name: str
    inst_ifsc: str
    inst_principal_amount: float
    inst_interest_rate: float
    inst_maturity_amount: float
    inst_issue_date: str
    inst_maturity_date: str
    inst_joint_holder_text: str
    inst_no_lien_declared: bool = True
    documentUrl: Optional[str] = None
    document_url: Optional[str] = None

    # Pre-analyzed forensics scorecard
    analysis: Optional[ForensicsAnalyzeResponse] = None

# Feature Module 2 Schemas
class IFSCResponse(BaseModel):
    IFSC: str
    BANK: str
    BRANCH: str
    ADDRESS: str
    CITY: str
    STATE: str
    MICR: Optional[str] = None
    whitelisted_domain: str
    source: str
    rtgs: Optional[bool] = True
    neft: Optional[bool] = True

class Tier1CBSVerifyResponse(BaseModel):
    fdr_uid: str
    bank_name: str
    ifsc: Optional[str] = None
    actual_principal: float
    declared_principal: Optional[float] = None
    principal_mismatch: bool
    actual_maturity_date: Optional[str] = None
    cbs_lien_status: str
    verdict: str
    lifecycle_status: str
    bank_verified_status: str
    manager_remarks: str
    gateway_provider: str
    cryptographic_signature: str
    audit_entry_hash: str
    timestamp: str

class Tier2MagicLinkRequest(BaseModel):
    branch_manager_email: str

class Tier2MagicLinkResponse(BaseModel):
    fdr_uid: str
    branch_manager_email: str
    magic_link_token: str
    demo_otp: str
    expected_bank_domain: str
    is_domain_whitelisted: bool
    expires_at: str
    portal_url: str
    audit_entry_hash: str
    message: str

class Tier2AttestationRequest(BaseModel):
    fdr_uid: str
    magic_link_token: str
    otp_code: str
    attested_principal: float
    attested_maturity_date: str
    lien_status: str
    manager_remarks: str
    manager_email: Optional[str] = None

class Tier2AttestationResponse(BaseModel):
    fdr_uid: str
    bank_verified_status: str
    lifecycle_status: str
    attested_principal: float
    attested_maturity_date: str
    lien_status: str
    verdict: str
    manager_remarks: str
    audit_entry_hash: str
    timestamp: str
    message: str

# Feature Module 3 Schemas
class TemporalTimeTravelRequest(BaseModel):
    simulated_date: Optional[str] = None
    days_offset: Optional[int] = 0

class TemporalTimeTravelResponse(BaseModel):
    simulated_date: str
    days_offset: int
    total_instruments_scanned: int
    transitions_triggered: int
    escalation_notices: List[Dict[str, Any]]
    countdown_matrix: List[Dict[str, Any]]

class LineageGraphResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    root_fdr_uid: str
    institution_id: Union[int, str]
    institution_name: Optional[str] = ""
    total_generations: Optional[int] = 1

class LinkRenewalRequest(BaseModel):
    parent_fdr_uid: str
    relation_type: Optional[str] = "MATURITY_RENEWAL"
    new_fdr_number: Optional[str] = None
    new_bank_name: Optional[str] = None
    new_ifsc: Optional[str] = None
    new_principal_amount: Optional[float] = None
    new_interest_rate: Optional[float] = None
    new_maturity_date: Optional[str] = None
    new_issue_date: Optional[str] = None
    renewal_reason: Optional[str] = None

class LinkRenewalResponse(BaseModel):
    message: str
    parent_fdr_uid: str
    child_fdr_uid: str
    relation_type: str
    audit_entry_hash: str
    new_fdr: FDRInstrumentResponse

# Feature Module 4 Schemas: 4-Gate Release & QR Discharge NOC
class ReleaseInitiateRequest(BaseModel):
    override_erp_compliance: Optional[bool] = False
    applicant_name: Optional[str] = "Institution Nodal Officer"

class Gate3SignoffRequest(BaseModel):
    officer_name: Optional[str] = "Regional Scrutiny Officer, AICTE"
    scrutiny_remarks: Optional[str] = "4-Gate compliance dossier verified. Statutory lock-in tenure satisfied and ERP clearance confirmed. Recommended for lien release."
    decision: Optional[str] = "RECOMMEND_RELEASE"
    bypass_prerequisites: Optional[bool] = False

class Gate4ApproveRequest(BaseModel):
    authority_name: Optional[str] = "Member Secretary, AICTE"
    digital_signature_pin: Optional[str] = "102026"
    final_remarks: Optional[str] = "Exercising statutory regulatory power under Section 10(1) of AICTE Act. Approved for unconditional discharge and lien release."

class ReleaseStatusResponse(BaseModel):
    release_id: int
    fdr_uid: str
    institution_id: int
    institution_pid: str
    institution_name: str
    programme_tier: str
    bank_name: str
    ifsc: str
    principal_amount: float
    maturity_date: str
    gate1: Dict[str, Any]
    gate2: Dict[str, Any]
    gate3_scrutiny_officer_approved: bool
    gate3_remarks: Optional[str] = None
    gate4_competent_authority_approved: bool
    gate4_remarks: Optional[str] = None
    status: str
    noc_certificate_hash: Optional[str] = None
    noc_payload: Optional[Dict[str, Any]] = None
    audit_entry_hash: Optional[str] = None

class NOCVerificationResponse(BaseModel):
    noc_certificate_hash: str
    is_valid: bool
    fdr_uid: str
    institution_name: str
    institution_pid: str
    bank_name: str
    ifsc: str
    principal_amount: float
    issued_at: str
    issuing_authority: str
    audit_block_hash: str
    status: str
    message: str

class ExecutiveAnalyticsResponse(BaseModel):
    regional_exposure: List[Dict[str, Any]]
    lifecycle_distribution: List[Dict[str, Any]]
    compliance_holds: List[Dict[str, Any]]
    total_locked_amount: float
    total_released_amount: float
    total_compliant_rate_pct: float

class UserResponse(BaseModel):
    id: Union[int, str]
    role: str
    user_id: str
    user_name: str
    designation: str
    department: Optional[str] = None
    institution_id: Optional[Union[int, str]] = None
    institution_pid: Optional[str] = None
    institution_name: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    label: str
    icon: str = "👤"
    model_config = ConfigDict(from_attributes=True)

class EvaluationScenarioResponse(BaseModel):
    id: int
    title: str
    subtitle: str
    workflow_target: str
    target_fdr_uid: Optional[str] = None
    description: str
    is_verified: bool = True
    model_config = ConfigDict(from_attributes=True)

class SystemStateResponse(BaseModel):
    simulated_system_date: str
    days_offset: int
    national_corpus_locked: float
    active_institutions_count: int
    model_config = ConfigDict(from_attributes=True)

class CircularResponse(BaseModel):
    id: str
    reference_no: str
    title: str
    date: str
    category: str
    summary: str
    signatory_designation: str
    pdf_download_url: str
    badge_text: str = "OFFICIAL"
    model_config = ConfigDict(from_attributes=True)

class RBIBankDirectoryResponse(BaseModel):
    ifsc: str
    bank_name: str
    branch_name: str
    branch_address: str
    whitelisted_domain: str
    cbs_supported: bool = True
    mock_cbs_balance: float = 0.0
    mock_lien_status: str = "ACTIVE_JOINT_AICTE"
    model_config = ConfigDict(from_attributes=True)



