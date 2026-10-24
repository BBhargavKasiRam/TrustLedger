export type UserRole =
  | 'INSTITUTION_NODAL_OFFICER'
  | 'AICTE_SCRUTINY_OFFICER'
  | 'COMPETENT_AUTHORITY'
  | 'BANK_BRANCH_MANAGER';

export interface UserSession {
  role: UserRole;
  userId: string;
  userName: string;
  designation: string;
  department?: string;
  institutionId?: number;
  institutionPid?: string;
  institutionName?: string;
  bankName?: string;
  branchName?: string;
}

export interface Institution {
  id: number;
  pid: string;
  name: string;
  state: string;
  region: string;
  programme_tier: string;
  required_fdr_norm: number;
  pending_court_cases: boolean;
  unpaid_salary_complaints: boolean;
  pending_pgrc_penalties: number;
  evc_deficiencies: boolean;
  created_at?: string;
}

export interface FDRInstrument {
  id: number;
  fdr_uid: string;
  institution_id: number;
  parent_fdr_id: number | null;
  relation_type: string | null;

  // Column Set A - inst_declared
  inst_fdr_number?: string | null;
  inst_bank_name?: string | null;
  inst_ifsc?: string | null;
  inst_principal_amount?: number | null;
  inst_interest_rate?: number | null;
  inst_maturity_amount?: number | null;
  inst_issue_date?: string | null;
  inst_maturity_date?: string | null;
  inst_joint_holder_text?: string | null;
  inst_no_lien_declared: boolean;

  // Column Set B - ocr_extracted
  ocr_fdr_number?: string | null;
  ocr_bank_name?: string | null;
  ocr_ifsc?: string | null;
  ocr_principal_amount?: number | null;
  ocr_interest_rate?: number | null;
  ocr_maturity_amount?: number | null;
  ocr_issue_date?: string | null;
  ocr_maturity_date?: string | null;
  ocr_joint_clause_found: boolean;
  ocr_no_lien_clause_found: boolean;
  math_expected_maturity?: number | null;
  math_tamper_flag: boolean;
  ela_tamper_score?: number | null;
  ela_heatmap_path?: string | null;
  phash_string?: string | null;
  duplicate_flag: boolean;

  // Column Set C - bank_confirmed
  bank_verified_status: string;
  bank_confirmed_principal?: number | null;
  bank_confirmed_maturity_date?: string | null;
  bank_lien_status?: string | null;
  bank_manager_email?: string | null;
  bank_verified_at?: string | null;
  magic_link_token?: string | null;

  // Lifecycle
  lifecycle_status: string;
  document_path?: string | null;
  created_at?: string;
  updated_at?: string;
  institution?: Institution;
}

export interface ReleaseRequest {
  id: number;
  fdr_id: number;
  institution_id: number;
  request_date: string;
  gate1_tenure_passed: boolean;
  gate2_erp_compliance_passed: boolean;
  gate3_scrutiny_officer_approved: boolean;
  gate4_competent_authority_approved: boolean;
  noc_certificate_hash?: string | null;
  status: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  actor_role: string;
  actor_name: string;
  action_type: string;
  target_fdr_uid?: string | null;
  payload_summary: string;
  prev_hash: string;
  row_hash: string;
}

export interface AuditVerifyResponse {
  integrity_verified: boolean;
  total_records: number;
  broken_at_id: number | null;
  latest_block_hash?: string | null;
  message: string;
}

export interface DashboardSummary {
  total_institutions: number;
  total_fdrs: number;
  active_compliant_fdrs: number;
  maturing_action_needed_count: number;
  discrepancy_tamper_count: number;
  release_requests_pending: number;
  total_security_deposit_locked: number;
  audit_chain_verified: boolean;
  simulated_system_date: string;
}

export interface PresetSample {
  id: string;
  name: string;
  institution_name: string;
  institution_id: number;
  expected_scenario: string;
  risk_level: 'LOW_RISK' | 'HIGH_FRAUD' | 'REGULATORY_VIOLATION' | 'DUPLICATE_COLLISION';
  file_url: string;
  fdr_number: string;
  bank_name: string;
  principal_amount: number;
}

