import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PublicLandingPage } from './components/PublicLandingPage';
import { AphDepositNormsPage } from './components/AphDepositNormsPage';
import { CircularsPage } from './components/CircularsPage';
import { LoginPage } from './components/LoginPage';
import { PortalDirectoryPage } from './components/PortalDirectoryPage';
import { AuthenticatedDashboard } from './components/AuthenticatedDashboard';
import { BackendConnectionAlert } from './components/BackendConnectionAlert';
import { GovFooter } from './components/GovFooter';
import { DEMO_PRESETS } from './components/PresenterDemoBar';
import { PORTAL_SECTIONS_DATA } from './data/portalPagesData';
import type { UserRole, Institution, FDRInstrument, AuditLog, DashboardSummary, UserSession, UserPreset, SystemState } from './types';
import { api, getApiBase, getResolvedBackendUrl } from './services/api';
import { Lock, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const navigate = useNavigate();

  // Session State: persisted in sessionStorage to survive page refresh and back-forward navigation
  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('trustledger_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentSession) {
      sessionStorage.setItem('trustledger_user_session', JSON.stringify(currentSession));
    } else {
      sessionStorage.removeItem('trustledger_user_session');
    }
  }, [currentSession]);

  // Data & Global state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(1);
  const [fdrs, setFdrs] = useState<FDRInstrument[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [_systemState, setSystemState] = useState<SystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const loadData = async () => {
    setIsRetrying(true);
    try {
      setError(null);
      const [sumRes, instRes, fdrRes, auditRes, usersRes, stateRes] = await Promise.all([
        api.getSummary(),
        api.getInstitutions(),
        api.getFdrs(),
        api.getAuditLogs(),
        api.getUsers().catch(() => []),
        api.getSystemState().catch(() => null),
      ]);

      setSummary(sumRes);
      setInstitutions(instRes);
      setFdrs(fdrRes);
      setLogs(auditRes);
      if (usersRes && usersRes.length > 0) setUserPresets(usersRes);
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
    if (session.institutionId) {
      setSelectedInstitutionId(session.institutionId);
    } else if (session.institutionPid) {
      const found = institutions.find(i => i.pid === session.institutionPid);
      if (found) setSelectedInstitutionId(found.id);
    }
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentSession(null);
    navigate('/');
  };

  // Active institution details (Strictly isolate for Nodal Officer matching their PID)
  const activeInstitution = (currentSession?.role === 'INSTITUTION_NODAL_OFFICER' && (currentSession.institutionPid || currentSession.institutionId))
    ? (institutions.find(i => i.pid === currentSession.institutionPid) || institutions.find(i => i.id === currentSession.institutionId) || institutions[0])
    : (institutions.find((i) => i.id === selectedInstitutionId) || institutions[0]);

  // College-filtered FDRs strictly isolated by PID / institution_id
  const collegeFdrs = activeInstitution 
    ? fdrs.filter(f => f.institution_id === activeInstitution.id || f.institution?.pid === activeInstitution.pid)
    : [];

  const activeRole: UserRole = currentSession ? currentSession.role : 'INSTITUTION_NODAL_OFFICER';

  // AICTE Requirement 4: Pure UTC Date-Math Warning Banner computation for Nodal Officer
  const nodalWarningState = useMemo(() => {
    if (activeRole !== 'INSTITUTION_NODAL_OFFICER') return null;

    const activeFdr = collegeFdrs.find(f => f.lifecycle_status !== 'RENEWED_SUPERSEDED' && f.lifecycle_status !== 'RELEASE_APPROVED_NOC_ISSUED') || collegeFdrs[0];
    if (!activeFdr) return null;

    const matStr = activeFdr.bankAttestedMaturityDate || activeFdr.bank_confirmed_maturity_date || activeFdr.inst_maturity_date;
    if (!matStr) return null;

    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const parts = matStr.split('T')[0].split('-');
    if (parts.length < 3) return null;
    const matUtc = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const daysRemaining = Math.ceil((matUtc - todayUtc) / (1000 * 60 * 60 * 24));

    const isExpired = daysRemaining < 0 || activeFdr.lifecycleState === 'EXPIRED_ACTION_REQUIRED' || activeFdr.lifecycle_status === 'MATURED_ACTION_PENDING';
    const isT30 = !isExpired && (daysRemaining <= 30 || activeFdr.lifecycleState === 'MATURITY_T30' || activeFdr.lifecycle_status === 'APPROACHING_MATURITY_T30');
    const isT60 = !isExpired && !isT30 && (daysRemaining <= 60 || activeFdr.lifecycleState === 'MATURITY_T60');
    const isT90 = !isExpired && !isT30 && !isT60 && (daysRemaining <= 90 || activeFdr.lifecycleState === 'MATURITY_T90' || activeFdr.lifecycle_status === 'APPROACHING_MATURITY_T90');

    if (isExpired) {
      return {
        type: 'EXPIRED' as const,
        daysRemaining,
        bankName: activeFdr.inst_bank_name || 'Scheduled Commercial Bank',
        matDate: matStr,
        fdrUid: activeFdr.fdr_uid,
        title: 'CRITICAL STATUTORY NOTICE: Security Deposit Has Matured & Expired',
        badge: `${Math.abs(daysRemaining)} DAYS OVERDUE • EXPIRED_ACTION_REQUIRED`,
        tag: 'EoA Soft-Hold Imposed',
        description: `Your security deposit (${activeFdr.fdr_uid}) with ${activeFdr.inst_bank_name} matured on ${matStr}. Under AICTE APH regulations, renewal or authorized discharge is required immediately to prevent regulatory soft-hold on your institution's Annual Extension of Approval (EoA). Renewal workflow is now unlocked.`
      };
    }

    if (isT30 || isT60 || isT90) {
      const noticeLabel = isT30 ? 'T-30 Notice' : isT60 ? 'T-60 Notice' : 'T-90 Notice';
      const stateTag = isT30 ? 'MATURITY_T30' : isT60 ? 'MATURITY_T60' : 'MATURITY_T90';
      return {
        type: 'WARNING' as const,
        daysRemaining,
        bankName: activeFdr.inst_bank_name || 'Scheduled Commercial Bank',
        matDate: matStr,
        fdrUid: activeFdr.fdr_uid,
        title: `STATUTORY MATURITY NOTICE: Security Deposit Approaching Expiration (${noticeLabel})`,
        badge: `${daysRemaining} DAYS REMAINING • ${stateTag}`,
        tag: 'Renewal Workflow Unlocked',
        description: `Your security deposit (${activeFdr.fdr_uid}) with ${activeFdr.inst_bank_name} will mature in ${daysRemaining} days (${matStr}). In accordance with AICTE Approval Process Handbook (APH 2026-31) Clause 2.14, the renewal workflow is now unlocked.`
      };
    }

    return null;
  }, [collegeFdrs, activeRole]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Global Backend Connection Notification Bar */}
      <BackendConnectionAlert
        error={error}
        onRetry={loadData}
        isRetrying={isRetrying}
      />

      {/* Global Two-Tier UX4G / GIGW 3.0 Official Government Header */}
      <Navbar
        currentSession={currentSession}
        onLogout={handleLogout}
      />

      {/* Main Routed Content Area */}
      <div className="flex-1 flex flex-col">
        <Routes>
          {/* 1. Official National Public Landing Page */}
          <Route
            path="/"
            element={
              <PublicLandingPage
                onLoginSuccess={handleLoginSuccess}
                presets={userPresets}
                currentSession={currentSession}
              />
            }
          />

          {/* 2. Web Portal Login (Centered Jan Parichay SSO Authentication Page) */}
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                presets={userPresets}
              />
            }
          />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
          <Route path="/sso" element={<Navigate to="/login" replace />} />

          {/* 3. Dedicated APH Chapter IV Deposit Norms Breakdown Page */}
          <Route
            path="/deposit-norms"
            element={<AphDepositNormsPage onBack={() => navigate('/')} />}
          />
          <Route path="/aph-norms" element={<Navigate to="/deposit-norms" replace />} />

          {/* 4. Dedicated Gazette Circulars, SOPs & Manuals Repository */}
          <Route path="/circulars" element={<CircularsPage />} />
          <Route path="/bulletins" element={<Navigate to="/circulars" replace />} />

          {/* 5. Authenticated Workbench Dashboard */}
          <Route
            path="/dashboard"
            element={
              currentSession ? (
                <AuthenticatedDashboard
                  currentSession={currentSession}
                  setCurrentSession={setCurrentSession}
                  institutions={institutions}
                  selectedInstitutionId={selectedInstitutionId}
                  setSelectedInstitutionId={setSelectedInstitutionId}
                  fdrs={fdrs}
                  logs={logs}
                  summary={summary}
                  activeInstitution={activeInstitution}
                  collegeFdrs={collegeFdrs}
                  nodalWarningState={nodalWarningState}
                  loadData={loadData}
                  userPresets={userPresets}
                  loading={loading}
                />
              ) : (
                <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                  <div className="max-w-xl mx-auto bg-white rounded-xl border-2 border-[#1E3A8A] p-8 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
                    <div className="w-16 h-16 bg-blue-50 text-[#1E3A8A] border border-blue-200 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono">
                        AUTHENTICATION REQUIRED
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#002147] tracking-tight">
                        Regulatory Workbench Access
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Access to the AICTE e-FDR Registry, Scrutiny Desk, and Core Banking Attestation Gateway requires an active session via Jan Parichay Single Sign-On (SSO).
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => navigate('/login')}
                          className="w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-[#002147] hover:bg-[#1E3A8A] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                        >
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Go to Centered Login Gateway</span>
                        </button>
                      </div>
                    </div>

                    {/* Fast Evaluator 1-Click Login Shortcuts */}
                    <div className="pt-4 border-t border-slate-200 text-left space-y-2.5">
                      <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block text-center">
                        ⚡ Select Evaluator Role to Enter Workbench:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(userPresets.length > 0 ? userPresets : DEMO_PRESETS).slice(0, 4).map((preset: any, idx: number) => {
                          const sess = preset.session || {
                            role: preset.role,
                            userId: preset.user_id,
                            userName: preset.user_name,
                            designation: preset.designation,
                            department: preset.department,
                            institutionId: preset.institution_id,
                            institutionPid: preset.institution_pid
                          };
                          return (
                            <button
                              key={idx}
                              onClick={() => handleLoginSuccess(sess)}
                              className="p-3 text-left bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer group"
                            >
                              <span className="font-bold text-xs text-blue-900 block truncate group-hover:text-blue-950">
                                {idx + 1}. {preset.label || sess.userName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                {sess.role}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-4 text-xs font-semibold">
                      <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Return to Public Portal</span>
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => navigate('/deposit-norms')}
                        className="text-blue-900 hover:underline cursor-pointer"
                      >
                        View APH Deposit Norms
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
          />
          <Route path="/portal" element={<Navigate to="/dashboard" replace />} />

          {/* 5. Dynamically Generated Dedicated Pages for every Navbar Section & Sub-Page */}
          {PORTAL_SECTIONS_DATA.map((section) => (
            <React.Fragment key={section.id}>
              {/* Section Hub Route (e.g. /about-us, /newsroom, /bureaus, etc.) */}
              <Route
                path={section.path}
                element={<PortalDirectoryPage section={section} />}
              />
              
              {/* Sub-Page Routes (e.g. /about-us/overview, /bureaus/regulation, etc.) */}
              {section.subPages.map((subPage) => (
                <Route
                  key={subPage.path}
                  path={subPage.path}
                  element={<PortalDirectoryPage page={subPage} section={section} />}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Route Aliases & Redirects */}
          <Route path="/about" element={<Navigate to="/about-us" replace />} />
          <Route path="/about/overview" element={<Navigate to="/about-us/overview" replace />} />
          <Route path="/about-us/deposit-norms" element={<Navigate to="/deposit-norms" replace />} />
          <Route path="/bureaus/deposit-norms" element={<Navigate to="/deposit-norms" replace />} />
          <Route path="/bulletins/deposit-norms" element={<Navigate to="/deposit-norms" replace />} />
          <Route path="/bulletins/circulars" element={<Navigate to="/circulars" replace />} />
          <Route path="/search" element={<Navigate to="/statistics/dashboard" replace />} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Official Government Footer (Unified Bottom Placement) */}
      <GovFooter />

    </div>
  );
};

export default App;
