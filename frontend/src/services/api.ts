import axios from 'axios';
import type { 
  Institution, 
  FDRInstrument, 
  AuditLog, 
  AuditVerifyResponse, 
  DashboardSummary,
  PresetSample,
  ForensicsAnalyzeResponse,
  FDRSubmitRequest,
  IFSCResponse,
  Tier1CBSVerifyResponse,
  Tier2MagicLinkResponse,
  Tier2AttestationResponse,
  BankFDRSession,
  TemporalTimeTravelResponse,
  LineageGraphResponse,
  LinkRenewalRequest,
  LinkRenewalResponse,
  ReleaseStatusResponse,
  NOCVerificationResponse,
  ExecutiveAnalyticsResponse
} from '../types';

// Use relative URL so Vite proxy directs to localhost:8000
const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  getInstitutions: async (): Promise<Institution[]> => {
    const res = await apiClient.get<Institution[]>('/institutions');
    return res.data;
  },

  getFdrs: async (params?: { institution_id?: number; status?: string }): Promise<FDRInstrument[]> => {
    const res = await apiClient.get<FDRInstrument[]>('/fdrs', { params });
    return res.data;
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>('/audit');
    return res.data;
  },

  verifyAuditChain: async (): Promise<AuditVerifyResponse> => {
    const res = await apiClient.get<AuditVerifyResponse>('/audit/verify');
    return res.data;
  },

  resetSeedDatabase: async (): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/audit/reset-seed');
    return res.data;
  },

  // Feature Module 1 Endpoints
  getSamplePresets: async (): Promise<PresetSample[]> => {
    const res = await apiClient.get<PresetSample[]>('/fdrs/sample-presets');
    return res.data;
  },

  analyzeFDRPreview: async (formData: FormData): Promise<ForensicsAnalyzeResponse> => {
    const res = await apiClient.post<ForensicsAnalyzeResponse>('/fdrs/analyze-preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  submitFDR: async (payload: FDRSubmitRequest): Promise<{ message: string; fdr: FDRInstrument; audit_entry_hash: string }> => {
    const res = await apiClient.post<{ message: string; fdr: FDRInstrument; audit_entry_hash: string }>('/fdrs/submit', payload);
    return res.data;
  },

  // Feature Module 2 Endpoints (3-Tier Bank Verification & Zero-Login Attestation)
  lookupIFSC: async (ifscCode: string): Promise<IFSCResponse> => {
    const res = await apiClient.get<IFSCResponse>(`/bank/ifsc-lookup/${ifscCode}`);
    return res.data;
  },

  verifyTier1CBS: async (fdrUid: string): Promise<Tier1CBSVerifyResponse> => {
    const res = await apiClient.post<Tier1CBSVerifyResponse>(`/bank/tier1-cbs-verify/${fdrUid}`);
    return res.data;
  },

  generateTier2MagicLink: async (fdrUid: string, email: string): Promise<Tier2MagicLinkResponse> => {
    const res = await apiClient.post<Tier2MagicLinkResponse>(`/bank/tier2-generate-magic-link/${fdrUid}`, {
      branch_manager_email: email,
    });
    return res.data;
  },

  submitTier2Attestation: async (payload: {
    fdr_uid: string;
    magic_link_token: string;
    otp_code: string;
    attested_principal: number;
    attested_maturity_date: string;
    lien_status: string;
    manager_remarks: string;
    manager_email?: string;
  }): Promise<Tier2AttestationResponse> => {
    const res = await apiClient.post<Tier2AttestationResponse>('/bank/tier2-submit-attestation', payload);
    return res.data;
  },

  getBankFDRSession: async (fdrUid: string): Promise<BankFDRSession> => {
    const res = await apiClient.get<BankFDRSession>(`/bank/fdr-session/${fdrUid}`);
    return res.data;
  },

  // Feature Module 3 Endpoints (Temporal SLA Watchdog & DAG Lineage)
  triggerTimeTravel: async (daysOffset: number, simulatedDate?: string): Promise<TemporalTimeTravelResponse> => {
    const res = await apiClient.post<TemporalTimeTravelResponse>('/temporal/time-travel', {
      days_offset: daysOffset,
      simulated_date: simulatedDate,
    });
    return res.data;
  },

  getFDRLineage: async (fdrUid: string): Promise<LineageGraphResponse> => {
    const res = await apiClient.get<LineageGraphResponse>(`/fdrs/lineage/${fdrUid}`);
    return res.data;
  },

  getInstitutionLineage: async (institutionId: number): Promise<LineageGraphResponse> => {
    const res = await apiClient.get<LineageGraphResponse>(`/fdrs/lineage-by-institution/${institutionId}`);
    return res.data;
  },

  linkRenewalChildFDR: async (payload: LinkRenewalRequest): Promise<LinkRenewalResponse> => {
    const res = await apiClient.post<LinkRenewalResponse>('/fdrs/link-renewal', payload);
    return res.data;
  },

  // Feature Module 4 Endpoints (4-Gate Statutory Release & QR NOC)
  initiateRelease: async (fdrUid: string, overrideErp: boolean = false, applicantName?: string): Promise<ReleaseStatusResponse> => {
    const res = await apiClient.post<ReleaseStatusResponse>(`/release/initiate/${fdrUid}`, {
      override_erp_compliance: overrideErp,
      applicant_name: applicantName || 'Institution Nodal Officer'
    });
    return res.data;
  },

  getReleaseStatus: async (fdrUid: string): Promise<ReleaseStatusResponse> => {
    const res = await apiClient.get<ReleaseStatusResponse>(`/release/status/${fdrUid}`);
    return res.data;
  },

  signoffGate3Scrutiny: async (fdrUid: string, payload: {
    officer_name?: string;
    scrutiny_remarks?: string;
    decision?: string;
    bypass_prerequisites?: boolean;
  }): Promise<ReleaseStatusResponse> => {
    const res = await apiClient.post<ReleaseStatusResponse>(`/release/gate3-scrutiny-signoff/${fdrUid}`, payload);
    return res.data;
  },

  approveGate4Authority: async (fdrUid: string, payload: {
    authority_name?: string;
    digital_signature_pin?: string;
    final_remarks?: string;
  }): Promise<ReleaseStatusResponse> => {
    const res = await apiClient.post<ReleaseStatusResponse>(`/release/gate4-authority-approve/${fdrUid}`, payload);
    return res.data;
  },

  verifyNOC: async (nocHash: string): Promise<NOCVerificationResponse> => {
    const res = await apiClient.get<NOCVerificationResponse>(`/release/verify-noc/${nocHash}`);
    return res.data;
  },

  getExecutiveAnalytics: async (): Promise<ExecutiveAnalyticsResponse> => {
    const res = await apiClient.get<ExecutiveAnalyticsResponse>('/analytics/executive-summary');
    return res.data;
  },
};
