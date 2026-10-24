import datetime
from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class MongoBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class Institution(MongoBaseModel):
    id: Optional[Union[int, str]] = None
    _id: Optional[Any] = None
    pid: str  # AICTE Permanent ID, e.g. 1-492837461
    name: str
    state: str
    region: str  # North, South, West, East
    programme_tier: str  # Engineering_Degree, MBA_PGDM, Diploma
    required_fdr_norm: int  # e.g., 3500000 for Engg, 1500000 for Diploma
    
    # AICTE Regulatory & Compliance Flags
    pending_court_cases: bool = False
    unpaid_salary_complaints: bool = False
    pending_pgrc_penalties: int = 0
    evc_deficiencies: bool = False
    created_at: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.utcnow)

    def to_mongo_dict(self) -> Dict[str, Any]:
        d = self.model_dump()
        if "_id" in d and d["_id"] is None:
            del d["_id"]
        return d


# 3 Sub-objects representing the Dual-Truth structure in MongoDB
class InstDeclaredData(MongoBaseModel):
    fdr_number: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc: Optional[str] = None
    principal_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    maturity_amount: Optional[float] = None
    issue_date: Optional[str] = None
    maturity_date: Optional[str] = None
    joint_holder_text: Optional[str] = None
    no_lien_declared: bool = False


class OcrExtractedData(MongoBaseModel):
    fdr_number: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc: Optional[str] = None
    principal_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    maturity_amount: Optional[float] = None
    issue_date: Optional[str] = None
    maturity_date: Optional[str] = None
    joint_clause_found: bool = False
    no_lien_clause_found: bool = False
    math_expected_maturity: Optional[float] = None
    math_tamper_flag: bool = False
    ela_tamper_score: Optional[float] = None
    ela_heatmap_path: Optional[str] = None
    phash_string: Optional[str] = None
    duplicate_flag: bool = False


class BankConfirmedData(MongoBaseModel):
    verified_status: str = "PENDING"
    principal: Optional[float] = None
    maturity_date: Optional[str] = None
    lien_status: Optional[str] = None
    manager_email: Optional[str] = None
    verified_at: Optional[datetime.datetime] = None
    magic_link_token: Optional[str] = None