export interface ForensicsAnalyzeResponse {
  ocr_data: {
    fdr_number: string;
    bank_name: string;
    ifsc: string;
    principal_amount: number;
    interest_rate: number;
    maturity_amount: number;
    issue_date: string;
    maturity_date: string;
    holder_clause_text: string;
    no_lien_text: string;
    ocr_joint_clause_found: boolean;
    ocr_no_lien_clause_found: boolean;
    ocr_engine?: string;
    is_live_ai?: boolean;
    simulated_ela_score?: number;
    bounding_boxes?: Record<string, [number, number, number, number]>;
  };
  ela_result: {
    ela_score: number;
    heatmap_url: string;
    tamper_detected: boolean;
    highlight_box?: [number, number, number, number] | null;
  };
  math_result: {
    expected_maturity: number;
    math_tamper_flag: boolean;
    variance_pct: number;
    tenure_years: number;
    inferred_principal: number;
    formula: string;
    explanation: string;
  };
  clause_result: {
    required_norm: number;
    principal: number;
    shortfall: number;
    norm_satisfied: boolean;
    joint_clause_valid: boolean;
    no_lien_clause_valid: boolean;
    all_clauses_valid: boolean;
    deficiencies: string[];
  };
  phash_result: {
    duplicate_flag: boolean;
    phash_string: string;
    hamming_distance: number | null;
    matched_fdr_uid: string | null;
    matched_institution_name?: string | null;
    message: string;
  };
  has_discrepancy: boolean;
  recommended_status: string;
  document_path: string;
}

export interface FDRSubmitRequest {
  institution_id: number;
  parent_fdr_id?: number | null;
  relation_type?: string | null;
  inst_fdr_number: string;
  inst_bank_name: string;
  inst_ifsc: string;
  inst_principal_amount: number;
  inst_interest_rate: number;
  inst_maturity_amount: number;
  inst_issue_date: string;
  inst_maturity_date: string;
  inst_joint_holder_text: string;
  inst_no_lien_declared: boolean;
  analysis: ForensicsAnalyzeResponse;
}

// Feature Module 2 Interfaces
export interface IFSCResponse {
  IFSC: string;
  BANK: string;
  BRANCH: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  MICR?: string | null;
  whitelisted_domain: string;
  source: string;
  rtgs?: boolean;
  neft?: boolean;
}

export interface Tier1CBSVerifyResponse {
  fdr_uid: string;
  bank_name: string;
  ifsc?: string | null;
  actual_principal: number;
  declared_principal?: number | null;
  principal_mismatch: boolean;
  actual_maturity_date?: string | null;
  cbs_lien_status: string;
  verdict: string;
  lifecycle_status: string;
  bank_verified_status: string;
  manager_remarks: string;
  gateway_provider: string;
  cryptographic_signature: string;
  audit_entry_hash: string;
  timestamp: string;
}

export interface Tier2MagicLinkResponse {
  fdr_uid: string;
  branch_manager_email: string;
  magic_link_token: string;
  demo_otp: string;
  expected_bank_domain: string;
  is_domain_whitelisted: boolean;
  expires_at: string;
  portal_url: string;
  audit_entry_hash: string;
  message: string;
}

export interface Tier2AttestationResponse {
  fdr_uid: string;
  bank_verified_status: string;
  lifecycle_status: string;
  attested_principal: number;
  attested_maturity_date: string;
  lien_status: string;
  verdict: string;
  manager_remarks: string;
  audit_entry_hash: string;
  timestamp: string;
  message: string;
}

export interface BankFDRSession {
  fdr_uid: string;
  institution_id: number;
  institution_name: string;
  institution_pid: string;
  programme_tier: string;
  inst_fdr_number?: string | null;
  inst_bank_name?: string | null;
  inst_ifsc?: string | null;
  inst_principal_amount?: number | null;
  inst_interest_rate?: number | null;
  inst_maturity_amount?: number | null;
  inst_issue_date?: string | null;
  inst_maturity_date?: string | null;
  inst_joint_holder_text?: string | null;
  inst_no_lien_declared: boolean;
  ocr_principal_amount?: number | null;
  ocr_maturity_amount?: number | null;
  bank_confirmed_principal?: number | null;
  bank_confirmed_maturity_date?: string | null;
  bank_lien_status?: string | null;
  bank_verified_status: string;
  lifecycle_status: string;
  document_path?: string | null;
  magic_link_token?: string | null;
  bank_manager_email?: string | null;
}

// Feature Module 3 Interfaces: Temporal SLA & DAG Lineage
export interface TemporalEscalationNotice {
  fdr_uid: string;
  institution_name: string;
  days_remaining: number;
  old_status: string;
  new_status: string;
  severity: string;
  recipient: string;
  message: string;
  simulated_date: string;
}

export interface TemporalCountdownItem {
  fdr_uid: string;
  institution_name: string;
  bank_name?: string | null;
  principal?: number | null;
  maturity_date: string;
  days_remaining: number;
  status: string;
  severity: string;
  recipient: string;
}

export interface TemporalTimeTravelResponse {
  simulated_date: string;
  days_offset: number;
  total_instruments_scanned: number;
  transitions_triggered: number;
  escalation_notices: TemporalEscalationNotice[];
  countdown_matrix: TemporalCountdownItem[];
}

