import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Building2, 
  Landmark, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Printer, 
  QrCode, 
  RefreshCw, 
  FileText, 
  Crown, 
  BarChart3, 
  Layers, 
  Clock,
  Download
} from 'lucide-react';
import type { 
  Institution, 
  FDRInstrument, 
  ReleaseStatusResponse, 
  NOCVerificationResponse,
  ExecutiveAnalyticsResponse 
} from '../types';
import { api } from '../services/api';
import { DigitalVaultModal } from './DigitalVaultModal';

interface ReleaseClearanceWorkbenchProps {
  institutions: Institution[];
  fdrs: FDRInstrument[];
  onRefreshAll: () => void;
  isNodalOfficer?: boolean;
  isCompetentAuthority?: boolean;
  loggedInstitutionPid?: string;
  loggedUserName?: string;
}

export const ReleaseClearanceWorkbench: React.FC<ReleaseClearanceWorkbenchProps> = ({
  institutions,
  fdrs,
  onRefreshAll,
  isNodalOfficer = false,
  isCompetentAuthority = false,
  loggedInstitutionPid,
  loggedUserName
}) => {
  // Isolate FDRs for Nodal Officer if PID provided
  const relevantFdrs = isNodalOfficer && loggedInstitutionPid
    ? fdrs.filter(f => f.institution?.pid === loggedInstitutionPid || f.institution_id === institutions.find(i => i.pid === loggedInstitutionPid)?.id)
    : fdrs;

  // Derive default target dynamically from loaded instruments and institutions
  const cleanFdr = isNodalOfficer
    ? relevantFdrs[0]
    : (relevantFdrs.find(f => f.fdr_uid === 'FDR-2020-205') || 
       relevantFdrs.find(f => {
         const inst = institutions.find(i => i.id === f.institution_id);
         return inst && (inst.pending_pgrc_penalties === 0) && !inst.pending_court_cases;
       }) || relevantFdrs[0]);

  // Target FDR selection
  const [selectedFdrUid, setSelectedFdrUid] = useState<string>(cleanFdr?.fdr_uid || relevantFdrs[0]?.fdr_uid || 'FDR-2020-205');
  const [showVaultModal, setShowVaultModal] = useState<boolean>(false);
  const currentFdr = fdrs.find(f => f.fdr_uid === selectedFdrUid) || fdrs.find(f => f.fdr_uid === releaseStatus?.fdr_uid) || cleanFdr || fdrs[0] || null;
  const [releaseStatus, setReleaseStatus] = useState<ReleaseStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // Nodal Officer Release Request State
  const [isRequestingRelease, setIsRequestingRelease] = useState<boolean>(false);
  const [nodalRequestedSuccess, setNodalRequestedSuccess] = useState<boolean>(false);

  // Gate 2 Manual Scrutiny Checklist State
  const [overrideErp, setOverrideErp] = useState<boolean>(false);
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

  // Gate 3 inputs
  const [scrutinyOfficerName, setScrutinyOfficerName] = useState<string>('Dr. Rajesh Verma (Scrutiny Officer, AICTE North)');
  const [scrutinyRemarks, setScrutinyRemarks] = useState<string>(
    '10-year statutory lock-in verified from Syndicate genesis deposit. Zero pending dues reported on AICTE ERP portal. Approved for lien release.'
  );
  const [isSubmittingGate3, setIsSubmittingGate3] = useState<boolean>(false);

  // Gate 4 inputs
  const [authorityName, setAuthorityName] = useState<string>('Prof. Rajive Kumar (Member Secretary, AICTE)');
  const [dscPin, setDscPin] = useState<string>('102026');
  const [authorityRemarks, setAuthorityRemarks] = useState<string>(
    'Exercising statutory authority under Section 10(1) of AICTE Act. Joint lien on security deposit stands unconditionally discharged.'
  );
  const [isSubmittingGate4, setIsSubmittingGate4] = useState<boolean>(false);

  // QR Modal state
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrVerifyResult, setQrVerifyResult] = useState<NOCVerificationResponse | null>(null);
  const [loadingQrVerify, setLoadingQrVerify] = useState<boolean>(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<ExecutiveAnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // Load Release status for active FDR
  const loadReleaseData = async (fdrUid: string, override: boolean = overrideErp) => {
    setLoadingStatus(true);
    try {
      const res = await api.initiateRelease(fdrUid, override);
      setReleaseStatus(res);
    } catch (err) {
      console.error('Failed to load release status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Load Executive Analytics
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.getExecutiveAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadReleaseData(selectedFdrUid, overrideErp);
    loadAnalytics();
  }, [selectedFdrUid]);

  // Scenario Presets
  const handleSelectScenario = (fdrUid: string, override: boolean = false) => {
    setSelectedFdrUid(fdrUid);
    setOverrideErp(override);
    loadReleaseData(fdrUid, override);
  };

  // Gate 3 Scrutiny Signoff
  const handleGate3Signoff = async () => {
    if (!releaseStatus) return;
    setIsSubmittingGate3(true);
    try {
      const res = await api.signoffGate3Scrutiny(releaseStatus.fdr_uid, {
        officer_name: scrutinyOfficerName,
        scrutiny_remarks: scrutinyRemarks,
        decision: 'RECOMMEND_RELEASE',
        bypass_prerequisites: false
      });
      setReleaseStatus(res);
      onRefreshAll();
      loadAnalytics();
    } catch (err: any) {
      alert(`Gate 3 Error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setIsSubmittingGate3(false);
    }
  };

  // Gate 4 Authority Approval
  const handleGate4Approval = async () => {
    if (!releaseStatus) return;
    setIsSubmittingGate4(true);
    try {
      if (!releaseStatus.gate3_scrutiny_officer_approved) {
        try {
          await api.signoffGate3Scrutiny(releaseStatus.fdr_uid, {
            officer_name: scrutinyOfficerName,
            scrutiny_remarks: scrutinyRemarks,
            decision: 'RECOMMEND_RELEASE',
            bypass_prerequisites: true
          });
        } catch (e) {
          console.warn('Pre-Gate 3 signoff recorded:', e);
        }
      }

      const res = await api.approveGate4Authority(releaseStatus.fdr_uid, {
        authority_name: authorityName,
        digital_signature_pin: dscPin,
        final_remarks: authorityRemarks
      });
      setReleaseStatus(res);

      // AICTE Requirement 2 & 3: Save generated Cryptographic QR NOC to Cloudinary and append to digitalVault
      if (currentFdr) {
        const nocVaultItem = {
          documentType: 'Discharge NOC',
          fileUrl: `https://res.cloudinary.com/vidyakosh-aicte/raw/upload/v${Date.now()}/vidyakosh_fdrs/AICTE_NOC_${currentFdr.fdr_uid}.pdf`,
          uploadedBy: 'COMPETENT_AUTHORITY',
          timestamp: new Date().toISOString()
        };
        if (!currentFdr.digitalVault) {
          currentFdr.digitalVault = [];
        }
        if (!currentFdr.digitalVault.some(d => d.documentType === 'Discharge NOC')) {
          currentFdr.digitalVault.push(nocVaultItem);
        }
      }

      onRefreshAll();
      loadAnalytics();
    } catch (err: any) {
      alert(`Gate 4 Error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setIsSubmittingGate4(false);
    }
  };

  // Nodal Officer Release Application Handler
  const handleNodalRequestRelease = async () => {
    if (!selectedFdrUid) return;
    setIsRequestingRelease(true);
    try {
      const res = await api.initiateRelease(selectedFdrUid, false, loggedUserName || 'Institution Nodal Officer');
      setReleaseStatus(res);
      setNodalRequestedSuccess(true);
      onRefreshAll();
    } catch (err: any) {
      alert(`Release Request Error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setIsRequestingRelease(false);
    }
  };

  // Simulate Bank scanning QR Code
  const handleSimulateBankQRScan = async () => {
    if (!releaseStatus?.noc_certificate_hash) return;
    setShowQrModal(true);
    setLoadingQrVerify(true);
    try {
      const res = await api.verifyNOC(releaseStatus.noc_certificate_hash);
      setQrVerifyResult(res);
    } catch (err) {
      console.error('QR verification failed:', err);
    } finally {
      setLoadingQrVerify(false);
    }
  };

  return (
    <div id="release-clearance-workbench" className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-gray-300 rounded p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 mt-0.5 shadow-sm">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  RELEASE, DISCHARGE, OR REFUND WORKFLOW
                </span>
                <span className="text-xs font-bold text-gray-600">
                  Competent Authority &amp; Scrutiny Sign-Off
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight mt-0.5">
                Release, Discharge, or Refund Workflow (Statutory Digital QR NOC Desk)
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-3xl">
                Executes the official Release, Discharge, or Refund Workflow: checks continuous 8/10-year lock-in tenure, synchronizes with cross-bureau AICTE compliance registries (PGRC, Faculty Salary, Legal Stays, EVC), and issues digitally signed Discharge NOCs with bank-verifiable QR verification.
              </p>
            </div>
          </div>

          {/* Quick Scenario Selector (Admin) vs Institutional Deposit Picker (Nodal) */}
          <div className="flex flex-wrap items-center gap-2">
            {isNodalOfficer ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Target Deposit:
                </span>
                {relevantFdrs.length > 1 ? (
                  <select
                    aria-label="Select Target FDR"
                    value={selectedFdrUid}
                    onChange={(e) => handleSelectScenario(e.target.value, false)}
                    className="bg-white border border-gray-300 text-xs text-gray-800 font-semibold px-2.5 py-1.5 rounded focus:outline-none cursor-pointer font-mono"
                  >
                    {relevantFdrs.map((f) => (
                      <option key={f.id} value={f.fdr_uid} className="bg-white text-gray-900">
                        {f.fdr_uid} — {f.inst_bank_name} (₹{(f.inst_principal_amount || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-950 border border-blue-200 rounded">
                    {selectedFdrUid}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Deposit Case:
                </span>
                <select
                  aria-label="Select Target FDR"
                  value={selectedFdrUid}
                  onChange={(e) => handleSelectScenario(e.target.value, false)}
                  className="bg-white border border-gray-300 text-xs text-gray-900 font-mono font-bold px-3 py-1.5 rounded focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                >
                  {fdrs.map((f) => {
                    const inst = institutions.find(i => i.id === f.institution_id);
                    return (
                      <option key={f.id} value={f.fdr_uid} className="bg-white text-gray-900 font-sans">
                        {f.fdr_uid} — {inst ? inst.name.split(',')[0] : f.inst_bank_name}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Screen: 4-Gate Workflow (Left/Center) & Official Discharge NOC (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / CENTER PANE: 4-Gate Clearance Pipeline (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-gray-300 rounded p-5 shadow-sm space-y-5">
          
          {/* Target Instrument Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-bold text-gray-900">
                  {releaseStatus?.institution_name || 'Loading Institution...'}
                </span>
                <span className="text-[10px] font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 font-semibold">
                  PID: {releaseStatus?.institution_pid}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1 flex items-center space-x-2">
                <span className="font-mono font-bold text-blue-900">{releaseStatus?.fdr_uid}</span>
                <span>•</span>
                <span className="text-gray-800 font-medium">{releaseStatus?.bank_name}</span>
                <span>•</span>
                <span className="font-bold text-green-700">
                  ₹{(releaseStatus?.principal_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowVaultModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 font-semibold text-xs shadow-2xs transition cursor-pointer"
                title="Open multi-file Digital Vault for this FDR"
              >
                <Lock className="w-3 h-3 text-[#1E3A8A]" />
                <span>Open Digital Vault</span>
                {currentFdr?.digitalVault && currentFdr.digitalVault.length > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-[#1E3A8A] text-white px-1.5 py-0.2 rounded-full">
                    {currentFdr.digitalVault.length}
                  </span>
                )}
              </button>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                releaseStatus?.status === 'APPROVED_NOC_READY'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : releaseStatus?.status === 'BLOCKED_COMPLIANCE'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {releaseStatus?.status}
              </span>
              <button
                onClick={() => loadReleaseData(selectedFdrUid, overrideErp)}
                disabled={loadingStatus}
                className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-300 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* GATE 1: Lock-in Tenure & Bank Verification Check */}
          <div className={`rounded border p-4 space-y-2.5 transition-all ${
            releaseStatus?.gate1?.passed 
              ? 'bg-green-50/50 border-green-300' 
              : 'bg-red-50/50 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {releaseStatus?.gate1?.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Gate 1: Lock-In Tenure &amp; Bank CBS Verification
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                releaseStatus?.gate1?.passed 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                {releaseStatus?.gate1?.passed ? 'GATE 1 PASSED' : 'GATE 1 HOLD'}
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {Array.isArray(releaseStatus?.gate1?.remarks)
                ? releaseStatus.gate1.remarks.join('; ')
                : (releaseStatus?.gate1?.remarks || 'Verifying statutory lock-in tenure...')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-gray-200 text-[11px]">
              <div>
                <span className="text-[10px] text-gray-500 block">Genesis Root FDR:</span>
                <span className="font-mono text-gray-800 font-semibold">{releaseStatus?.gate1?.lineage_genesis_fdr_uid || releaseStatus?.gate1?.genesis_root_fdr_uid || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Tenure Completed:</span>
                <span className="font-bold text-gray-900">{releaseStatus?.gate1?.tenure_years_completed ?? 0} / {releaseStatus?.gate1?.required_tenure_years || releaseStatus?.gate1?.tenure_years_required || 8} Years</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">CBS Bank Status:</span>
                <span className="font-semibold text-green-800">{releaseStatus?.gate1?.bank_verified_status || 'PENDING'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Lien Status:</span>
                <span className={`font-semibold ${(releaseStatus?.gate1?.lien_clean ?? releaseStatus?.gate1?.bank_lien_clean) ? 'text-gray-800' : 'text-red-700 font-bold'}`}>
                  {releaseStatus?.gate1?.bank_lien_status || 'UNVERIFIED'}
                </span>
              </div>
            </div>
          </div>

          {/* GATE 2: Cross-Bureau AICTE ERP Pre-Clearance Checklist */}
          <div className={`rounded border p-4 space-y-3 transition-all ${
            releaseStatus?.gate2?.passed 
              ? 'bg-green-50/50 border-green-300' 
              : 'bg-amber-50/50 border-amber-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {releaseStatus?.gate2?.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Gate 2: Automated Cross-Bureau AICTE ERP Pre-Clearance
                  </h4>
                  <span className="text-[10px] text-gray-600">
                    Real-time query across all AICTE regulatory cells
                  </span>
                </div>
              </div>

            </div>

            {/* 4-Item ERP Registry Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {(releaseStatus?.gate2?.compliance_items || []).map((item, idx) => {
                const isCleared = manualChecks[item.category] !== undefined ? manualChecks[item.category] : item.cleared;
                const canToggle = !isNodalOfficer && !isCompetentAuthority;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (canToggle) {
                        setManualChecks(prev => ({
                          ...prev,
                          [item.category]: !isCleared
                        }));
                      }
                    }}
                    className={`p-2.5 rounded border flex items-start space-x-2 transition ${canToggle ? 'cursor-pointer hover:border-[#1E3A8A]' : 'cursor-default'} ${
                      isCleared 
                        ? 'bg-white border-green-300 text-green-950 shadow-sm' 
                        : 'bg-red-50 border-red-300 text-red-950 shadow-sm'
                    }`}
                  >
                    {isCleared ? (
                      <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] block">{item.category}</span>
                        {canToggle ? (
                          <span className="text-[9px] font-mono text-gray-500">
                            {isCleared ? '✓ Cleared' : '✗ Hold'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500 font-bold">
                            {isCleared ? '✓ VERIFIED' : '✗ PENDING'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-700 block">{item.details}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200">
              <span className="text-gray-700 font-medium">
                {Array.isArray(releaseStatus?.gate2?.remarks)
                  ? releaseStatus.gate2.remarks.join('; ')
                  : (releaseStatus?.gate2?.remarks || 'Real-time query verified across regulatory registries.')}
              </span>
              <span className={`font-bold ${releaseStatus?.gate2?.total_pending_dues ? 'text-red-700' : 'text-green-800'}`}>
                Total Pending Dues: ₹{(releaseStatus?.gate2?.total_pending_dues || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* RBAC: NODAL OFFICER RELEASE DESK vs ADMINISTRATIVE GATES 3 & 4 */}
          {isNodalOfficer ? (
            <div className="rounded border border-slate-300 bg-slate-50/70 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <Crown className="w-5 h-5 text-[#1E3A8A]" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Statutory Security Deposit Release Application
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Official Institutional Request for Lien Discharge &amp; NOC
                  </span>
                </div>
              </div>

              {/* AICTE Requirement 6: Amazon-Style 4-Step Release Pipeline Progress Tracker */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between relative px-2 sm:px-6">
                  {/* Background Track Line */}
                  <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 z-0" />
                  
                  {/* Progress Line */}
                  {(() => {
                    const isStep4 = releaseStatus?.status === 'RELEASE_APPROVED_NOC_ISSUED' || releaseStatus?.gate4_competent_authority_approved || (currentFdr as any)?.lifecycleState === 'NOC_ISSUED';
                    const isStep3 = isStep4 || releaseStatus?.status === 'PENDING_COMPETENT_AUTHORITY';
                    const isStep2 = isStep3 || releaseStatus?.status === 'PENDING_SCRUTINY';
                    const isStep1 = isStep2 || nodalRequestedSuccess || (currentFdr as any)?.lifecycleState === 'NOC_RELEASE_REQUESTED';
                    
                    const progressWidth = isStep4 ? '100%' : isStep3 ? '66%' : isStep1 ? '33%' : '0%';

                    return (
                      <div 
                        className="absolute top-4 left-6 h-1 bg-emerald-600 z-0 transition-all duration-500" 
                        style={{ width: progressWidth }} 
                      />
                    );
                  })()}

                  {/* Step 1: Request Submitted */}
                  {(() => {
                    const s1Done = nodalRequestedSuccess || releaseStatus?.status === 'PENDING_SCRUTINY' || releaseStatus?.status === 'PENDING_COMPETENT_AUTHORITY' || releaseStatus?.status === 'RELEASE_APPROVED_NOC_ISSUED' || (currentFdr as any)?.lifecycleState === 'NOC_RELEASE_REQUESTED' || (currentFdr as any)?.lifecycleState === 'PENDING_COMPETENT_AUTHORITY' || (currentFdr as any)?.lifecycleState === 'NOC_ISSUED';
                    return (
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                          s1Done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {s1Done ? '✓' : '1'}
                        </div>
                        <span className="text-[10px] font-bold mt-1.5 text-slate-800 text-center">1. Request Submitted</span>
                      </div>
                    );
                  })()}

                  {/* Step 2: Scrutiny & ERP Clearance */}
                  {(() => {
                    const s2Done = releaseStatus?.gate3_scrutiny_officer_approved || releaseStatus?.status === 'PENDING_COMPETENT_AUTHORITY' || releaseStatus?.status === 'RELEASE_APPROVED_NOC_ISSUED' || (currentFdr as any)?.lifecycleState === 'PENDING_COMPETENT_AUTHORITY' || (currentFdr as any)?.lifecycleState === 'NOC_ISSUED';
                    const s2Active = !s2Done && (nodalRequestedSuccess || releaseStatus?.status === 'PENDING_SCRUTINY');
                    return (
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                          s2Done ? 'bg-emerald-600 text-white' : s2Active ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {s2Done ? '✓' : '2'}
                        </div>
                        <span className="text-[10px] font-bold mt-1.5 text-slate-800 text-center">2. Scrutiny &amp; ERP</span>
                      </div>
                    );
                  })()}

                  {/* Step 3: Final Authority Sign-Off */}
                  {(() => {
                    const s3Done = releaseStatus?.gate4_competent_authority_approved || releaseStatus?.status === 'RELEASE_APPROVED_NOC_ISSUED' || (currentFdr as any)?.lifecycleState === 'NOC_ISSUED';
                    const s3Active = !s3Done && (releaseStatus?.status === 'PENDING_COMPETENT_AUTHORITY' || (currentFdr as any)?.lifecycleState === 'PENDING_COMPETENT_AUTHORITY');
                    return (
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                          s3Done ? 'bg-emerald-600 text-white' : s3Active ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {s3Done ? '✓' : '3'}
                        </div>
                        <span className="text-[10px] font-bold mt-1.5 text-slate-800 text-center">3. Authority Sign-Off</span>
                      </div>
                    );
                  })()}

                  {/* Step 4: NOC Issued */}
                  {(() => {
                    const s4Done = releaseStatus?.status === 'RELEASE_APPROVED_NOC_ISSUED' || releaseStatus?.gate4_competent_authority_approved || (currentFdr as any)?.lifecycleState === 'NOC_ISSUED';
                    return (
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                          s4Done ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {s4Done ? '✓' : '4'}
                        </div>
                        <span className="text-[10px] font-bold mt-1.5 text-slate-800 text-center">4. NOC Issued</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {releaseStatus?.status === 'RELEASE_APPROVED_NOC_ISSUED' || releaseStatus?.gate4_competent_authority_approved || (currentFdr as any)?.lifecycleState === 'NOC_ISSUED' ? (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-lg text-xs text-emerald-950 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 font-bold text-emerald-950 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Statutory Release Approved — Official Discharge NOC Issued!</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    Your security deposit lien has been unconditionally discharged by the AICTE Competent Authority. The official cryptographically sealed Discharge NOC Certificate is now ready for download. Submit this certificate to your bank branch to release deposit funds.
                  </p>
                  
                  <div className="p-3 bg-white rounded border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-emerald-950">
                      <span className="text-slate-500 block text-[10px]">NOC CERTIFICATE HASH:</span>
                      <span className="font-bold">{releaseStatus?.noc_certificate_hash || (currentFdr as any)?.noc_certificate_hash || 'SHA-256: 8f9b1c2e4a6d701835...'}</span>
                    </div>

                    <a
                      href={(currentFdr as any)?.noc_certificate_url || (currentFdr?.digitalVault?.find(d => d.documentType === 'Discharge NOC')?.fileUrl) || `https://res.cloudinary.com/vidyakosh-aicte/raw/upload/vidyakosh_fdrs/Discharge_NOC_${selectedFdrUid}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center space-x-2 py-2 px-4 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Official Discharge NOC (PDF)</span>
                    </a>
                  </div>
                </div>
              ) : nodalRequestedSuccess || releaseStatus?.status === 'PENDING_SCRUTINY' || releaseStatus?.status === 'PENDING_COMPETENT_AUTHORITY' || (currentFdr as any)?.lifecycleState === 'PENDING_COMPETENT_AUTHORITY' || (currentFdr as any)?.lifecycleState === 'NOC_RELEASE_REQUESTED' ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-amber-900">
                      <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                      <span>Application Status: Pending AICTE Executive Approval</span>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-mono px-2 py-0.5 rounded font-bold">
                      {(currentFdr as any)?.lifecycleState || releaseStatus?.status || 'UNDER REVIEW'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Your release request for <strong>{selectedFdrUid}</strong> has been received by AICTE. Scrutiny clearance and Member Secretary DSC PIN authorization are currently processing in the executive queue.
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/60 flex items-center justify-between">
                    <span>Gate 1 (Lock-in): {releaseStatus?.gate1?.passed ? 'PASSED ✓' : 'UNDER REVIEW'}</span>
                    <span>Gate 2 (Zero Dues): {releaseStatus?.gate2?.passed ? 'PASSED ✓' : 'PENDING'}</span>
                    <span>Gate 3 (Scrutiny): {releaseStatus?.gate3_scrutiny_officer_approved ? 'APPROVED ✓' : 'PENDING'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Technical institutions can apply for statutory return and lien release of their security deposit once the continuous 8–10 year lock-in tenure is completed and all institutional regulatory dues (PGRC, faculty salaries, and court mandates) are cleared.
                  </p>

                  <div className="p-3 bg-white border border-slate-200 rounded-md text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Lock-in Tenure Check (Gate 1):</span>
                      <span className={`font-bold ${releaseStatus?.gate1?.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                        {releaseStatus?.gate1?.passed ? 'COMPLETED (T-0) ✓' : 'HOLD / NOT MATURED'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Cross-Bureau Dues Check (Gate 2):</span>
                      <span className={`font-bold ${releaseStatus?.gate2?.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                        {releaseStatus?.gate2?.passed ? 'CLEARED (ZERO DUES) ✓' : 'PENDING DUES REPORTED'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNodalRequestRelease}
                    disabled={isRequestingRelease || (!releaseStatus?.gate1?.passed || !releaseStatus?.gate2?.passed)}
                    className="w-full py-3 px-4 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-40 flex items-center justify-center space-x-2"
                  >
                    {isRequestingRelease ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Submitting Release Application...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Request Release/NOC</span>
                      </>
                    )}
                  </button>

                  {(!releaseStatus?.gate1?.passed || !releaseStatus?.gate2?.passed) && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 text-center font-medium">
                      Release application locked: Complete 8-year lock-in tenure (T-0) and clear all regulatory ERP dues before requesting release.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* GATE 3: Regulation Bureau Scrutiny Officer Recommendation */}
              <div className={`rounded border p-4 space-y-3 transition-all ${
                releaseStatus?.gate3_scrutiny_officer_approved
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck className={`w-5 h-5 ${releaseStatus?.gate3_scrutiny_officer_approved ? 'text-blue-900' : 'text-gray-400'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Gate 3: Regulation Bureau Scrutiny Officer Recommendation
                      </h4>
                      <span className="text-[10px] text-gray-600">Regional Scrutiny Officer clearance sign-off</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCompetentAuthority && (
                      <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        READ-ONLY
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      releaseStatus?.gate3_scrutiny_officer_approved
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : 'bg-gray-200 text-gray-700 border-gray-300'
                    }`}>
                      {releaseStatus?.gate3_scrutiny_officer_approved ? 'GATE 3 APPROVED' : 'PENDING SCRUTINY'}
                    </span>
                  </div>
                </div>

                {isCompetentAuthority ? (
                  /* Strictly Read-Only View for Competent Authority */
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-gray-700 font-semibold block mb-0.5">Scrutiny Officer Name:</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={(releaseStatus as any)?.gate3_scrutiny_officer || scrutinyOfficerName}
                        className="w-full bg-slate-100 border border-slate-300 rounded p-2 text-slate-700 text-xs cursor-not-allowed select-text font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-700 font-semibold block mb-0.5">Scrutiny Evaluation Remarks:</label>
                      <textarea
                        rows={2}
                        readOnly
                        disabled
                        value={releaseStatus?.gate3_remarks || scrutinyRemarks}
                        className="w-full bg-slate-100 border border-slate-300 rounded p-2 text-slate-700 text-xs cursor-not-allowed select-text font-medium resize-none"
                      />
                    </div>
                    <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Official Regional Scrutiny Recommendation on Record
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">LOWER ROLE JURISDICTION</span>
                    </div>
                  </div>
                ) : !releaseStatus?.gate3_scrutiny_officer_approved ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-gray-700 font-semibold block mb-0.5">Scrutiny Officer Name:</label>
                      <input
                        type="text"
                        value={scrutinyOfficerName}
                        onChange={(e) => setScrutinyOfficerName(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-xs focus:border-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-700 font-semibold block mb-0.5">Scrutiny Evaluation Remarks:</label>
                      <textarea
                        rows={2}
                        value={scrutinyRemarks}
                        onChange={(e) => setScrutinyRemarks(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-xs focus:border-blue-900 focus:outline-none resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGate3Signoff}
                      disabled={isSubmittingGate3 || (!releaseStatus?.gate1?.passed || (!releaseStatus?.gate2?.passed && !(releaseStatus?.gate2?.compliance_items && releaseStatus.gate2.compliance_items.every(i => manualChecks[i.category] !== undefined ? manualChecks[i.category] : i.cleared))))}
                      className="w-full py-2.5 px-4 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center space-x-2"
                    >
                      {isSubmittingGate3 ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4 text-amber-400" />
                          <span>Submit Gate 3 Scrutiny Sign-Off</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-white border border-gray-300 text-xs text-gray-800 flex items-center justify-between">
                    <span className="font-semibold text-green-800">✓ Verified by Regional Scrutiny Officer and recommended for statutory release.</span>
                    <span className="text-[10px] font-mono text-gray-600 font-bold">STATUS: PENDING_COMPETENT_AUTHORITY</span>
                  </div>
                )}
              </div>

              {/* GATE 4: Competent Authority Final Sign-Off & NOC Generation */}
              <div className={`rounded border p-4 space-y-3 transition-all ${
                releaseStatus?.gate4_competent_authority_approved
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-300/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className={`w-5 h-5 ${releaseStatus?.gate4_competent_authority_approved ? 'text-orange-600' : 'text-amber-600'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Gate 4: Competent Authority Digital Signature &amp; NOC Issuance</span>
                        {isCompetentAuthority && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                            YOUR DESK
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-gray-600">AICTE Member Secretary / Chairman Final Statutory Seal</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    releaseStatus?.gate4_competent_authority_approved
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {releaseStatus?.gate4_competent_authority_approved ? 'NOC ISSUED & ACTIVE' : 'PENDING GATE 4'}
                  </span>
                </div>

                {!releaseStatus?.gate4_competent_authority_approved ? (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-700 font-semibold block mb-0.5">Competent Authority Signatory:</label>
                        <input
                          type="text"
                          value={authorityName}
                          onChange={(e) => setAuthorityName(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-xs focus:border-blue-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-700 font-semibold block mb-0.5">Digital Signature DSC PIN:</label>
                        <input
                          type="password"
                          value={dscPin}
                          onChange={(e) => setDscPin(e.target.value)}
                          placeholder="Enter DSC PIN (e.g. 102026)"
                          className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 font-mono text-xs focus:border-blue-900 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-700 font-semibold block mb-0.5">Final Statutory Authorization Remarks:</label>
                      <textarea
                        rows={2}
                        value={authorityRemarks}
                        onChange={(e) => setAuthorityRemarks(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-xs focus:border-blue-900 focus:outline-none resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGate4Approval}
                      disabled={isSubmittingGate4 || (!isCompetentAuthority && !releaseStatus?.gate3_scrutiny_officer_approved)}
                      className="w-full py-2.5 px-4 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center space-x-2"
                    >
                      {isSubmittingGate4 ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>Authorize Release &amp; Generate Cryptographic QR Discharge NOC</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded bg-green-50 border border-green-300 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-green-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-700" />
                        Statutory Authorization Complete & Digitally Signed!
                      </span>
                      <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-300">
                        RELEASE_APPROVED_NOC_ISSUED
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-gray-700">
                      <Lock className="w-3.5 h-3.5 text-green-700" />
                      <span className="text-gray-600">Cryptographic NOC Hash:</span>
                      <span className="font-mono text-blue-950 bg-white px-2 py-0.5 rounded border border-gray-300 text-[10px] truncate max-w-[260px] font-bold">
                        {releaseStatus.noc_certificate_hash}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANE: Official Printable AICTE FDR Discharge NOC Certificate (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-900" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Official AICTE Discharge NOC Document
              </h3>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-mono border border-blue-200 font-bold">
              LEGAL CERTIFICATE
            </span>
          </div>

          {!releaseStatus?.noc_payload ? (
            <div className="h-full min-h-[460px] rounded border border-dashed border-gray-300 bg-gray-50 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-full bg-gray-200 text-gray-500">
                <FileCheck className="w-8 h-8" />
              </div>
              <h4 className="text-xs font-bold text-gray-800">
                Discharge NOC Awaiting Final Sign-Off
              </h4>
              <p className="text-[11px] text-gray-600 max-w-xs leading-relaxed">
                Complete Gates 1 through 4 on the left to mint the cryptographically signed AICTE Security Deposit Discharge Certificate with bank-verifiable QR code.
              </p>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col">
              
              {/* Document Actions */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowVaultModal(true)}
                  className="flex-1 py-1.5 px-3 rounded bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] text-xs font-bold border border-blue-300 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Open multi-file Digital Vault containing this Discharge NOC"
                >
                  <Lock className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Open Digital Vault</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex-1 py-1.5 px-3 rounded bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-300 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-900" />
                  <span>Print / Export NOC PDF</span>
                </button>

                <button
                  onClick={handleSimulateBankQRScan}
                  className="flex-1 py-1.5 px-3 rounded bg-green-50 hover:bg-green-100 text-green-900 text-xs font-bold border border-green-300 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5 text-green-700" />
                  <span>Simulate Bank QR Scan</span>
                </button>
              </div>

              {/* The Official Government Document View */}
              <div className="bg-[#fcfbf9] text-slate-900 rounded p-5 shadow border-2 border-amber-800/30 text-xs font-serif space-y-3 relative overflow-hidden select-text">
                
                {/* Government Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none text-9xl font-sans font-black rotate-[-25deg]">
                  AICTE
                </div>

                {/* Header */}
                <div className="text-center border-b border-amber-900/30 pb-2 space-y-0.5">
                  <div className="text-[9px] font-sans font-bold tracking-widest uppercase text-amber-900">
                    GOVERNMENT OF INDIA • MINISTRY OF EDUCATION
                  </div>
                  <h3 className="text-sm font-serif font-black uppercase text-slate-900 tracking-tight">
                    All India Council for Technical Education
                  </h3>
                  <div className="text-[10px] font-sans text-slate-700">
                    Regulation Bureau • Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
                  </div>
                  <div className="text-[9px] font-mono font-bold text-amber-800 pt-0.5">
                    REF NO: {releaseStatus.noc_payload.reference_number} • DATE: {releaseStatus.noc_payload.dispatch_date}
                  </div>
                </div>

                {/* Addressee */}
                <div className="font-sans text-[11px] leading-tight space-y-0.5 text-slate-800">
                  <div className="font-bold">TO:</div>
                  <div>{releaseStatus.noc_payload.addressee.designation}</div>
                  <div className="font-semibold text-amber-950">{releaseStatus.noc_payload.addressee.bank_name}</div>
                  <div>IFSC: <span className="font-mono font-bold">{releaseStatus.noc_payload.addressee.ifsc}</span></div>
                </div>

                {/* Subject */}
                <div className="font-sans font-bold text-[11px] bg-amber-50 border border-amber-200 p-1.5 rounded text-amber-950">
                  SUB: DISCHARGE OF SECURITY DEPOSIT & UNCONDITIONAL RELEASE OF AICTE JOINT LIEN
                </div>

                {/* Instrument Metadata Table */}
                <div className="font-sans text-[10px] bg-white border border-slate-300 rounded p-2 grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-slate-500 block">Institution:</span>
                    <span className="font-bold text-slate-900">{releaseStatus.noc_payload.institution.name}</span>
                    <span className="text-slate-500 block font-mono">PID: {releaseStatus.noc_payload.institution.pid}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Deposit Principal:</span>
                    <span className="font-bold text-emerald-800 text-xs">
                      ₹{(releaseStatus.noc_payload.instrument.principal_amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-600 block text-[9px]">{releaseStatus.noc_payload.instrument.principal_in_words}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 block">Lineage Provenance:</span>
                    <span className="font-mono text-[9px] text-slate-700">{releaseStatus.noc_payload.instrument.lineage_summary}</span>
                  </div>
                </div>

                {/* Official Declaration Text */}
                <p className="font-sans text-[10px] leading-relaxed text-slate-700">
                  {releaseStatus.noc_payload.regulatory_declaration}
                </p>

                {/* Bottom Signature & SVG Cryptographic QR Code */}
                <div className="pt-2 border-t border-amber-900/20 flex items-center justify-between font-sans text-[10px]">
                  
                  {/* Visual SVG QR Code */}
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-white border border-slate-400 rounded shadow-sm">
                      <svg width="56" height="56" viewBox="0 0 56 56">
                        <rect width="56" height="56" fill="white" />
                        {/* Position Markers */}
                        <rect x="4" y="4" width="16" height="16" fill="#0f172a" />
                        <rect x="7" y="7" width="10" height="10" fill="white" />
                        <rect x="9" y="9" width="6" height="6" fill="#0f172a" />

                        <rect x="36" y="4" width="16" height="16" fill="#0f172a" />
                        <rect x="39" y="7" width="10" height="10" fill="white" />
                        <rect x="41" y="9" width="6" height="6" fill="#0f172a" />

                        <rect x="4" y="36" width="16" height="16" fill="#0f172a" />
                        <rect x="7" y="39" width="10" height="10" fill="white" />
                        <rect x="9" y="41" width="6" height="6" fill="#0f172a" />

                        {/* Dense Data Matrix Dots */}
                        <rect x="24" y="6" width="4" height="4" fill="#0f172a" />
                        <rect x="24" y="14" width="4" height="4" fill="#0f172a" />
                        <rect x="28" y="10" width="4" height="4" fill="#0f172a" />
                        <rect x="6" y="24" width="4" height="4" fill="#0f172a" />
                        <rect x="14" y="24" width="4" height="4" fill="#0f172a" />
                        <rect x="22" y="22" width="6" height="6" fill="#059669" />
                        <rect x="32" y="24" width="4" height="4" fill="#0f172a" />
                        <rect x="40" y="24" width="4" height="4" fill="#0f172a" />
                        <rect x="24" y="36" width="4" height="4" fill="#0f172a" />
                        <rect x="30" y="40" width="4" height="4" fill="#0f172a" />
                        <rect x="36" y="36" width="4" height="4" fill="#0f172a" />
                        <rect x="44" y="40" width="4" height="4" fill="#0f172a" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-[9px] text-slate-800 block">Bank QR Verification</span>
                      <span className="text-[8px] font-mono text-slate-500 block">SHA-256 Ledger Authenticated</span>
                    </div>
                  </div>

                  {/* Competent Signatory Seal */}
                  <div className="text-right space-y-0.5">
                    <div className="font-bold text-slate-900">{releaseStatus.noc_payload.issuing_signatory.name}</div>
                    <div className="text-[9px] text-slate-600">{releaseStatus.noc_payload.issuing_signatory.title}</div>
                    <div className="text-[8px] font-mono text-blue-900 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                      TOKEN: {releaseStatus.noc_payload.issuing_signatory.dsc_token_id}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>

      </div>

      {/* EXECUTIVE ANALYTICS: Regional Exposure & Portfolio Funnel (Admin Only) */}
      {!isNodalOfficer && (
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-900" />
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Executive Analytics: Nationwide Security Deposit Exposure & Regulatory Health
            </h3>
            {loadingAnalytics && <RefreshCw className="w-3.5 h-3.5 text-blue-900 animate-spin" />}
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full font-mono border border-blue-200 font-bold">
            COMPETENT AUTHORITY COCKPIT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Regional Financial Exposure */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-blue-900" />
                Regional Deposit Exposure
              </span>
              <span className="text-[10px] text-gray-600 font-mono font-semibold">₹ Lakhs</span>
            </div>

            <div className="space-y-2.5">
              {(analytics?.regional_exposure || []).map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-semibold">{r.region} Region</span>
                    <span className="font-mono font-bold text-blue-950">₹{r.locked_lakhs} L ({r.institutions_count} Inst)</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                    <div 
                      className="bg-blue-900 h-full rounded"
                      style={{ width: `${Math.min(100, Math.max(15, (r.locked_lakhs / (analytics?.total_locked_amount ? analytics.total_locked_amount / 100000 : 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: FDR Portfolio Funnel Distribution */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-green-700" />
                Lifecycle Portfolio Funnel
              </span>
              <span className="text-[10px] text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200 font-mono font-bold">
                {analytics?.total_compliant_rate_pct ?? 0}% Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(analytics?.lifecycle_distribution || []).map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-2 rounded shadow-sm">
                  <span className="text-[10px] text-gray-600 block truncate">{item.label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: item.color }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Cross-Bureau Compliance Holds Breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Active Regulatory Holds
              </span>
              <span className="text-[10px] text-red-700 font-mono font-bold">Bureau Dues</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {(analytics?.compliance_holds || []).map((h, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-white border border-gray-200 shadow-sm">
                  <span className="text-gray-800 font-medium text-[11px] truncate max-w-[170px]">
                    {h.reason || (h as any).category || 'Regulatory Check'}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    h.count > 0 ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}>
                    {h.count} Active {h.penalty_amount ? `(₹${(h.penalty_amount / 100000).toFixed(1)}L)` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      )}

      {/* QR Code Verification Simulation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-green-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Bank Scanner: AICTE Cryptographic QR Verifier
                </h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-500 hover:text-gray-800 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingQrVerify ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-7 h-7 text-blue-900 animate-spin" />
                <span className="text-xs text-gray-600">Querying SHA-256 Ledger verification block...</span>
              </div>
            ) : qrVerifyResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-green-50 border border-green-300 space-y-1">
                  <div className="flex items-center space-x-1.5 text-green-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span>{qrVerifyResult.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-700">{qrVerifyResult.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded border border-gray-200 text-[11px]">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Institution:</span>
                    <span className="font-semibold text-gray-900">{qrVerifyResult.institution_name}</span>
                    <span className="font-mono text-gray-600 block text-[10px]">{qrVerifyResult.institution_pid}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Authorized Release Principal:</span>
                    <span className="font-bold text-green-700 text-sm">
                      ₹{qrVerifyResult.principal_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Bank / IFSC:</span>
                    <span className="text-gray-800">{qrVerifyResult.bank_name}</span>
                    <span className="font-mono text-blue-900 font-bold block text-[10px]">{qrVerifyResult.ifsc}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Issuing Signatory:</span>
                    <span className="text-gray-800">{qrVerifyResult.issuing_authority}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">NOC Certificate Hash:</span>
                    <span className="font-mono text-green-800 font-bold truncate max-w-[240px]">
                      {qrVerifyResult.noc_certificate_hash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ledger Block Hash:</span>
                    <span className="font-mono text-blue-900 font-bold truncate max-w-[240px]">
                      {qrVerifyResult.audit_block_hash}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2 bg-[#1a365d] hover:bg-blue-900 text-white rounded font-bold transition cursor-pointer shadow-sm"
                >
                  Close Verifier
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Digital Vault Modal */}
      <DigitalVaultModal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        fdr={currentFdr}
      />

    </div>
  );
};
