import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Building2, 
  FileCheck2, 
  Crown, 
  Landmark, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle,
  Eye, 
  EyeOff,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import type { UserRole, UserSession, UserPreset } from '../types';
import { DEMO_PRESETS } from './PresenterDemoBar';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
  presets?: UserPreset[];
}

interface RegisteredCollegeCredential {
  id: number;
  pid: string;
  name: string;
  location: string;
  nodalOfficer: string;
  designation: string;
  password: string;
  scenario: string;
  statusBadge: string;
  statusColor: string;
  depositAmount: string;
}

const REGISTERED_COLLEGES: RegisteredCollegeCredential[] = [
  {
    id: 1,
    pid: '1-100200301',
    name: 'Apex Institute of Technology, Lucknow',
    location: 'Lucknow, Uttar Pradesh (North Region)',
    nodalOfficer: 'Dr. Rameshwar Sharma',
    designation: 'Registrar & Nodal Officer',
    password: 'Apex@2026#FDR',
    scenario: '10-Year Full Maturity Completed (Zero Violations • Clean Tripartite Clearance)',
    statusBadge: 'Matured (Release Ready)',
    statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    depositAmount: '₹35,00,000'
  },
  {
    id: 2,
    pid: '1-400500602',
    name: 'Vanguard College of Engineering, Pune',
    location: 'Pune, Maharashtra (West Region)',
    nodalOfficer: 'Prof. Sneha Deshmukh',
    designation: 'Finance Officer & Nodal Lead',
    password: 'Apex@2026#FDR',
    scenario: 'Approaching Maturity (T-30 Notice • Renewal Workflow Active)',
    statusBadge: 'T-30 Notice (Renewal Active)',
    statusColor: 'bg-amber-50 text-amber-800 border-amber-300',
    depositAmount: '₹35,00,000'
  },
  {
    id: 3,
    pid: '1-700800903',
    name: 'Deccan School of Management, Hyderabad',
    location: 'Hyderabad, Telangana (South Region)',
    nodalOfficer: 'Dr. K. V. Rao',
    designation: 'Dean & Authorized Signatory',
    password: 'Apex@2026#FDR',
    scenario: 'Active Tripartite Lock-in (CBS Endorsed Joint Lien • Compliant Stand)',
    statusBadge: 'Active Compliant',
    statusColor: 'bg-blue-50 text-blue-800 border-blue-300',
    depositAmount: '₹15,00,000'
  },
  {
    id: 4,
    pid: '1-900100204',
    name: 'Shivalik Polytechnic Institute, Dehradun',
    location: 'Dehradun, Uttarakhand (North Region)',
    nodalOfficer: 'Er. Vikram Negi',
    designation: 'Principal & Depository Representative',
    password: 'Apex@2026#FDR',
    scenario: 'Matured Past Statutory Term (Action Required • Extension/Discharge Pending)',
    statusBadge: 'Overdue (Action Required)',
    statusColor: 'bg-red-50 text-red-800 border-red-300',
    depositAmount: '₹15,00,000'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  presets
}) => {
  const navigate = useNavigate();

  const activePresets = (presets && presets.length > 0)
    ? presets.map(p => ({
        label: p.label || p.user_name,
        icon: p.icon || '👤',
        session: {
          role: p.role,
          userId: p.user_id,
          userName: p.user_name,
          designation: p.designation,
          department: p.department,
          institutionId: p.institution_id,
          institutionPid: p.institution_pid,
          institutionName: p.institution_name,
          bankName: p.bank_name,
          branchName: p.branch_name,
        }
      }))
    : DEMO_PRESETS;

  // 4 SSO Role Tabs
  const [activeTab, setActiveTab] = useState<UserRole>('INSTITUTION_NODAL_OFFICER');

  // Form Fields
  const [userId, setUserId] = useState<string>('1-100200301');
  const [password, setPassword] = useState<string>('Apex@2026#FDR');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaCode, setCaptchaCode] = useState<string>('7K9PX');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadedCollegeNotification, setLoadedCollegeNotification] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate realistic random alphanumeric Captcha
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setLoginError(null);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Update default placeholder/field values when changing role tabs
  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setLoginError(null);
    if (role === 'INSTITUTION_NODAL_OFFICER') {
      setUserId('1-100200301');
      setPassword('Apex@2026#FDR');
    } else if (role === 'AICTE_SCRUTINY_OFFICER') {
      setUserId('officer.rb@aicte-india.org');
      setPassword('Aicte@RB#2026');
    } else if (role === 'COMPETENT_AUTHORITY') {
      setUserId('ms@aicte-india.org');
      setPassword('MemberSecretary#2026');
    } else if (role === 'BANK_BRANCH_MANAGER') {
      setUserId('mgr.pune@sbi.co.in');
      setPassword('SbiManager@2026');
    }
  };

  // Load college credentials into form
  const handleLoadCollegeCredentials = (college: RegisteredCollegeCredential) => {
    setActiveTab('INSTITUTION_NODAL_OFFICER');
    setUserId(college.pid);
    setPassword(college.password);
    setLoginError(null);
    setLoadedCollegeNotification(`Credentials loaded for ${college.name}. Simply enter the Captcha code above to proceed!`);
    setTimeout(() => setLoadedCollegeNotification(null), 5000);

    const formEl = document.getElementById('login-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Instant login as a specific college
  const handleInstantCollegeLogin = (college: RegisteredCollegeCredential) => {
    const session: UserSession = {
      role: 'INSTITUTION_NODAL_OFFICER',
      userId: college.pid,
      userName: college.nodalOfficer,
      designation: college.designation,
      institutionId: college.id,
      institutionPid: college.pid,
      institutionName: college.name
    };
    onLoginSuccess(session);
    navigate('/dashboard');
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Verify Captcha (case-insensitive)
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setLoginError('Invalid Captcha code entered. Please type the characters shown in the security box.');
      generateCaptcha();
      return;
    }

    // Check if matching registered college
    const collegePreset = REGISTERED_COLLEGES.find(c => c.pid.toLowerCase() === userId.trim().toLowerCase());
    if (collegePreset && activeTab === 'INSTITUTION_NODAL_OFFICER') {
      onLoginSuccess({
        role: 'INSTITUTION_NODAL_OFFICER',
        userId: collegePreset.pid,
        userName: collegePreset.nodalOfficer,
        designation: collegePreset.designation,
        institutionId: collegePreset.id,
        institutionPid: collegePreset.pid,
        institutionName: collegePreset.name
      });
      navigate('/dashboard');
      return;
    }

    // Match generic presets
    const matchedPreset = activePresets.find(
      p => p.session.userId.toLowerCase() === userId.trim().toLowerCase()
    );

    if (matchedPreset) {
      onLoginSuccess(matchedPreset.session);
      navigate('/dashboard');
    } else {
      // Fallback session for evaluation convenience
      const fallbackSession: UserSession = {
        role: activeTab,
        userId: userId.trim(),
        userName: activeTab === 'INSTITUTION_NODAL_OFFICER' ? 'Institution Nodal Officer' :
                  activeTab === 'AICTE_SCRUTINY_OFFICER' ? 'Scrutiny Officer, AICTE' :
                  activeTab === 'COMPETENT_AUTHORITY' ? 'Member Secretary & Competent Authority' : 'Chief Bank Branch Manager',
        designation: activeTab === 'INSTITUTION_NODAL_OFFICER' ? 'Registrar & Nodal Officer' : 'Authorized Signatory',
        institutionId: activeTab === 'INSTITUTION_NODAL_OFFICER' ? 1 : undefined,
        institutionPid: activeTab === 'INSTITUTION_NODAL_OFFICER' ? userId.trim() : undefined
      };
      onLoginSuccess(fallbackSession);
      navigate('/dashboard');
    }
  };

  const getRoleTabLabel = (role: UserRole) => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'Institute Login (PID)';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'AICTE Scrutiny Officer';
      case 'COMPETENT_AUTHORITY':
        return 'Competent Authority';
      case 'BANK_BRANCH_MANAGER':
        return 'Bank Branch Manager';
    }
  };

  const getUserIdLabel = () => {
    switch (activeTab) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'Permanent Institute ID (PID)';
      case 'AICTE_SCRUTINY_OFFICER':
      case 'COMPETENT_AUTHORITY':
        return 'Official AICTE Email / Username';
      case 'BANK_BRANCH_MANAGER':
        return 'Bank Branch Manager Official CBS Email';
    }
  };

  const getRoleDescription = () => {
    switch (activeTab) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'Permanent Institute ID (PID) access: submit new FDRs, monitor 10-year lock-in maturity status, and request authorized discharge.';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'Regulation Bureau scrutiny desk: evaluate AI OCR forensic extracts, verify 3-way discrepancy flags, and review 4-gate clearance.';
      case 'COMPETENT_AUTHORITY':
        return 'Member Secretary & Executive Council: digital DSC signing of official cryptographic discharge certificates and ledger commit.';
      case 'BANK_BRANCH_MANAGER':
        return 'Scheduled Commercial Bank attestation desk: zero-login OTP confirmation of joint liens, customer account balances, and 10-year lock-in clauses.';
    }
  };

  return (
    <div className="w-full max-w-[97%] 2xl:max-w-[1720px] mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-200">
      
      {/* Toast Notification when credentials are loaded */}
      {loadedCollegeNotification && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 p-4 rounded-xl flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{loadedCollegeNotification}</span>
          </div>
          <button 
            onClick={() => setLoadedCollegeNotification(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Layout: Main Centered Login Card + Evaluator Guidance Box at the side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ===================================================================== */}
        {/* MAIN JAN PARICHAY LOGIN CARD (Column 1-8)                            */}
        {/* ===================================================================== */}
        <div id="login-form-card" className="lg:col-span-8 bg-white rounded-2xl border-2 border-[#002147] shadow-xl overflow-hidden">
          
          {/* Card Header (Jan Parichay & NSWS Unified Theme) */}
          <div className="bg-[#002147] text-white p-6 border-b-4 border-amber-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono bg-white/10 px-2 py-0.5 rounded">
                      NATIONAL SINGLE SIGN-ON (SSO)
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                    Jan Parichay • Web Portal Login
                  </h1>
                  <p className="text-xs text-blue-200 mt-0.5">
                    VidyaKosh e-FDR Management Depository • Regulation Bureau
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-center text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1 rounded-full font-mono shadow-xs shrink-0">
                OFFICIAL ACCESS
              </span>
            </div>
          </div>

          {/* 4 Role Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 border-b border-slate-300 text-xs font-semibold select-none">
            <button
              type="button"
              onClick={() => handleTabChange('INSTITUTION_NODAL_OFFICER')}
              className={`py-3 px-2 text-center transition cursor-pointer border-r border-b sm:border-b-0 border-slate-300 flex items-center justify-center space-x-1.5 ${
                activeTab === 'INSTITUTION_NODAL_OFFICER'
                  ? 'bg-white text-slate-950 font-bold border-b-2 sm:border-b-4 border-b-amber-500 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <span className="truncate">Institute (PID)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('AICTE_SCRUTINY_OFFICER')}
              className={`py-3 px-2 text-center transition cursor-pointer border-r border-b sm:border-b-0 border-slate-300 flex items-center justify-center space-x-1.5 ${
                activeTab === 'AICTE_SCRUTINY_OFFICER'
                  ? 'bg-white text-slate-950 font-bold border-b-2 sm:border-b-4 border-b-amber-500 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">Scrutiny Officer</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('COMPETENT_AUTHORITY')}
              className={`py-3 px-2 text-center transition cursor-pointer border-r border-slate-300 flex items-center justify-center space-x-1.5 ${
                activeTab === 'COMPETENT_AUTHORITY'
                  ? 'bg-white text-slate-950 font-bold border-b-2 sm:border-b-4 border-b-amber-500 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">Authority (MS)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('BANK_BRANCH_MANAGER')}
              className={`py-3 px-2 text-center transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'BANK_BRANCH_MANAGER'
                  ? 'bg-white text-slate-950 font-bold border-b-2 sm:border-b-4 border-b-amber-500 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span className="truncate">Bank Manager</span>
            </button>
          </div>

          {/* Role Explainer Ribbon */}
          <div className="bg-blue-50/70 border-b border-blue-200 px-6 py-3 flex items-start space-x-2.5 text-xs text-blue-950">
            <ShieldCheck className="w-4 h-4 text-[#002147] shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>{getRoleTabLabel(activeTab)}:</strong> {getRoleDescription()}
            </p>
          </div>

          {/* Login Form Body */}
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5">
            
            {/* Error Banner */}
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded text-xs text-red-900 flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* User ID Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{getUserIdLabel()}</span>
                <span className="text-[10px] text-slate-500 font-normal">Pre-filled by default</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter registered credentials..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">Account Password / PIN</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-blue-900 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'} Password</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] transition"
                />
              </div>
            </div>

            {/* Captcha Field (Classic Government Security Verification) */}
            <div className="space-y-1.5 text-left pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                Security Verification (Captcha) <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center space-x-2">
                  {/* Classic Distortion Alphanumeric Display Box */}
                  <div 
                    className="relative h-11 px-4 bg-gradient-to-r from-slate-200 via-amber-50 to-slate-200 border-2 border-slate-400 rounded-lg select-none flex items-center justify-center font-mono font-black text-lg text-slate-800 shadow-inner overflow-hidden w-44 shrink-0"
                    style={{
                      backgroundImage: 'radial-gradient(#94a3b8 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #f8fafc 0.75px)',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 4px 4px'
                    }}
                  >
                    {/* Realistic SVG Distortion Lines & Noise Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                      <line x1="0" y1="8" x2="180" y2="36" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 2" />
                      <line x1="0" y1="34" x2="180" y2="12" stroke="#64748b" strokeWidth="1.2" />
                      <path d="M5 22 Q 45 6, 90 22 T 175 18" fill="none" stroke="#334155" strokeWidth="1.3" />
                      <circle cx="28" cy="14" r="7" fill="none" stroke="#94a3b8" strokeWidth="1" />
                      <circle cx="95" cy="28" r="9" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
                      <circle cx="145" cy="16" r="6" fill="none" stroke="#94a3b8" strokeWidth="1" />
                    </svg>

                    {/* Individual Distorted Characters */}
                    <div className="relative z-10 flex items-center space-x-1.5 tracking-wider font-extrabold italic">
                      {captchaCode.split('').map((char, i) => {
                        const rotations = [-6, 8, -4, 7, -8];
                        const yOffsets = [-1, 2, -2, 1, -1];
                        const colors = ['#1e293b', '#0f172a', '#334155', '#1e3a8a', '#0f172a'];
                        return (
                          <span
                            key={i}
                            className="inline-block"
                            style={{
                              transform: `rotate(${rotations[i % rotations.length]}deg) translateY(${yOffsets[i % yOffsets.length]}px)`,
                              color: colors[i % colors.length],
                              textShadow: '1px 1px 1px rgba(0,0,0,0.25)',
                              fontFamily: i % 2 === 0 ? 'Courier, monospace' : 'Georgia, serif',
                              fontSize: '1.25rem'
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={generateCaptcha}
                    title="Generate new Captcha"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 hover:text-slate-900 cursor-pointer transition flex items-center justify-center shrink-0"
                  >
                    <RefreshCw className="w-4 h-4 text-[#002147]" />
                  </button>
                </div>

                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="Enter Captcha code..."
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-mono uppercase tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#002147] hover:bg-[#003870] active:scale-[0.99] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Authenticate &amp; Open Regulatory Workbench</span>
            </button>

            {/* Notice regarding other roles */}
            <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-800 shrink-0" />
              <span>Switching tabs to Scrutiny Officer, Authority, or Bank Manager automatically fills their credentials. Just type the Captcha!</span>
            </div>

          </form>

          {/* Footer Support Notice */}
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-center text-xs text-slate-500">
            <span>Official Jan Parichay National Single Sign-On Gateway • Protected by MeitY Security Guidelines</span>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* SIDE INFORMATION BOX: CREDENTIALS PRE-CONFIGURED NOTICE (Column 9-12) */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-amber-500 shadow-lg p-6 space-y-4">
            
            <div className="flex items-center space-x-3 text-amber-800">
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-300 shrink-0">
                <KeyRound className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300 font-mono">
                  EVALUATOR GUIDANCE
                </span>
                <h3 className="text-base font-extrabold text-[#002147] tracking-tight mt-0.5">
                  Credentials Pre-Filled by Default
                </h3>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 leading-relaxed font-medium">
              <p>
                <strong>Do not worry about credentials!</strong> All login usernames and passwords across all regulatory roles have been <strong>pre-filled by default</strong> for seamless evaluation.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center shrink-0 text-[11px] mt-0.5 border border-blue-200">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Select Desired Role:</strong>
                  <span className="text-slate-600">Click any tab (Institute, Scrutiny Officer, Authority, or Bank Manager). The correct credentials populate instantly.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center shrink-0 text-[11px] mt-0.5 border border-blue-200">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Type Security Captcha:</strong>
                  <span className="text-slate-600">Enter the 5 distorted characters shown in the security box.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center shrink-0 text-[11px] mt-0.5 border border-blue-200">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Click Authenticate:</strong>
                  <span className="text-slate-600">Access the role's dedicated regulatory workbench desk immediately.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-blue-950 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#002147]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>College Testing Directory</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  To test different institutional lifecycle stages (Matured, Approaching Maturity T-30, Active Compliant, or Overdue), browse the registered colleges directory underneath.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* REGISTERED COLLEGES CREDENTIALS DIRECTORY (Underneath)                    */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        
        {/* Mandatory Prominent Notice & Testing Disclaimer */}
        <div className="bg-amber-50/90 border-l-4 border-amber-600 border border-amber-200 p-4.5 rounded-xl text-xs shadow-xs flex items-start space-x-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold uppercase tracking-wider text-amber-950 block font-mono text-[11px]">
              DEMONSTRATION &amp; TESTING ENVIRONMENT NOTICE
            </span>
            <p className="leading-relaxed font-medium text-slate-700 text-xs sm:text-sm">
              The institutional names, Permanent Institute IDs (PIDs), credentials, and financial values listed below are provided strictly for <strong>demonstration, testing, and evaluation purposes only</strong>. <strong>No actual, confidential, or live institutional data has been used in the making of this application.</strong>
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#002147]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Registered Technical Institutions (Colleges Directory)
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Click <strong>"Load into Form"</strong> on any institution to test its regulatory fixed deposit status in the login portal above.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full self-start sm:self-auto">
            4 SYNTHETIC TEST COLLEGES
          </span>
        </div>

        {/* 4 Registered Colleges Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4.5">
          {REGISTERED_COLLEGES.map((college) => (
            <div 
              key={college.id}
              className="bg-white rounded-xl border-2 border-slate-200 hover:border-[#002147] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                
                {/* College Name & Status Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="p-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg group-hover:bg-[#002147] group-hover:text-white transition-colors">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${college.statusColor}`}>
                      {college.statusBadge}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug group-hover:text-[#002147] transition-colors">
                    {college.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {college.location}
                  </span>
                </div>

                {/* Scenario Context */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700 block mb-0.5">Evaluation Scenario:</span>
                  <p className="leading-tight">{college.scenario}</p>
                </div>

                {/* Credentials Box */}
                <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 space-y-2 text-xs">
                  
                  {/* PID / Username */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono">PID (User ID):</span>
                      <strong className="font-mono text-slate-900 text-xs">{college.pid}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(college.pid, `pid-${college.id}`)}
                      title="Copy PID"
                      className="p-1 text-slate-500 hover:text-blue-900 hover:bg-blue-100 rounded transition cursor-pointer"
                    >
                      {copiedKey === `pid-${college.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-blue-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono">Password:</span>
                      <strong className="font-mono text-slate-900 text-xs">{college.password}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(college.password, `pass-${college.id}`)}
                      title="Copy Password"
                      className="p-1 text-slate-500 hover:text-blue-900 hover:bg-blue-100 rounded transition cursor-pointer"
                    >
                      {copiedKey === `pass-${college.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Nodal Officer Details */}
                  <div className="pt-1.5 border-t border-blue-100 text-[11px] text-slate-600">
                    <span className="text-[10px] text-slate-500 block">Nodal Officer:</span>
                    <span className="font-semibold text-slate-800">{college.nodalOfficer}</span> ({college.designation})
                  </div>

                  {/* Security Deposit Amount */}
                  <div className="pt-1 text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Security Deposit:</span>
                    <strong className="font-mono text-[#002147] font-bold">{college.depositAmount}</strong>
                  </div>

                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleLoadCollegeCredentials(college)}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-[#002147] border border-[#002147] rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#002147]" />
                  <span>Load into Form Above</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantCollegeLogin(college)}
                  className="w-full py-2 px-3 bg-[#002147] hover:bg-[#003870] text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <span>Instant Demo Sign-In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
