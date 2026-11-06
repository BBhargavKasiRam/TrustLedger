import React, { useState } from 'react';
import { KPISummary } from './KPISummary';
import { FDRRegistryTable } from './FDRRegistryTable';
import { AuditLedgerViewer } from './AuditLedgerViewer';
import { InstitutionsList } from './InstitutionsList';
import { DocumentVerificationDesk } from './DocumentVerificationDesk';
import { BankVerificationGateway } from './BankVerificationGateway';
import { BankManagerPortal } from './BankManagerPortal';
import { DAGLineageWorkbench } from './DAGLineageWorkbench';
import { ReleaseClearanceWorkbench } from './ReleaseClearanceWorkbench';
import { NodalStatusPipelineView } from './NodalStatusPipelineView';
import { NodalFDRSubmissionDesk } from './NodalFDRSubmissionDesk';
import { ErrorBoundary } from './ErrorBoundary';
import { DEMO_PRESETS } from './PresenterDemoBar';
import type { UserRole, Institution, FDRInstrument, AuditLog, DashboardSummary, UserSession, UserPreset } from '../types';
import { 
  FileSpreadsheet, 
  Building2, 
  Scan, 
  Landmark, 
  KeyRound, 
  GitBranch, 
  Crown, 
  CheckCircle2, 
  FileCheck2, 
  ChevronRight, 
  ShieldAlert, 
  AlertTriangle,
  MessageSquare,
  Lock
} from 'lucide-react';

interface AuthenticatedDashboardProps {
  currentSession: UserSession;
  setCurrentSession: (session: UserSession | null) => void;
  institutions: Institution[];
  selectedInstitutionId: number | null;
  setSelectedInstitutionId: (id: number | null) => void;
  fdrs: FDRInstrument[];
  logs: AuditLog[];
  summary: DashboardSummary | null;
  activeInstitution?: Institution;
  collegeFdrs: FDRInstrument[];
  nodalWarningState: any;
  loadData: () => Promise<void>;
  userPresets: UserPreset[];
  loading?: boolean;
}

