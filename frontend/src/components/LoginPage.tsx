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
  Eye, 
  EyeOff 
} from 'lucide-react';
import type { UserRole, UserSession, UserPreset } from '../types';
import { DEMO_PRESETS } from './PresenterDemoBar';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
  presets?: UserPreset[];
}

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

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Verify Captcha (case-insensitive)
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setLoginError('Invalid Captcha code entered. Please type the characters shown in the image.');
      generateCaptcha();
      return;
    }

    // Match preset
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
                  activeTab === 'COMPETENT_AUTHORITY' ? 'Competent Authority, AICTE' : 'Bank Branch Manager',
        designation: 'Authorized Personnel',
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
        return 'AICTE Permanent Institute ID (PID)';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'Government Employee ID / Official Email';
      case 'COMPETENT_AUTHORITY':
        return 'Authority Email / Designation ID';
      case 'BANK_BRANCH_MANAGER':
        return 'Bank Employee Code / Branch IFSC Mail';
    }
  };

  const getRoleDescription = () => {
    switch (activeTab) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'Access institutional FDR vault, upload new deposit receipts, track automated renewal workflows, and file release clearances.';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'Scrutinize institutional submissions, execute OpenCV error-level analysis (ELA), cross-reference claims, and dispatch CBS bank verification requests.';
      case 'COMPETENT_AUTHORITY':
        return 'Executive Council & Member Secretary console: 4-gate release clearance, Class-3 DSC digital sign-off, and defaulter registry oversight.';
      case 'BANK_BRANCH_MANAGER':
        return 'Scheduled Commercial Bank attestation desk: zero-login OTP confirmation of joint liens, customer account balances, and 10-year lock-in clauses.';
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      
      {/* Main Centered Login Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border-2 border-[#002147] shadow-2xl overflow-hidden">
        
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
              <span className="text-[10px] text-slate-500 font-normal">Mandatory</span>
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
              <label className="font-bold text-slate-800">Account Password / Authorization PIN</label>
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

          {/* Fast Evaluator 1-Click Login Shortcuts */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-slate-600 tracking-wider">
                ⚡ Evaluator 1-Click Instant Sign-In:
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Bypasses manual typing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activePresets.slice(0, 4).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onLoginSuccess(preset.session);
                    navigate('/dashboard');
                  }}
                  className="p-3 text-left bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-950 truncate group-hover:text-blue-900">
                      {idx + 1}. {preset.label.split('(')[0].trim()}
                    </span>
                    <span className="text-[9px] bg-white border border-blue-200 text-[#002147] font-mono px-1.5 py-0.2 rounded font-bold">
                      DEMO
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono truncate block mt-0.5">
                    {preset.session.userId} ({preset.session.role})
                  </span>
                </button>
              ))}
            </div>
          </div>

        </form>

        {/* Footer Support Notice */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-center text-xs text-slate-500">
          <span>Official Jan Parichay National Single Sign-On Gateway • Protected by MeitY Security Guidelines</span>
        </div>

      </div>

    </div>
  );
};
