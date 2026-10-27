import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPISummary } from './components/KPISummary';
import { FDRRegistryTable } from './components/FDRRegistryTable';
import { AuditLedgerViewer } from './components/AuditLedgerViewer';
import { InstitutionsList } from './components/InstitutionsList';
import { DocumentVerificationDesk } from './components/DocumentVerificationDesk';
import { BankVerificationGateway } from './components/BankVerificationGateway';
import { BankManagerPortal } from './components/BankManagerPortal';
import { DAGLineageWorkbench } from './components/DAGLineageWorkbench';
import { ReleaseClearanceWorkbench } from './components/ReleaseClearanceWorkbench';
import { NodalStatusPipelineView } from './components/NodalStatusPipelineView';
import { NodalFDRSubmissionDesk } from './components/NodalFDRSubmissionDesk';
import { CircularsAndManuals } from './components/CircularsAndManuals';
import { PublicLandingPage } from './components/PublicLandingPage';
import { PresenterDemoBar, DEMO_PRESETS } from './components/PresenterDemoBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BackendConnectionAlert } from './components/BackendConnectionAlert';
import { GovFooter } from './components/GovFooter';
import type { UserRole, Institution, FDRInstrument, AuditLog, DashboardSummary, UserSession, UserPreset, EvaluationScenario, SystemState } from './types';
import { api, getApiBase, getResolvedBackendUrl } from './services/api';
import { 
  FileSpreadsheet, 
  Lock, 
  Building2, 
  Scan, 
  Landmark, 
  KeyRound, 
  GitBranch, 
  Crown, 
  BookOpen, 
  CheckCircle2, 
  FileCheck2, 
  ChevronRight, 
  ShieldAlert, 
  ArrowLeft,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

export const App: React.FC = () => {
  // Session State: starts null for Public Landing / SSO Login
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);

  // Sub-menu states for each role (simplifying to strictly 3-4 items!)
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

  const [viewingCirculars, setViewingCirculars] = useState<boolean>(false);

  // Data & Global state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(1);
  const [fdrs, setFdrs] = useState<FDRInstrument[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [evaluationScenarios, setEvaluationScenarios] = useState<EvaluationScenario[]>([]);
  const [_systemState, setSystemState] = useState<SystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [targetBankFdrUid, setTargetBankFdrUid] = useState<string>('FDR-2026-309');
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const loadData = async () => {
    setIsRetrying(true);
    try {
      setError(null);
      const [sumRes, instRes, fdrRes, auditRes, usersRes, scenariosRes, stateRes] = await Promise.all([
        api.getSummary(),
        api.getInstitutions(),
        api.getFdrs(),
        api.getAuditLogs(),
        api.getUsers().catch(() => []),
        api.getEvaluationScenarios().catch(() => []),
        api.getSystemState().catch(() => null),
      ]);

      setSummary(sumRes);
      setInstitutions(instRes);
      setFdrs(fdrRes);
      setLogs(auditRes);
      if (usersRes && usersRes.length > 0) setUserPresets(usersRes);
      if (scenariosRes && scenariosRes.length > 0) setEvaluationScenarios(scenariosRes);
      if (stateRes) setSystemState(stateRes);

      if (instRes.length > 0 && selectedInstitutionId === null) {
        setSelectedInstitutionId(instRes[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load portal data', err);
      const targetBase = getApiBase();
      const backendUrl = getResolvedBackendUrl();
      const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');

      if (isTimeout) {
        setError(`Connection to [${targetBase}] timed out after 60s. If the service is running on Render free tier, it may need another moment to finish spinning up.`);
      } else if (!backendUrl) {
        setError(`Unable to reach backend at [${targetBase}]. For local dev, verify FastAPI is running on port 8000. For Vercel, redeploy after configuring BACKEND_URL, or use 'Configure Backend URL' below.`);
      } else {
        setError(`Backend API at [${targetBase}] returned an error or is waking up (${err?.message || 'Network Error'}).`);
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentSession(session);
    setViewingCirculars(false);

    // If an institution user logs in, sync selectedInstitutionId
    if (session.institutionId) {
      setSelectedInstitutionId(session.institutionId);
    } else if (session.institutionPid) {
      const found = institutions.find(i => i.pid === session.institutionPid);
      if (found) setSelectedInstitutionId(found.id);
    }
  };

  const handleLogout = () => {
    setCurrentSession(null);
    setViewingCirculars(false);
  };

  const handleResetSeed = async () => {
    setIsResetting(true);
    try {
      await api.resetSeedDatabase();
      await loadData();
    } catch (err) {
      console.error('Failed to reset seed', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Quick navigation handler for SIH26265 Evaluation Scenarios Check
  const handleNavigateToScenario = (scenarioId: number) => {
    // 1. Close circulars repository overlay if open
    setViewingCirculars(false);

    // 2. Ensure user is authenticated into an administrative session
    if (!currentSession || currentSession.role !== 'AICTE_SCRUTINY_OFFICER') {
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
    }

    // Helper for robust scrolling across async React render cycles
    const scrollToTarget = (elementId: string) => {
      let attempts = 0;
      const maxAttempts = 30; // 30 * 60ms = 1800ms max polling
      const interval = setInterval(() => {
        attempts++;
        const el = document.getElementById(elementId);
        if (el) {
          clearInterval(interval);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Highlight visual cue for evaluators
          el.classList.add('ring-4', 'ring-[#1E3A8A]', 'ring-offset-4', 'transition-all', 'duration-500');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-[#1E3A8A]', 'ring-offset-4', 'transition-all', 'duration-500');
          }, 2500);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    };

    // 3. Dispatch to the exact workflow required by the scenario
    switch (scenarioId) {
      case 1: // New FDR Submission: Links to Document Upload & Verification
        setScrutinySubMenu('FORENSICS');
        scrollToTarget('document-verification-desk');
        break;

      case 2: // Validity Tracking: Links to Centralized Repository / Bank Gateway
        setScrutinySubMenu('SCRUTINY_INBOX');
        scrollToTarget('centralized-fdr-repository');
        break;

      case 3: // Approaching Maturity: Watchdog Surveillance Matrix & Alert Feed
        setScrutinySubMenu('RELEASE_WATCHLIST');
        scrollToTarget('countdown-matrix-section');
        break;

      case 4: // Renewal & Replacement: Links to Deposit History DAG Graph
        setScrutinySubMenu('RELEASE_WATCHLIST');
        scrollToTarget('dag-lineage-workbench');
        break;

      case 5: // Discrepancy Identification: Links to AI Forensics & Bank Mismatch View
        setScrutinySubMenu('BANK_GATEWAY');
        const discFdr = fdrs.find(f => f.fdr_uid === 'FDR-2026-309' || f.math_tamper_flag || f.bank_verified_status === 'MISMATCH_FLAGGED');
        setTargetBankFdrUid(discFdr?.fdr_uid || 'FDR-2026-309');
        scrollToTarget('bank-verification-gateway');
        break;

      case 6: // Authorized Release Processing: Links to 4-Gate Refund Workflow
        setScrutinySubMenu('RELEASE_WATCHLIST');
        scrollToTarget('release-clearance-workbench');
        break;

      default:
        setScrutinySubMenu('SCRUTINY_INBOX');
        scrollToTarget('centralized-fdr-repository');
        break;
    }
  };

  // Active institution details (Strictly isolate for Nodal Officer matching their PID)
  const activeInstitution = (currentSession?.role === 'INSTITUTION_NODAL_OFFICER' && (currentSession.institutionPid || currentSession.institutionId))
    ? (institutions.find(i => i.pid === currentSession.institutionPid) || institutions.find(i => i.id === currentSession.institutionId) || institutions[0])
    : (institutions.find((i) => i.id === selectedInstitutionId) || institutions[0]);

  // College-filtered FDRs strictly isolated by PID / institution_id
  const collegeFdrs = activeInstitution 
    ? fdrs.filter(f => f.institution_id === activeInstitution.id || f.institution?.pid === activeInstitution.pid)
    : [];

  // Multi-Tier Escalation Engine state checks (X-Factor #6)
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

  // Determine active role
  const activeRole: UserRole = currentSession ? currentSession.role : 'INSTITUTION_NODAL_OFFICER';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Global Backend Connection Notification Bar */}
      <BackendConnectionAlert
        error={error}
        onRetry={loadData}
        isRetrying={isRetrying}
      />

      {/* ========================================================================= */}
      {/* 1. PUBLIC LANDING & SSO LOGIN (WHEN NOT LOGGED IN)                        */}
      {/* ========================================================================= */}
      {!currentSession ? (
        <>
          <PublicLandingPage
            onLoginSuccess={handleLoginSuccess}
            onOpenCircularsModal={() => setViewingCirculars(true)}
            presets={userPresets}
          />

          {/* Public Landing Demo Controls */}
          <PresenterDemoBar
            currentSession={null}
            onLoginAs={handleLoginSuccess}
            onLogout={handleLogout}
            onResetSeed={handleResetSeed}
            isResetting={isResetting}
            onNavigateToScenario={handleNavigateToScenario}
            presets={userPresets}
            scenarios={evaluationScenarios}
          />

          {/* Full Screen Circulars Viewer Overlay if opened from Landing Page */}
          {viewingCirculars && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-[#f8f9fa] rounded-lg border-2 border-[#1a365d] shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto p-6 relative">
                <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-base text-[#1a365d]">
                      Official Ministry & AICTE Circulars, SOPs & User Manuals Repository
                    </h3>
                  </div>
                  <button
                    onClick={() => setViewingCirculars(false)}
                    className="px-3 py-1 bg-[#1a365d] hover:bg-blue-900 text-white rounded text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Close Repository [✕]
                  </button>
                </div>
                <CircularsAndManuals />
              </div>
            </div>
          )}
        </>
      ) : (

        /* ========================================================================= */
        /* 2. ISOLATED ROLE DASHBOARDS (SIMPLIFIED GOVERNMENT WORKBENCH)             */
        /* ========================================================================= */
        <>
          {/* Top Government Navigation Bar */}
          <Navbar
            currentSession={currentSession}
            onLogout={handleLogout}
            onOpenCirculars={() => setViewingCirculars(prev => !prev)}
          />

          {/* Main Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

            {/* If viewing circulars in logged-in view */}
            {viewingCirculars ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-xs text-blue-950">
                      Official Gazette Repository • Circulars, SOPs & User Manuals
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingCirculars(false)}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-[#1a365d] hover:bg-blue-900 text-white rounded text-xs font-semibold cursor-pointer shadow-sm transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Portal Desk</span>
                  </button>
                </div>
                <CircularsAndManuals />
              </div>
            ) : (

              <>
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
                                <span>[WhatsApp & SMS Alert Automatically Dispatched to College Principal]</span>
                              </span>
                            )}

                            {activeInstitution?.pending_pgrc_penalties > 0 || activeInstitution?.unpaid_salary_complaints || activeInstitution?.pending_court_cases ? (
                              <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-red-50 text-red-800 border border-red-300 px-2.5 py-1 rounded">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                <span>COMPLIANCE HOLD (₹{(activeInstitution.pending_pgrc_penalties/100000).toFixed(2)}L Dues)</span>
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

                    {/* Isolated 4-Item NSWS Sidebar + Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Sidebar Menu (NSWS Deep Authority Navy #0F2547) */}
                      <div className="lg:col-span-3 bg-[#0F2547] text-slate-100 rounded-lg border border-slate-800 shadow-md p-3.5 space-y-2">
                        <div className="px-3 py-2 border-b border-slate-700/60 mb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/80 block">
                            VidyaKosh Services
                          </span>
                          <h4 className="text-xs font-bold text-white tracking-tight">FDR Lifecycle Desk</h4>
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
                            <span>1. My Submitted FDRs</span>
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
                            <span>2. Online FDR Submission</span>
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
                            <span>3. Renewal / Merger Update</span>
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
                            <span>4. Apply for Release (NOC)</span>
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
                              institution={activeInstitution}
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
                              onSwitchRole={(role, targetUid) => {
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
                                  Cryptographic SHA-256 Ledger & AICTE Defaulter Oversight
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

              </>
            )}

          </main>

          {/* Official Government of India UX4G & GIGW 3.0 Footer */}
          <GovFooter />

          {/* Logged-in Presenter Demo Controls (Hidden for Institution Nodal Officer) */}
          {currentSession?.role !== 'INSTITUTION_NODAL_OFFICER' && (
            <PresenterDemoBar
              currentSession={currentSession}
              onLoginAs={handleLoginSuccess}
              onLogout={handleLogout}
              onResetSeed={handleResetSeed}
              isResetting={isResetting}
              onNavigateToScenario={handleNavigateToScenario}
              presets={userPresets}
              scenarios={evaluationScenarios}
            />
          )}
        </>
      )}

    </div>
  );
};

export default App;