export const AuthenticatedDashboard: React.FC<AuthenticatedDashboardProps> = ({
  currentSession,
  setCurrentSession,
  institutions,
  selectedInstitutionId,
  setSelectedInstitutionId,
  fdrs,
  logs,
  summary,
  activeInstitution,
  collegeFdrs,
  nodalWarningState,
  loadData,
  userPresets,
  loading = false
}) => {
  const [collegeSubMenu, setCollegeSubMenu] = useState<
    'MY_FDRS' | 'SUBMIT_FDR' | 'RENEWAL_MERGER' | 'RELEASE_NOC'
  >('MY_FDRS');

  const [scrutinySubMenu, setScrutinySubMenu] = useState<
    'SCRUTINY_INBOX' | 'FORENSICS' | 'BANK_GATEWAY' | 'RELEASE_WATCHLIST'
  >('SCRUTINY_INBOX');

  const [authoritySubMenu, setAuthoritySubMenu] = useState<
    'EXECUTIVE_SUMMARY' | 'RELEASE_DSC' | 'AUDIT_DEFAULTER'
  >('EXECUTIVE_SUMMARY');

  const [bankSubMenu, setBankSubMenu] = useState<'CBS_ATTESTATION'>('CBS_ATTESTATION');
  const [targetBankFdrUid, setTargetBankFdrUid] = useState<string>('FDR-2026-309');

  const activeRole: UserRole = currentSession.role;

  // Multi-Tier Escalation Engine state checks
  const currentSystemDate = new Date();
  const hasOverdueFdr = collegeFdrs.some(f => {
    if (f.lifecycle_status === 'MATURED_ACTION_PENDING') return true;
    if (f.inst_maturity_date) {
      const mat = new Date(f.inst_maturity_date);
      return mat <= currentSystemDate && f.lifecycle_status !== 'RENEWED_SUPERSEDED' && f.lifecycle_status !== 'RELEASE_APPROVED_NOC_ISSUED';
    }
    return false;
  });

  const hasT30Fdr = !hasOverdueFdr && collegeFdrs.some(f => {
    if (f.lifecycle_status === 'APPROACHING_MATURITY_T30') return true;
    if (f.inst_maturity_date) {
      const mat = new Date(f.inst_maturity_date);
      const days = Math.ceil((mat.getTime() - currentSystemDate.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30 && f.lifecycle_status !== 'RENEWED_SUPERSEDED' && f.lifecycle_status !== 'RELEASE_APPROVED_NOC_ISSUED';
    }
    return false;
  });

  return (
    <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* ----------------------------------------------------------------- */}
      {/* ROLE 1: INSTITUTION NODAL OFFICER (COLLEGE PORTAL)                */}
      {/* ----------------------------------------------------------------- */}
      {activeRole === 'INSTITUTION_NODAL_OFFICER' && (
        <div className="space-y-6">
          
          {/* Official Institution Profile Banner */}
          <div className="bg-white rounded-lg border border-slate-200 border-l-4 border-l-[#1E3A8A] p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-[#1E3A8A] mt-0.5">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                      PID: {activeInstitution?.pid || currentSession.institutionPid || '1-100200301'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Region: {activeInstitution?.region || 'North'} Bureau
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Tier: {activeInstitution?.programme_tier || 'Engineering Degree'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {activeInstitution?.name || currentSession.institutionName || 'Apex Institute of Engineering & Technology, Jaipur'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Nodal Officer: <span className="font-semibold text-slate-800">{currentSession.userName}</span> ({currentSession.designation})
                  </p>
                </div>
              </div>

              {/* Statutory Compliance Norm Chip */}
              <div className="flex flex-row md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5 gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    Sanctioned Deposit Norm
                  </span>
                  <span className="text-base font-extrabold text-[#1E3A8A] font-mono">
                    ₹{((activeInstitution?.required_fdr_norm || 3500000) / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {/* Multi-Tier Escalation Badges */}
                  {hasOverdueFdr && (
                    <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold bg-red-600 text-white border border-red-700 px-2.5 py-1 rounded shadow-sm animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>[⚠ COMPLIANCE AT RISK: Soft-Hold Applied to Annual Extension of Approval (EoA)]</span>
                    </span>
                  )}

                  {hasT30Fdr && (
                    <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>[WhatsApp &amp; SMS Alert Automatically Dispatched to College Principal]</span>
                    </span>
                  )}

                  {activeInstitution && (activeInstitution.pending_pgrc_penalties > 0 || activeInstitution.unpaid_salary_complaints || activeInstitution.pending_court_cases) ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-red-50 text-red-800 border border-red-300 px-2.5 py-1 rounded">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>COMPLIANCE HOLD (₹{((activeInstitution.pending_pgrc_penalties || 0)/100000).toFixed(2)}L Dues)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>100% COMPLIANT • ZERO DUES</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AICTE Requirement 4: Highly visible Warning Banner */}
          {nodalWarningState && (
            <div className={`p-4 rounded-lg border-2 shadow-sm flex items-start space-x-3.5 ${
              nodalWarningState.type === 'EXPIRED'
                ? 'bg-red-50 border-red-600 animate-pulse'
                : 'bg-amber-50 border-amber-400'
            }`}>
              <div className="mt-0.5 shrink-0">
                {nodalWarningState.type === 'EXPIRED' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      nodalWarningState.type === 'EXPIRED'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-400 text-slate-950'
                    }`}>
                      {nodalWarningState.badge}
                    </span>
                    <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      nodalWarningState.type === 'EXPIRED'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {nodalWarningState.tag}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600">
                    Depository Bank: <strong className="text-slate-800">{nodalWarningState.bankName}</strong>
                  </span>
                </div>
                <h4 className={`text-sm font-bold mt-1.5 ${
                  nodalWarningState.type === 'EXPIRED' ? 'text-red-950' : 'text-amber-950'
                }`}>
                  {nodalWarningState.title}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${
                  nodalWarningState.type === 'EXPIRED' ? 'text-red-900' : 'text-amber-900'
                }`}>
                  {nodalWarningState.description}
                </p>
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    onClick={() => setCollegeSubMenu('RENEWAL_MERGER')}
                    className={`px-3 py-1.5 rounded text-xs font-bold shadow-xs cursor-pointer transition ${
                      nodalWarningState.type === 'EXPIRED'
                        ? 'bg-red-700 hover:bg-red-800 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    Initiate Statutory Renewal Workflow →
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium">
                    FDR Reference: <strong className="font-mono text-slate-800">{nodalWarningState.fdrUid}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Isolated 4-Item NSWS Sidebar + Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar Menu (NSWS Deep Authority Navy #0F2547) */}
            <div className="lg:col-span-3 bg-[#0F2547] text-slate-100 rounded-lg border border-slate-800 shadow-md p-3.5 space-y-2">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/80 block">
                  VidyaKosh Management
                </span>
                <h4 className="text-xs font-bold text-white tracking-tight">Institution Security Desk</h4>
              </div>

              <button
                onClick={() => setCollegeSubMenu('MY_FDRS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  collegeSubMenu === 'MY_FDRS'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className={`w-4 h-4 ${collegeSubMenu === 'MY_FDRS' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>1. My FDR Registry</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  collegeSubMenu === 'MY_FDRS' ? 'bg-[#F59E0B] text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {collegeFdrs.length}
                </span>
              </button>

              <button
                onClick={() => setCollegeSubMenu('SUBMIT_FDR')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  collegeSubMenu === 'SUBMIT_FDR'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Scan className={`w-4 h-4 ${collegeSubMenu === 'SUBMIT_FDR' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>2. Submit New e-FDR</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setCollegeSubMenu('RENEWAL_MERGER')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  collegeSubMenu === 'RENEWAL_MERGER'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <GitBranch className={`w-4 h-4 ${collegeSubMenu === 'RENEWAL_MERGER' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>3. Renewal &amp; Lineage</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setCollegeSubMenu('RELEASE_NOC')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  collegeSubMenu === 'RELEASE_NOC'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Crown className={`w-4 h-4 ${collegeSubMenu === 'RELEASE_NOC' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>4. Request Release NOC</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Right Main Content Pane */}
            <div className="lg:col-span-9 space-y-6">
              {collegeSubMenu === 'MY_FDRS' && (
                <ErrorBoundary moduleName="Submitted FDRs Status Pipeline">
                  <NodalStatusPipelineView
                    fdrs={collegeFdrs}
                    institution={activeInstitution}
                    loading={loading}
                    onRefresh={loadData}
                    onNavigateToSubmit={() => setCollegeSubMenu('SUBMIT_FDR')}
                    onNavigateToRelease={() => setCollegeSubMenu('RELEASE_NOC')}
                    onNavigateToRenewal={() => setCollegeSubMenu('RENEWAL_MERGER')}
                  />
                </ErrorBoundary>
              )}

              {collegeSubMenu === 'SUBMIT_FDR' && (
                <ErrorBoundary moduleName="Online FDR Submission Desk">
                  <NodalFDRSubmissionDesk
                    institution={activeInstitution || institutions[0]}
                    onFDRSubmitted={loadData}
                    onNavigateToMyFdrs={() => setCollegeSubMenu('MY_FDRS')}
                  />
                </ErrorBoundary>
              )}

              {collegeSubMenu === 'RENEWAL_MERGER' && (
                <ErrorBoundary moduleName="Deposit History Lineage Graph">
                  <DAGLineageWorkbench
                    institutions={institutions}
                    selectedInstitutionId={activeInstitution?.id || selectedInstitutionId}
                    onSelectInstitution={setSelectedInstitutionId}
                    onRefreshAll={loadData}
                    isNodalOfficer={true}
                  />
                </ErrorBoundary>
              )}

              {collegeSubMenu === 'RELEASE_NOC' && (
                <ErrorBoundary moduleName="Release & Discharge NOC Desk">
                  <ReleaseClearanceWorkbench
                    institutions={institutions}
                    fdrs={collegeFdrs}
                    onRefreshAll={loadData}
                    isNodalOfficer={true}
                    loggedInstitutionPid={currentSession?.institutionPid || activeInstitution?.pid}
                    loggedUserName={currentSession?.userName}
                  />
                </ErrorBoundary>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* ROLE 2: AICTE SCRUTINY OFFICER (REGULATION BUREAU DESK)           */}
      {/* ----------------------------------------------------------------- */}
      {activeRole === 'AICTE_SCRUTINY_OFFICER' && (
        <div className="space-y-6">
          
          {/* Official Regulation Bureau Header Banner */}
          <div className="bg-white rounded-lg border border-slate-200 border-l-4 border-l-emerald-600 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 mt-0.5">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                      REGULATION BUREAU • NEW DELHI
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Active Regional Workbench: North / West / South
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    Scrutiny Officer Desk — {currentSession.userName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Dual-Truth Registry verification, manual document cross-referencing, and CBS bank attestation oversight.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    Scrutiny Queue
                  </span>
                  <span className="text-base font-extrabold text-emerald-800 font-mono">
                    {fdrs.length} FDRs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Isolated 4-Item NSWS Sidebar + Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar Menu (NSWS Deep Authority Navy #0F2547) */}
            <div className="lg:col-span-3 bg-[#0F2547] text-slate-100 rounded-lg border border-slate-800 shadow-md p-3.5 space-y-2">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/80 block">
                  VidyaKosh Regulation
                </span>
                <h4 className="text-xs font-bold text-white tracking-tight">Officer Scrutiny Desk</h4>
              </div>

              <button
                onClick={() => setScrutinySubMenu('SCRUTINY_INBOX')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  scrutinySubMenu === 'SCRUTINY_INBOX'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className={`w-4 h-4 ${scrutinySubMenu === 'SCRUTINY_INBOX' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>1. Centralized FDR Repository</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  scrutinySubMenu === 'SCRUTINY_INBOX' ? 'bg-[#F59E0B] text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {fdrs.length}
                </span>
              </button>

              <button
                onClick={() => setScrutinySubMenu('FORENSICS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  scrutinySubMenu === 'FORENSICS'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileCheck2 className={`w-4 h-4 ${scrutinySubMenu === 'FORENSICS' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>2. Document Verification</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setScrutinySubMenu('BANK_GATEWAY')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  scrutinySubMenu === 'BANK_GATEWAY'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Landmark className={`w-4 h-4 ${scrutinySubMenu === 'BANK_GATEWAY' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>3. Bank CBS Gateway</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setScrutinySubMenu('RELEASE_WATCHLIST')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  scrutinySubMenu === 'RELEASE_WATCHLIST'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Crown className={`w-4 h-4 ${scrutinySubMenu === 'RELEASE_WATCHLIST' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>4. 4-Gate Release Watchlist</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Right Main Content Pane */}
            <div className="lg:col-span-9 space-y-6">
              {scrutinySubMenu === 'SCRUTINY_INBOX' && (
                <div id="centralized-fdr-repository" className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
                    <h3 className="font-bold text-sm text-[#1a365d]">
                      Centralized Security Deposit/FDR Repository (Instrument-wise Records)
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Distinguishes between institution-submitted information and bank-confirmed information across all technical institutions.
                    </p>
                  </div>
                  <FDRRegistryTable
                    fdrs={fdrs}
                    loading={loading}
                    onRefresh={loadData}
                  />
                </div>
              )}

              {scrutinySubMenu === 'FORENSICS' && (
                <ErrorBoundary moduleName="Document Verification Desk">
                  <DocumentVerificationDesk
                    fdrs={fdrs}
                    institutions={institutions}
                    selectedInstitutionId={selectedInstitutionId}
                    onSelectInstitution={setSelectedInstitutionId}
                    onRefreshAll={loadData}
                  />
                </ErrorBoundary>
              )}

              {scrutinySubMenu === 'BANK_GATEWAY' && (
                <ErrorBoundary moduleName="Bank CBS Verification Gateway">
                  <BankVerificationGateway
                    fdrs={fdrs}
                    targetFdrUid={targetBankFdrUid}
                    onRefresh={loadData}
                    onSwitchRole={(role: UserRole, targetUid?: string) => {
                      if (targetUid) setTargetBankFdrUid(targetUid);
                      if (role === 'BANK_BRANCH_MANAGER') {
                        const dbPreset = userPresets.find(p => p.role === 'BANK_BRANCH_MANAGER');
                        if (dbPreset) {
                          setCurrentSession({
                            role: dbPreset.role,
                            userId: dbPreset.user_id,
                            userName: dbPreset.user_name,
                            designation: dbPreset.designation,
                            department: dbPreset.department,
                            bankName: dbPreset.bank_name,
                            branchName: dbPreset.branch_name,
                          });
                        } else {
                          const bankPreset = DEMO_PRESETS.find(p => p.session.role === 'BANK_BRANCH_MANAGER');
                          if (bankPreset) {
                            setCurrentSession(bankPreset.session);
                          }
                        }
                        setBankSubMenu('CBS_ATTESTATION');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  />
                </ErrorBoundary>
              )}

              {scrutinySubMenu === 'RELEASE_WATCHLIST' && (
                <div className="space-y-6">
                  <ErrorBoundary moduleName="Deposit History Lineage Graph">
                    <DAGLineageWorkbench
                      institutions={institutions}
                      selectedInstitutionId={selectedInstitutionId}
                      onSelectInstitution={setSelectedInstitutionId}
                      onRefreshAll={loadData}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary moduleName="Release, Discharge, or Refund Workflow">
                    <ReleaseClearanceWorkbench
                      institutions={institutions}
                      fdrs={fdrs}
                      onRefreshAll={loadData}
                    />
                  </ErrorBoundary>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* ROLE 3: COMPETENT AUTHORITY (MEMBER SECRETARY DESK)               */}
      {/* ----------------------------------------------------------------- */}
      {activeRole === 'COMPETENT_AUTHORITY' && (
        <div className="space-y-6">
          
          {/* Official Competent Authority Banner */}
          <div className="bg-white rounded-lg border border-slate-200 border-l-4 border-l-amber-600 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 mt-0.5">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-mono">
                      COMPETENT REGULATORY AUTHORITY
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Executive Council, AICTE Headquarters, New Delhi
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    Office of the Member Secretary — {currentSession.userName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    High-Level Regulatory Oversight, 4-Gate Digital Signature DSC Sign-Off, and Defaulter Registry Enforcement.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    National Corpus
                  </span>
                  <span className="text-base font-extrabold text-amber-800 font-mono">
                    ₹{((summary?.total_security_deposit_locked || 13500000) / 10000000).toFixed(2)} Cr Locked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Isolated 3-Item NSWS Sidebar + Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar Menu (NSWS Deep Authority Navy #0F2547) */}
            <div className="lg:col-span-3 bg-[#0F2547] text-slate-100 rounded-lg border border-slate-800 shadow-md p-3.5 space-y-2">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/80 block">
                  VidyaKosh Authority
                </span>
                <h4 className="text-xs font-bold text-white tracking-tight">Authority Console</h4>
              </div>

              <button
                onClick={() => setAuthoritySubMenu('EXECUTIVE_SUMMARY')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  authoritySubMenu === 'EXECUTIVE_SUMMARY'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Landmark className={`w-4 h-4 ${authoritySubMenu === 'EXECUTIVE_SUMMARY' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>1. Executive Summary</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setAuthoritySubMenu('RELEASE_DSC')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  authoritySubMenu === 'RELEASE_DSC'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Crown className={`w-4 h-4 ${authoritySubMenu === 'RELEASE_DSC' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>2. Release &amp; DSC Sign-Off</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  authoritySubMenu === 'RELEASE_DSC' ? 'bg-[#F59E0B] text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  4-Gate
                </span>
              </button>

              <button
                onClick={() => setAuthoritySubMenu('AUDIT_DEFAULTER')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  authoritySubMenu === 'AUDIT_DEFAULTER'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Lock className={`w-4 h-4 ${authoritySubMenu === 'AUDIT_DEFAULTER' ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>3. Audit &amp; Defaulter Registry</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Right Main Content Pane */}
            <div className="lg:col-span-9 space-y-6">
              {authoritySubMenu === 'EXECUTIVE_SUMMARY' && (
                <ErrorBoundary moduleName="Executive Summary & Release Cockpit">
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          VidyaKosh Executive KPI Dashboard &amp; National Corpus Cockpit
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Real-time statutory security deposit corpus monitoring, automated T-90/T-30 watchdog tracking, and 4-gate release clearance.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full font-mono">
                        EXECUTIVE OVERSIGHT
                      </span>
                    </div>
                    <KPISummary summary={summary} loading={loading} />
                    <ReleaseClearanceWorkbench
                      institutions={institutions}
                      fdrs={fdrs}
                      onRefreshAll={loadData}
                      isCompetentAuthority={true}
                      loggedUserName={currentSession.userName}
                    />
                  </div>
                </ErrorBoundary>
              )}

              {authoritySubMenu === 'RELEASE_DSC' && (
                <ErrorBoundary moduleName="Release & DSC Sign-Off Workbench">
                  <ReleaseClearanceWorkbench
                    institutions={institutions}
                    fdrs={fdrs}
                    onRefreshAll={loadData}
                    isCompetentAuthority={true}
                    loggedUserName={currentSession.userName}
                  />
                </ErrorBoundary>
              )}

              {authoritySubMenu === 'AUDIT_DEFAULTER' && (
                <ErrorBoundary moduleName="Audit & Defaulter Registry">
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
                      <h3 className="font-bold text-sm text-[#1a365d]">
                        Cryptographic SHA-256 Ledger &amp; AICTE Defaulter Oversight
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Immutable block verification and cross-bureau penalty tracking across student PGRC and faculty complaints.
                      </p>
                    </div>
                    <AuditLedgerViewer
                      logs={logs}
                      onRefresh={loadData}
                    />
                    <InstitutionsList
                      institutions={institutions}
                      selectedInstitutionId={selectedInstitutionId}
                      onSelectInstitution={setSelectedInstitutionId}
                    />
                  </div>
                </ErrorBoundary>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* ROLE 4: BANK BRANCH MANAGER (EXTERNAL BANK ATTESTATION PORTAL)     */}
      {/* ----------------------------------------------------------------- */}
      {activeRole === 'BANK_BRANCH_MANAGER' && (
        <div className="space-y-6">
          
          {/* Official Bank Branch Header Banner */}
          <div className="bg-white rounded-lg border border-slate-200 border-l-4 border-l-purple-600 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 mt-0.5">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-300 font-mono">
                      SCHEDULED COMMERCIAL BANK PORTAL
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Depository: {currentSession.bankName || 'State Bank of India (SBIN0001234)'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    Branch Manager Portal — {currentSession.userName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Zero-Login Two-Factor OTP Attestation Gateway for Depository Fixed Deposits.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    Attestation Target
                  </span>
                  <span className="text-base font-extrabold text-purple-800 font-mono">
                    {targetBankFdrUid}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Isolated 1-Item NSWS Sidebar + Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar Menu (NSWS Deep Authority Navy #0F2547) */}
            <div className="lg:col-span-3 bg-[#0F2547] text-slate-100 rounded-lg border border-slate-800 shadow-md p-3.5 space-y-2">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/80 block">
                  VidyaKosh Bank Gateway
                </span>
                <h4 className="text-xs font-bold text-white tracking-tight">Core Banking Attestation</h4>
              </div>

              <button
                onClick={() => setBankSubMenu('CBS_ATTESTATION')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs transition cursor-pointer text-left ${
                  bankSubMenu === 'CBS_ATTESTATION'
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#F59E0B] shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <KeyRound className="w-4 h-4 text-[#F59E0B]" />
                  <span>1. CBS Deposit Attestation</span>
                </div>
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-mono font-bold">
                  LIVE
                </span>
              </button>
            </div>

            {/* Right Main Content Pane */}
            <div className="lg:col-span-9 space-y-6">
              <ErrorBoundary moduleName="Bank Branch Manager Attestation Desk">
                <BankManagerPortal
                  fdrs={fdrs}
                  targetFdrUid={targetBankFdrUid}
                  onSelectFdr={setTargetBankFdrUid}
                  onAttestationSubmitted={loadData}
                  onReturnToScrutiny={() => {
                    const dbOfficer = userPresets.find(p => p.role === 'AICTE_SCRUTINY_OFFICER');
                    if (dbOfficer) {
                      setCurrentSession({
                        role: dbOfficer.role,
                        userId: dbOfficer.user_id,
                        userName: dbOfficer.user_name,
                        designation: dbOfficer.designation,
                        department: dbOfficer.department,
                        institutionId: dbOfficer.institution_id,
                        institutionPid: dbOfficer.institution_pid,
                        institutionName: dbOfficer.institution_name,
                        bankName: dbOfficer.bank_name,
                        branchName: dbOfficer.branch_name,
                      });
                    } else {
                      const officerPreset = DEMO_PRESETS.find(p => p.session.role === 'AICTE_SCRUTINY_OFFICER');
                      if (officerPreset) {
                        setCurrentSession(officerPreset.session);
                      }
                    }
                    setScrutinySubMenu('BANK_GATEWAY');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </ErrorBoundary>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