class FDRInstrument(MongoBaseModel):
    id: Optional[Union[int, str]] = None
    _id: Optional[Any] = None
    fdr_uid: str  # e.g., FDR-2026-001
    institution_id: Union[int, str]

    # Lineage DAG Fields
    parent_fdr_id: Optional[Union[int, str]] = None
    relation_type: Optional[str] = None  # INITIAL_DEPOSIT, BANK_MERGER_REPLACEMENT, MATURITY_RENEWAL

    # Dual-Truth 3 sub-objects stored natively in MongoDB NoSQL
    inst_declared: InstDeclaredData = Field(default_factory=InstDeclaredData)
    ocr_extracted: OcrExtractedData = Field(default_factory=OcrExtractedData)
    bank_confirmed: BankConfirmedData = Field(default_factory=BankConfirmedData)

    # Flat mirrored fields to guarantee 100% backward-compatibility with frontend queries & views
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

    bank_verified_status: str = "PENDING"
    bank_confirmed_principal: Optional[float] = None
    bank_confirmed_maturity_date: Optional[str] = None
    bank_lien_status: Optional[str] = None
    bank_manager_email: Optional[str] = None
    bank_verified_at: Optional[datetime.datetime] = None
    magic_link_token: Optional[str] = None

    # Lifecycle & Workflow State
    lifecycle_status: str = "SUBMITTED"
    document_path: Optional[str] = None
    created_at: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.utcnow)
    updated_at: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.utcnow)

    # Embedded/attached institution dict for frontend views
    institution: Optional[Dict[str, Any]] = None

    def sync_dual_truth(self):
        """Synchronizes between the 3 sub-objects and the flat fields in both directions."""
        # 1. inst_declared <-> flat fields
        if self.inst_declared:
            if self.inst_fdr_number and not self.inst_declared.fdr_number:
                self.inst_declared.fdr_number = self.inst_fdr_number
            elif self.inst_declared.fdr_number and not self.inst_fdr_number:
                self.inst_fdr_number = self.inst_declared.fdr_number

            if self.inst_bank_name and not self.inst_declared.bank_name:
                self.inst_declared.bank_name = self.inst_bank_name
            elif self.inst_declared.bank_name and not self.inst_bank_name:
                self.inst_bank_name = self.inst_declared.bank_name

            if self.inst_principal_amount is not None and self.inst_declared.principal_amount is None:
                self.inst_declared.principal_amount = self.inst_principal_amount
            elif self.inst_declared.principal_amount is not None and self.inst_principal_amount is None:
                self.inst_principal_amount = self.inst_declared.principal_amount

            if self.inst_interest_rate is not None and self.inst_declared.interest_rate is None:
                self.inst_declared.interest_rate = self.inst_interest_rate
            elif self.inst_declared.interest_rate is not None and self.inst_interest_rate is None:
                self.inst_interest_rate = self.inst_declared.interest_rate

            if self.inst_maturity_amount is not None and self.inst_declared.maturity_amount is None:
                self.inst_declared.maturity_amount = self.inst_maturity_amount
            elif self.inst_declared.maturity_amount is not None and self.inst_maturity_amount is None:
                self.inst_maturity_amount = self.inst_declared.maturity_amount

            if self.inst_issue_date and not self.inst_declared.issue_date:
                self.inst_declared.issue_date = self.inst_issue_date
            elif self.inst_declared.issue_date and not self.inst_issue_date:
                self.inst_issue_date = self.inst_declared.issue_date

            if self.inst_maturity_date and not self.inst_declared.maturity_date:
                self.inst_declared.maturity_date = self.inst_maturity_date
            elif self.inst_declared.maturity_date and not self.inst_maturity_date:
                self.inst_maturity_date = self.inst_declared.maturity_date

            if self.inst_ifsc and not self.inst_declared.ifsc:
                self.inst_declared.ifsc = self.inst_ifsc
            elif self.inst_declared.ifsc and not self.inst_ifsc:
                self.inst_ifsc = self.inst_declared.ifsc

            if self.inst_joint_holder_text and not self.inst_declared.joint_holder_text:
                self.inst_declared.joint_holder_text = self.inst_joint_holder_text
            elif self.inst_declared.joint_holder_text and not self.inst_joint_holder_text:
                self.inst_joint_holder_text = self.inst_declared.joint_holder_text

            self.inst_declared.no_lien_declared = self.inst_no_lien_declared

        # 2. ocr_extracted <-> flat fields
        if self.ocr_extracted:
            if self.ocr_fdr_number and not self.ocr_extracted.fdr_number:
                self.ocr_extracted.fdr_number = self.ocr_fdr_number
            elif self.ocr_extracted.fdr_number and not self.ocr_fdr_number:
                self.ocr_fdr_number = self.ocr_extracted.fdr_number

            if self.ocr_bank_name and not self.ocr_extracted.bank_name:
                self.ocr_extracted.bank_name = self.ocr_bank_name
            elif self.ocr_extracted.bank_name and not self.ocr_bank_name:
                self.ocr_bank_name = self.ocr_extracted.bank_name

            if self.ocr_ifsc and not self.ocr_extracted.ifsc:
                self.ocr_extracted.ifsc = self.ocr_ifsc
            elif self.ocr_extracted.ifsc and not self.ocr_ifsc:
                self.ocr_ifsc = self.ocr_extracted.ifsc

            if self.ocr_principal_amount is not None and self.ocr_extracted.principal_amount is None:
                self.ocr_extracted.principal_amount = self.ocr_principal_amount
            elif self.ocr_extracted.principal_amount is not None and self.ocr_principal_amount is None:
                self.ocr_principal_amount = self.ocr_extracted.principal_amount

            if self.ocr_interest_rate is not None and self.ocr_extracted.interest_rate is None:
                self.ocr_extracted.interest_rate = self.ocr_interest_rate
            elif self.ocr_extracted.interest_rate is not None and self.ocr_interest_rate is None:
                self.ocr_interest_rate = self.ocr_extracted.interest_rate

            if self.ocr_maturity_amount is not None and self.ocr_extracted.maturity_amount is None:
                self.ocr_extracted.maturity_amount = self.ocr_maturity_amount
            elif self.ocr_extracted.maturity_amount is not None and self.ocr_maturity_amount is None:
                self.ocr_maturity_amount = self.ocr_extracted.maturity_amount

            if self.ocr_issue_date and not self.ocr_extracted.issue_date:
                self.ocr_extracted.issue_date = self.ocr_issue_date
            elif self.ocr_extracted.issue_date and not self.ocr_issue_date:
                self.ocr_issue_date = self.ocr_extracted.issue_date

            if self.ocr_maturity_date and not self.ocr_extracted.maturity_date:
                self.ocr_extracted.maturity_date = self.ocr_maturity_date
            elif self.ocr_extracted.maturity_date and not self.ocr_maturity_date:
                self.ocr_maturity_date = self.ocr_extracted.maturity_date

            self.ocr_extracted.joint_clause_found = self.ocr_joint_clause_found
            self.ocr_extracted.no_lien_clause_found = self.ocr_no_lien_clause_found
            self.ocr_extracted.math_expected_maturity = self.math_expected_maturity
            self.ocr_extracted.math_tamper_flag = self.math_tamper_flag
            self.ocr_extracted.ela_tamper_score = self.ela_tamper_score
            self.ocr_extracted.ela_heatmap_path = self.ela_heatmap_path
            self.ocr_extracted.phash_string = self.phash_string
            self.ocr_extracted.duplicate_flag = self.duplicate_flag

        # 3. bank_confirmed <-> flat fields
        if self.bank_confirmed:
            if self.bank_verified_status and self.bank_confirmed.verified_status == "PENDING":
                self.bank_confirmed.verified_status = self.bank_verified_status
            elif self.bank_confirmed.verified_status and not self.bank_verified_status:
                self.bank_verified_status = self.bank_confirmed.verified_status

            if self.bank_confirmed_principal is not None and self.bank_confirmed.principal is None:
                self.bank_confirmed.principal = self.bank_confirmed_principal
            elif self.bank_confirmed.principal is not None and self.bank_confirmed_principal is None:
                self.bank_confirmed_principal = self.bank_confirmed.principal

            if self.bank_confirmed_maturity_date and not self.bank_confirmed.maturity_date:
                self.bank_confirmed.maturity_date = self.bank_confirmed_maturity_date
            elif self.bank_confirmed.maturity_date and not self.bank_confirmed_maturity_date:
                self.bank_confirmed_maturity_date = self.bank_confirmed.maturity_date

            if self.bank_lien_status and not self.bank_confirmed.lien_status:
                self.bank_confirmed.lien_status = self.bank_lien_status
            elif self.bank_confirmed.lien_status and not self.bank_lien_status:
                self.bank_lien_status = self.bank_confirmed.lien_status

            if self.bank_manager_email and not self.bank_confirmed.manager_email:
                self.bank_confirmed.manager_email = self.bank_manager_email
            elif self.bank_confirmed.manager_email and not self.bank_manager_email:
                self.bank_manager_email = self.bank_confirmed.manager_email

            if self.bank_verified_at and not self.bank_confirmed.verified_at:
                self.bank_confirmed.verified_at = self.bank_verified_at
            elif self.bank_confirmed.verified_at and not self.bank_verified_at:
                self.bank_verified_at = self.bank_confirmed.verified_at

            if self.magic_link_token and not self.bank_confirmed.magic_link_token:
                self.bank_confirmed.magic_link_token = self.magic_link_token
            elif self.bank_confirmed.magic_link_token and not self.magic_link_token:
                self.magic_link_token = self.bank_confirmed.magic_link_token

    def to_mongo_dict(self) -> Dict[str, Any]:
        self.sync_dual_truth()
        d = self.model_dump()
        if "_id" in d and d["_id"] is None:
            del d["_id"]
        return d


