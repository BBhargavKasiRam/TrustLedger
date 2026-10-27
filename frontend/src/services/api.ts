import axios from 'axios';
import type { 
  Institution, 
  FDRInstrument, 
  DigitalVaultItem,
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
  ExecutiveAnalyticsResponse,
  UserPreset,
  EvaluationScenario,
  SystemState,
  CircularItem,
  RBIBankDirectory
} from '../types';

// Helper function to sanitize any backend URL string
export const cleanUrl = (raw?: string | null): string => {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '')
    .replace(/\/api\/?$/, '');
};

// Dynamically resolve target backend URL with multi-layer fallback:
// 1. Browser localStorage override (set via UI for instant testing on Vercel)
// 2. Vite define injection or Vite envPrefix variables (BACKEND_URL, VITE_BACKEND_URL, API_URL, etc.)
// 3. Fallback to empty string for relative '/api' during local Vite development (proxied to 127.0.0.1:8000)
export const getResolvedBackendUrl = (): string => {
  // Layer 1: LocalStorage manual override
  try {
    const saved = localStorage.getItem('AICTE_FDR_BACKEND_URL');
    if (saved) {
      const clean = cleanUrl(saved);
      if (clean) return clean;
    }
  } catch {
    // Ignore Storage access restrictions
  }

  // Layer 2: Vite environment variables (injected during build on Vercel)
  // @ts-ignore
  const injected = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : '';
  const fromEnv = (
    import.meta.env.BACKEND_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.API_URL ||
    injected ||
    ''
  );

  return cleanUrl(fromEnv);
};

export const setRuntimeBackendUrl = (url: string): void => {
  try {
    const cleaned = cleanUrl(url);
    if (!cleaned) {
      localStorage.removeItem('AICTE_FDR_BACKEND_URL');
    } else {
      localStorage.setItem('AICTE_FDR_BACKEND_URL', cleaned);
    }
  } catch (e) {
    console.warn('Failed to save backend URL to localStorage', e);
  }
};

export const clearRuntimeBackendUrl = (): void => {
  try {
    localStorage.removeItem('AICTE_FDR_BACKEND_URL');
  } catch {}
};

// Active BACKEND_URL and API Base
export const BACKEND_URL = getResolvedBackendUrl();
export const getApiBase = (): string => {
  const backend = getResolvedBackendUrl();
  return backend ? `${backend}/api` : '/api';
};

export const getAssetUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const backend = getResolvedBackendUrl();
  return backend ? `${backend}${cleanPath}` : cleanPath;
};

export const apiClient = axios.create({
  baseURL: getApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout accommodates Render free-tier cold starts
});

// Dynamic request interceptor: ensure the latest resolved baseURL is always used
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBase();
  return config;
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
    const res = await apiClient.post<{ message: string }>('/demo/reset');
    return res.data;
  },

  resetDemoDB: async (): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post<{ status: string; message: string }>('/demo/reset');
    return res.data;
  },

  getUsers: async (): Promise<UserPreset[]> => {
    const res = await apiClient.get<UserPreset[]>('/users');
    return res.data;
  },

  getEvaluationScenarios: async (): Promise<EvaluationScenario[]> => {
    const res = await apiClient.get<EvaluationScenario[]>('/evaluation/scenarios');
    return res.data;
  },

  getSystemState: async (): Promise<SystemState> => {
    const res = await apiClient.get<SystemState>('/system/state');
    return res.data;
  },

  getCirculars: async (): Promise<CircularItem[]> => {
    const res = await apiClient.get<CircularItem[]>('/circulars');
    return res.data;
  },

  getIFSCDirectory: async (): Promise<RBIBankDirectory[]> => {
    const res = await apiClient.get<RBIBankDirectory[]>('/bank/ifsc-directory');
    return res.data;
  },

  getWatchdogAlerts: async (): Promise<TemporalTimeTravelResponse> => {
    const res = await apiClient.get<TemporalTimeTravelResponse>('/watchdog/alerts');
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

  submitFDR: async (payload: FDRSubmitRequest | FormData): Promise<{ message: string; fdr: FDRInstrument; audit_entry_hash: string; documentUrl?: string }> => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const url = isFormData ? '/fdrs/submit-multipart' : '/fdrs/submit';
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
    const res = await apiClient.post<{ message: string; fdr: FDRInstrument; audit_entry_hash: string; documentUrl?: string }>(url, payload, config);
    return res.data;
  },

  submitFDRMultipart: async (formData: FormData): Promise<{ message: string; fdr: FDRInstrument; audit_entry_hash: string; documentUrl?: string }> => {
    const res = await apiClient.post<{ message: string; fdr: FDRInstrument; audit_entry_hash: string; documentUrl?: string }>('/fdrs/submit-multipart', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
  } | FormData): Promise<Tier2AttestationResponse> => {
    if (payload instanceof FormData) {
      const res = await apiClient.post<Tier2AttestationResponse>(
        '/bank/tier2-submit-attestation-multipart',
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data;
    }
    const res = await apiClient.post<Tier2AttestationResponse>('/bank/tier2-submit-attestation', payload);
    return res.data;
  },

  getFDRVault: async (fdrUid: string): Promise<{ fdr_uid: string; vault_count: number; digitalVault: DigitalVaultItem[] }> => {
    const res = await apiClient.get<{ fdr_uid: string; vault_count: number; digitalVault: DigitalVaultItem[] }>(`/fdrs/${fdrUid}/vault`);
    return res.data;
  },

  uploadVaultDocument: async (fdrUid: string, formData: FormData): Promise<{ message: string; vaultItem: DigitalVaultItem }> => {
    const res = await apiClient.post<{ message: string; vaultItem: DigitalVaultItem }>(
      `/fdrs/${fdrUid}/vault-upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
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
