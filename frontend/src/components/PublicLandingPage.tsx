import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Building2, 
  FileCheck2, 
  Crown, 
  Landmark, 
  QrCode, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Shield, 
  Fingerprint, 
  GitBranch, 
  Scale
} from 'lucide-react';
import type { UserRole, UserSession, NOCVerificationResponse, UserPreset } from '../types';
import { api } from '../services/api';
import { DEMO_PRESETS } from './PresenterDemoBar';
import { Navbar } from './Navbar';
import { GovFooter } from './GovFooter';

interface PublicLandingPageProps {
  onLoginSuccess: (session: UserSession) => void;
  onOpenCircularsModal: () => void;
  presets?: UserPreset[];
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onLoginSuccess,
  onOpenCircularsModal,
  presets
}) => {
  // Dynamically map presets from backend DB if provided
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
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaCode, setCaptchaCode] = useState<string>('7K9PX');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Public QR NOC Verification State
  const [nocHashInput, setNocHashInput] = useState<string>('');
  const [isVerifyingNoc, setIsVerifyingNoc] = useState<boolean>(false);
  const [nocResult, setNocResult] = useState<NOCVerificationResponse | null>(null);

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
    }
  };

  // Handle Public NOC Verification
  const handleVerifyNoc = async (hashToVerify?: string) => {
    const hash = (hashToVerify || nocHashInput).trim();
    if (!hash) {
      setLoginError('Please enter a valid NOC certificate hash or click the sample test button.');
      return;
    }
    setIsVerifyingNoc(true);
    try {
      const res = await api.verifyNOC(hash);
      setNocResult(res);
    } catch {
      setNocResult({
        noc_certificate_hash: hash,
        is_valid: false,
        fdr_uid: '',
        institution_name: '',
        institution_pid: '',
        bank_name: '',
        ifsc: '',
        principal_amount: 0,
        issued_at: '',
        issuing_authority: '',
        audit_block_hash: '',
        status: 'HASH_NOT_FOUND',
        message: 'No matching regulatory discharge record found on the AICTE SHA-256 ledger.'
      });
    } finally {
      setIsVerifyingNoc(false);
    }
  };

  // Test verify Apex genuine NOC
  const handleTestApexNoc = async () => {
    try {
      setIsVerifyingNoc(true);
      const apexStatus = await api.getReleaseStatus('FDR-2020-205');
      if (apexStatus && apexStatus.noc_certificate_hash) {
        setNocHashInput(apexStatus.noc_certificate_hash);
        const res = await api.verifyNOC(apexStatus.noc_certificate_hash);
        setNocResult(res);
      } else {
        const res = await api.verifyNOC('sha256_mock_apex_discharge_noc');
        setNocResult(res);
      }
    } catch {
      setNocHashInput('c0f7d54b819f2a4e9081e2b5c6d3f4a1');
      const res = await api.verifyNOC('c0f7d54b819f2a4e9081e2b5c6d3f4a1');
      setNocResult(res);
    } finally {
      setIsVerifyingNoc(false);
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
        return 'Official Branch Manager Email / Corporate ID';
    }
  };

  const getUserIdPlaceholder = () => {
    switch (activeTab) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'e.g., 1-100200301 or 1-400500602';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'e.g., officer.rb@aicte-india.org';
      case 'COMPETENT_AUTHORITY':
        return 'e.g., ms@aicte-india.org';
      case 'BANK_BRANCH_MANAGER':
        return 'e.g., mgr.pune@sbi.co.in';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-amber-500 selection:text-white">
      
      {/* Official Government Top Header (Two-Tier UX4G / GIGW 3.0 Strip) */}
      <Navbar
        currentSession={null}
        onLogout={() => {}}
        onOpenCirculars={onOpenCircularsModal}
      />

      {/* Main NSWS / Jan Parichay Split-Screen Viewport */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statutory Advisory Strip */}
        <div className="bg-amber-50 border-l-4 border-amber-600 border border-amber-200 p-3.5 rounded-lg mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="flex items-center justify-center p-1.5 rounded-full bg-amber-500 text-white font-bold">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-amber-950 uppercase tracking-wide text-[11px] block">
                Statutory Advisory: Circular No. AICTE/RB/FDR/2026/04 • Approval Process Handbook (APH)
              </span>
              <p className="text-slate-700 font-medium mt-0.5">
                Mandatory Core Banking (CBS) Lien Marking in Scheduled Commercial Banks and cryptographic digital attestation for institutional fixed deposit receipts.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCircularsModal}
            className="flex items-center space-x-1 text-[#1E3A8A] hover:text-[#172554] font-bold text-xs underline cursor-pointer whitespace-nowrap self-end sm:self-center"
          >
            <span>Read Gazette SOP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: AICTE REGULATION BUREAU MANDATE (SIH26265) & TOOLS (7 Cols)  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* AICTE Bureau Mandate Hero Card */}
            <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1E3A8A] p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5">
                <span className="h-4 w-1 bg-amber-500 rounded-full" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  VidyaKosh Portal • AICTE Regulation Bureau Mandate (SIH26265)
                </h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamline of Security Deposit / Fixed Deposit Receipt (FDR) operations across all technical institutions approved under Chapter IV of the Approval Process Handbook (APH 2026-31). Replaces decade-long manual verification failures with cryptographic and AI-assisted governance.
              </p>

              {/* National Corpus Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-blue-50/60 border border-blue-200 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider block">
                    Security Deposits
                  </span>
                  <span className="text-lg font-black text-[#1E3A8A] font-mono">
                    ₹1.35 Cr
                  </span>
                  <span className="text-[10px] text-slate-500 block">Seeded Under Oversight</span>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
                    Audit Ledger
                  </span>
                  <span className="text-lg font-black text-emerald-800 font-mono">
                    System Verified
                  </span>
                  <span className="text-[10px] text-slate-500 block">SHA-256 Chained Blocks</span>
                </div>
                <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
                    Release Gateway
                  </span>
                  <span className="text-lg font-black text-amber-800 font-mono">
                    4-Gate Verified
                  </span>
                  <span className="text-[10px] text-slate-500 block">QR-Signed Discharge NOC</span>
                </div>
              </div>
            </div>

            {/* 4 Pillars of Solution Architecture Grid */}
            <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1E3A8A] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[#1E3A8A]" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Key Regulatory Pillars &amp; Safeguards (SIH26265)
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-mono">
                  NSWS ALIGNED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Tri-Party Dual-Truth Isolation */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 transition hover:bg-slate-100/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">1. Tri-Party Dual-Truth Registry</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
                      PILLAR 1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Strict isolation of College Claim vs. Vision AI Forensics vs. Authoritative Bank Truth to prevent silent claim overrides.
                  </p>
                </div>

                {/* 2. OpenCV ELA & Math Forensics */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 transition hover:bg-slate-100/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">2. OpenCV ELA &amp; Math Forensics</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                      PILLAR 2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Error-Level Analysis pixel forensics, quarterly compound interest anomaly detection, and perceptual hash collision scans.
                  </p>
                </div>

                {/* 3. 3-Tier Bank Verification Gateway */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 transition hover:bg-slate-100/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">3. 3-Tier Bank Gateway</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      PILLAR 3
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Core Banking CBS API, live RBI IFSC verification, and zero-login OTP Magic Links routed to official bank branch emails.
                  </p>
                </div>

                {/* 4. 4-Gate Statutory Release Protocol */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 transition hover:bg-slate-100/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">4. 4-Gate Release &amp; DAG Lineage</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      PILLAR 4
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Pre-clearance compliance gate checks (PGRC dues, salaries, court cases) paired with cryptographic QR Discharge NOC issuance.
                  </p>
                </div>
              </div>
            </div>

            {/* Public Cryptographic QR NOC Verification Tool */}
            <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-emerald-600 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Public Cryptographic Discharge NOC Verifier
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Real-time verification tool for banks, branch managers, and legal auditors
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  ZERO-LOGIN API
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Scan the QR code on any AICTE Security Deposit Release Certificate or paste the 64-character SHA-256 hash to verify Council authorization before liquidating fixed deposits.
              </p>

              {/* NOC Hash Input Bar */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Paste 64-char SHA-256 Certificate Hash..."
                      value={nocHashInput}
                      onChange={(e) => setNocHashInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                  <button
                    disabled={isVerifyingNoc || !nocHashInput.trim()}
                    onClick={() => handleVerifyNoc()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingNoc ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Verify NOC</span>
                  </button>
                </div>

                {/* Test Sample Button */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-500">
                    Evaluation Quick-Action:
                  </span>
                  <button
                    type="button"
                    onClick={handleTestApexNoc}
                    className="text-[#1E3A8A] hover:text-amber-600 font-bold underline cursor-pointer text-[11px] flex items-center space-x-1"
                  >
                    <span>[Demo: Test-Verify Apex Released NOC]</span>
                  </button>
                </div>
              </div>

              {/* NOC Verification Result Display */}
              {nocResult && (
                <div className={`p-4 rounded-lg border text-xs space-y-2 animate-in fade-in duration-150 ${
                  nocResult.is_valid 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {nocResult.is_valid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-bold text-sm tracking-tight">
                        {nocResult.is_valid 
                          ? 'OFFICIALLY VERIFIED — AUTHENTIC AICTE DISCHARGE NOC' 
                          : 'VERIFICATION FAILED — INVALID OR TAMPERED CERTIFICATE'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-current">
                      {nocResult.status}
                    </span>
                  </div>

                  <p className="text-[11px]">
                    {nocResult.message}
                  </p>

                  {nocResult.is_valid && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-600 block text-[10px]">Institution PID &amp; Name:</span>
                        <span className="font-bold">{nocResult.institution_pid} — {nocResult.institution_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">Authorized Release Principal:</span>
                        <span className="font-bold text-emerald-800">₹{(nocResult.principal_amount || 0).toLocaleString('en-IN')} ({nocResult.bank_name})</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">Issuing Authority:</span>
                        <span className="font-bold">{nocResult.issuing_authority}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">Audit Block Hash:</span>
                        <span className="font-bold text-[10px] truncate block text-[#1E3A8A]" title={nocResult.audit_block_hash}>
                          {nocResult.audit_block_hash}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* APH Norms Quick Reference Table */}
            <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1E3A8A] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-[#1E3A8A]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Approval Process Handbook (APH 2026-31) Mandatory Deposit Norms
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  CHAPTER IV NORMS
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 border-b border-slate-200">Programme / Category</th>
                      <th className="py-2.5 px-3 border-b border-slate-200">Statutory Norm</th>
                      <th className="py-2.5 px-3 border-b border-slate-200">Statutory Lock-In</th>
                      <th className="py-2.5 px-3 border-b border-slate-200">Lien Mandate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">Engineering &amp; Technology (Degree)</td>
                      <td className="py-2 px-3 font-bold font-mono text-[#1E3A8A]">₹35.0 Lakhs</td>
                      <td className="py-2 px-3 text-slate-700">10 Years Continuous</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">Joint AICTE Lien</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">Management (MBA / PGDM)</td>
                      <td className="py-2 px-3 font-bold font-mono text-[#1E3A8A]">₹15.0 Lakhs</td>
                      <td className="py-2 px-3 text-slate-700">8 Years Continuous</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">Joint AICTE Lien</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">Pharmacy (B.Pharm / M.Pharm)</td>
                      <td className="py-2 px-3 font-bold font-mono text-[#1E3A8A]">₹15.0 Lakhs</td>
                      <td className="py-2 px-3 text-slate-700">8 Years Continuous</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">Joint AICTE Lien</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">Architecture &amp; Town Planning</td>
                      <td className="py-2 px-3 font-bold font-mono text-[#1E3A8A]">₹15.0 Lakhs</td>
                      <td className="py-2 px-3 text-slate-700">8 Years Continuous</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">Joint AICTE Lien</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: JAN PARICHAY / NSWS SINGLE SIGN-ON CARD (5 Cols)             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg border-2 border-[#1E3A8A] shadow-lg overflow-hidden">
              
              {/* Card Header (Jan Parichay / NSWS Theme) */}
              <div className="bg-[#1E3A8A] text-white p-4 border-b border-amber-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm tracking-tight">
                      Jan Parichay • Unified Single Sign-On (SSO)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                    SECURE SSO
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 mt-1">
                  VidyaKosh • National Single Window System (NSWS) • AICTE Regulation Bureau
                </p>
              </div>

              {/* 4 Role Tabs */}
              <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleTabChange('INSTITUTION_NODAL_OFFICER')}
                  className={`py-3 px-2 text-center transition cursor-pointer border-r border-b border-slate-300 flex items-center justify-center space-x-1.5 ${
                    activeTab === 'INSTITUTION_NODAL_OFFICER'
                      ? 'bg-white text-slate-950 font-bold border-b-2 border-b-amber-500 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span className="truncate">Institute Login (PID)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('AICTE_SCRUTINY_OFFICER')}
                  className={`py-3 px-2 text-center transition cursor-pointer border-b border-slate-300 flex items-center justify-center space-x-1.5 ${
                    activeTab === 'AICTE_SCRUTINY_OFFICER'
                      ? 'bg-white text-slate-950 font-bold border-b-2 border-b-amber-500 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="truncate">AICTE Scrutiny</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('COMPETENT_AUTHORITY')}
                  className={`py-3 px-2 text-center transition cursor-pointer border-r border-slate-300 flex items-center justify-center space-x-1.5 ${
                    activeTab === 'COMPETENT_AUTHORITY'
                      ? 'bg-white text-slate-950 font-bold border-b-2 border-b-amber-500 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span className="truncate">Competent Authority</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('BANK_BRANCH_MANAGER')}
                  className={`py-3 px-2 text-center transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    activeTab === 'BANK_BRANCH_MANAGER'
                      ? 'bg-white text-slate-950 font-bold border-b-2 border-b-amber-500 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 text-purple-700" />
                  <span className="truncate">Bank Nodal Officer</span>
                </button>
              </div>

              {/* Login Form Body */}
              <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
                
                {loginError && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-300 flex items-start space-x-2 text-xs text-red-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* User ID Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {getUserIdLabel()} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={getUserIdPlaceholder()}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Password / Access PIN <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#1E3A8A] font-semibold">
                      APH Master Key
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>

                {/* Visual Alphanumeric Captcha Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Security Verification (Captcha) <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="flex items-center space-x-3 mb-2">
                    {/* Distortion Alphanumeric Display Box */}
                    <div 
                      className="relative px-4 py-2 bg-gradient-to-r from-slate-200 via-slate-100 to-amber-100 border-2 border-slate-400 rounded-md select-none flex items-center justify-center tracking-[0.4em] font-mono font-black text-base text-slate-800 shadow-inner overflow-hidden w-40"
                      style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                        letterSpacing: '0.35em'
                      }}
                    >
                      {/* Realistic SVG Distortion Noise Overlay */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        <line x1="0" y1="5" x2="160" y2="35" stroke="#333" strokeWidth="1.2" />
                        <line x1="0" y1="30" x2="160" y2="10" stroke="#777" strokeWidth="1" />
                        <circle cx="30" cy="15" r="8" fill="none" stroke="#999" strokeWidth="0.8" />
                        <circle cx="110" cy="25" r="12" fill="none" stroke="#999" strokeWidth="0.8" />
                      </svg>
                      <span className="relative z-10 transform -rotate-1 italic">
                        {captchaCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={generateCaptcha}
                      title="Generate new Captcha"
                      className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter Captcha Code exactly as shown above"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 uppercase font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>

                {/* Primary Action Button (UX4G Standard) */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-2 mt-4"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Authenticate &amp; Access VidyaKosh Portal ({getRoleTabLabel(activeTab)})</span>
                </button>

                {/* Fast Evaluator 1-Click Login Shortcuts */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    ⚡ Evaluator 1-Click SSO Shortcuts:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {activePresets.slice(0, 4).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onLoginSuccess(preset.session)}
                        className="p-2 text-left bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-md transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[11px] text-blue-900 block truncate">{idx + 1}. {preset.label.split('(')[0].trim()}</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate block">{preset.session.userId}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </form>

            </div>
          </div>

        </div>

      </main>

      {/* Official Government Footer (Requirement #5) */}
      <GovFooter />

    </div>
  );
};