class ReleaseRequest(MongoBaseModel):
    id: Optional[Union[int, str]] = None
    _id: Optional[Any] = None
    fdr_id: Union[int, str]
    institution_id: Union[int, str]
    request_date: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.utcnow)

    # 4-Gate Clearance Workflow
    gate1_tenure_passed: bool = False
    gate2_erp_compliance_passed: bool = False
    gate3_scrutiny_officer_approved: bool = False
    gate4_competent_authority_approved: bool = False

    noc_certificate_hash: Optional[str] = None
    status: str = "PENDING_SCRUTINY"

    def to_mongo_dict(self) -> Dict[str, Any]:
        d = self.model_dump()
        if "_id" in d and d["_id"] is None:
            del d["_id"]
        return d


class AuditLog(MongoBaseModel):
    id: Optional[Union[int, str]] = None
    _id: Optional[Any] = None
    timestamp: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.utcnow)
    actor_role: str
    actor_name: str
    action_type: str
    target_fdr_uid: Optional[str] = None
    payload_summary: str
    prev_hash: str
    row_hash: str

    def to_mongo_dict(self) -> Dict[str, Any]:
        d = self.model_dump()
        if "_id" in d and d["_id"] is None:
            del d["_id"]
        return d


def doc_to_institution(doc: Optional[Dict[str, Any]]) -> Optional[Institution]:
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        oid = str(d["_id"])
        d["_id"] = oid
        if "id" not in d or d["id"] is None:
            d["id"] = oid
    return Institution(**d)


def doc_to_fdr(doc: Optional[Dict[str, Any]]) -> Optional[FDRInstrument]:
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        oid = str(d["_id"])
        d["_id"] = oid
        if "id" not in d or d["id"] is None:
            d["id"] = oid
    fdr = FDRInstrument(**d)
    fdr.sync_dual_truth()
    return fdr


def doc_to_release_request(doc: Optional[Dict[str, Any]]) -> Optional[ReleaseRequest]:
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        oid = str(d["_id"])
        d["_id"] = oid
        if "id" not in d or d["id"] is None:
            d["id"] = oid
    return ReleaseRequest(**d)


def doc_to_audit_log(doc: Optional[Dict[str, Any]]) -> Optional[AuditLog]:
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        oid = str(d["_id"])
        d["_id"] = oid
        if "id" not in d or d["id"] is None:
            d["id"] = oid
    return AuditLog(**d)