export interface LineageGraphNode {
  id: string;
  fdr_uid: string;
  db_id: number;
  label: string;
  institution_name: string;
  bank_name: string;
  ifsc: string;
  principal_amount: number;
  interest_rate: number;
  maturity_amount: number;
  issue_date: string;
  maturity_date: string;
  lifecycle_status: string;
  relation_type: string;
  parent_fdr_id: number | null;
  parent_fdr_uid: string | null;
  depth: number;
  is_root: boolean;
  document_path?: string | null;
  audit_hash: string;
}

export interface LineageGraphEdge {
  id: string;
  source: string;
  target: string;
  relation_type: string;
  label: string;
  animated: boolean;
}

export interface LineageGraphResponse {
  nodes: LineageGraphNode[];
  edges: LineageGraphEdge[];
  root_fdr_uid: string;
  institution_id: number;
  institution_name: string;
}

export interface LinkRenewalRequest {
  parent_fdr_uid: string;
  relation_type?: string;
  new_fdr_number?: string;
  new_bank_name?: string;
  new_ifsc?: string;
  new_principal_amount?: number;
  new_interest_rate?: number;
  new_maturity_date?: string;
  new_issue_date?: string;
  renewal_reason?: string;
}

export interface LinkRenewalResponse {
  message: string;
  parent_fdr_uid: string;
  child_fdr_uid: string;
  relation_type: string;
  audit_entry_hash: string;
  new_fdr: FDRInstrument;
}

// Feature Module 4 Interfaces: 4-Gate Release Clearance & QR NOC
export interface Gate1Evaluation {
  passed: boolean;
  tenure_years_completed: number;
  required_tenure_years: number;
  lineage_genesis_fdr_uid: string;
  lineage_genesis_date: string;
  maturity_date: string;
  bank_verified: boolean;
  bank_verified_status: string;
  bank_lien_status: string;
  tenure_completed: boolean;
  lien_clean: boolean;
  remarks: string;
}

export interface Gate2ComplianceItem {
  category: string;
  cleared: boolean;
  details: string;
  dues_amount: number;
}

export interface Gate2Evaluation {
  passed: boolean;
  compliance_items: Gate2ComplianceItem[];
  total_pending_dues: number;
  override_applied: boolean;
  remarks: string;
}

export interface NOCPayload {
  reference_number: string;
  dispatch_date: string;
  statutory_act_ref: string;
  addressee: {
    designation: string;
    bank_name: string;
    ifsc: string;
    branch_address: string;
  };
  institution: {
    name: string;
    pid: string;
    state: string;
    region: string;
    programme_tier: string;
  };
  instrument: {
    fdr_uid: string;
    fdr_number: string;
    principal_amount: number;
    principal_in_words: string;
    maturity_date: string;
    lineage_summary: string;
  };
  regulatory_declaration: string;
  issuing_signatory: {
    name: string;
    title: string;
    organization: string;
    dsc_token_id: string;
    timestamp: string;
  };
  noc_certificate_hash: string;
  verification_url: string;
}

export interface ReleaseStatusResponse {
  release_id: number;
  fdr_uid: string;
  institution_id: number;
  institution_pid: string;
  institution_name: string;
  programme_tier: string;
  bank_name: string;
  ifsc: string;
  principal_amount: number;
  maturity_date: string;
  gate1: Gate1Evaluation;
  gate2: Gate2Evaluation;
  gate3_scrutiny_officer_approved: boolean;
  gate3_remarks?: string | null;
  gate4_competent_authority_approved: boolean;
  gate4_remarks?: string | null;
  status: string;
  noc_certificate_hash?: string | null;
  noc_payload?: NOCPayload | null;
  audit_entry_hash?: string | null;
}

export interface NOCVerificationResponse {
  noc_certificate_hash: string;
  is_valid: boolean;
  fdr_uid: string;
  institution_name: string;
  institution_pid: string;
  bank_name: string;
  ifsc: string;
  principal_amount: number;
  issued_at: string;
  issuing_authority: string;
  audit_block_hash: string;
  status: string;
  message: string;
}

export interface ExecutiveAnalyticsResponse {
  regional_exposure: Array<{
    region: string;
    institutions_count: number;
    locked_lakhs: number;
    total_norm_lakhs: number;
  }>;
  lifecycle_distribution: Array<{
    status: string;
    label: string;
    count: number;
    color: string;
  }>;
  compliance_holds: Array<{
    reason: string;
    count: number;
    severity: string;
    penalty_amount: number;
  }>;
  total_locked_amount: number;
  total_released_amount: number;
  total_compliant_rate_pct: number;
}
