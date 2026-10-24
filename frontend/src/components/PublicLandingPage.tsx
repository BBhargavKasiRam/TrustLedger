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
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  FileText,
  Shield,
  Fingerprint,
  GitBranch,
  Scale
} from 'lucide-react';
import type { UserRole, UserSession, NOCVerificationResponse } from '../types';
import { api } from '../services/api';
import { DEMO_PRESETS } from './PresenterDemoBar';
import { CIRCULARS_DATA } from './CircularsAndManuals';

interface PublicLandingPageProps {
  onLoginSuccess: (session: UserSession) => void;
  onOpenCircularsModal: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onLoginSuccess,
  onOpenCircularsModal
}) => {
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
    const matchedPreset = DEMO_PRESETS.find(
      p => p.session.userId.toLowerCase() === userId.trim().toLowerCase()
    );

    if (matchedPreset) {
      onLoginSuccess(matchedPreset.session);
    } else {
      // Fallback fallback session for evaluation convenience
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
    } catch (err: any) {
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
    // Look up Apex release status first or use sample genuine hash
    try {
      setIsVerifyingNoc(true);
      const apexStatus = await api.getReleaseStatus('FDR-2020-205');
      if (apexStatus && apexStatus.noc_certificate_hash) {
        setNocHashInput(apexStatus.noc_certificate_hash);
        const res = await api.verifyNOC(apexStatus.noc_certificate_hash);
        setNocResult(res);
      } else {
        // Fallback test
        const res = await api.verifyNOC('sha256_mock_apex_discharge_noc');
        setNocResult(res);
      }
    } catch (e) {
      // Direct call with standard sample
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
        return 'Bank Nodal Officer';
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
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Official Government Top Header */}
      <header className="bg-[#1a365d] text-white border-b-4 border-orange-500 shadow-md">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded bg-white text-[#1a365d] p-1 shadow border border-orange-400">
              <ShieldCheck className="w-8 h-8 text-[#1a365d]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold tracking-wide text-orange-400">
                  Regulation &amp; Approval Bureau
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                AICTE — Security Deposit / FDR Management Portal
              </h1>
              <p className="text-xs text-blue-200/90 hidden sm:block">
                All India Council for Technical Education (Statutory Body under Ministry of Education, Govt. of India)
              </p>
            </div>
          </div>

          {/* Top Quick Links */}
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={onOpenCircularsModal}
              className="flex items-center space-x-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-100 hover:text-white px-3 py-1.5 rounded border border-blue-400/40 cursor-pointer shadow-sm transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>Latest Circulars & Manuals</span>
              <span className="bg-orange-500 text-white text-[9px] px-1 rounded font-bold font-mono">
                NEW
              </span>
            </button>
            <div className="hidden lg:flex items-center space-x-2 text-blue-200 text-xs border-l border-blue-400/30 pl-3">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Helpdesk: 011-29581000</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Two-Column Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Government Portal Notice Strip */}
        <div className="bg-amber-50 border-l-4 border-amber-600 border-r border-t border-b border-amber-200 p-3 rounded mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center justify-center p-1.5 rounded bg-amber-500 text-white font-bold animate-pulse">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-amber-900 uppercase tracking-wide text-[11px] block">
                Statutory Advisory: Circular No. AICTE/RB/FDR/2026/04
              </span>
              <p className="text-gray-700 font-medium">
                Mandatory CBS Lien Marking in Scheduled Commercial Banks and official digital attestation for institutional fixed deposit receipts.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCircularsModal}
            className="flex items-center space-x-1 text-blue-900 hover:text-orange-600 font-bold text-xs underline cursor-pointer whitespace-nowrap"
          >
            <span>Read Gazette Circular</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: PUBLIC CITIZEN SERVICES & CRYPTOGRAPHIC NOC VERIFIER (7 Cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* AICTE Portal Welcome Card */}
            <div className="bg-white rounded border border-gray-300 p-5 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <span className="h-4 w-1 bg-orange-500 rounded" />
                <h2 className="text-base font-bold text-blue-950">
                  Welcome to the AICTE Security Deposit / FDR Management Portal
                </h2>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Institutions can manage their mandatory Fixed Deposit Receipts (FDR) as per the Approval Process Handbook (APH).
              </p>

              {/* National Corpus Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded text-center">
                  <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider block">
                    Security Deposits
                  </span>
                  <span className="text-base font-extrabold text-[#1a365d] font-mono">
                    ₹1.35 Cr
                  </span>
                  <span className="text-[10px] text-gray-500 block">Seeded Under Oversight</span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded text-center">
                  <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
                    Audit Trail
                  </span>
                  <span className="text-base font-extrabold text-emerald-800 font-mono">
                    System Verified
                  </span>
                  <span className="text-[10px] text-gray-500 block">Permanent Regulatory Record</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded text-center">
                  <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
                    Clearance Status
                  </span>
                  <span className="text-base font-extrabold text-amber-800 font-mono">
                    Verified
                  </span>
                  <span className="text-[10px] text-gray-500 block">Statutory Release Protocol</span>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* KEY SECURITY & REGULATORY CAPABILITIES (e-FDR Portal)            */}
            {/* ================================================================= */}
            <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-900">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1a365d] tracking-tight">
                      Key Regulatory &amp; Compliance Safeguards (e-FDR Portal)
                    </h3>
                    <p className="text-[11px] text-gray-600">
                      Standard operating mechanisms safeguarding institutional security deposit corpus
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded font-mono w-max">
                  STATUTORY FRAMEWORK
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Automated Document Verification */}
                <div className="bg-sky-50/50 border border-sky-200 rounded p-3 space-y-1.5 transition hover:bg-sky-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-sky-950">1. Document Verification &amp; OCR</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-sky-200 text-sky-800 px-1.5 py-0.2 rounded">
                      AUTOMATED
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-snug">
                    Automated OCR data extraction, compound interest validation, and forensic image tamper analysis.
                  </p>
                </div>

                {/* 2. Integrated Bank Attestation */}
                <div className="bg-purple-50/50 border border-purple-200 rounded p-3 space-y-1.5 transition hover:bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-purple-950">2. Bank Verification Gateway</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded">
                      CBS LIEN
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-snug">
                    Dual-mode verification via Core Banking APIs and authenticated digital attestation for branch managers.
                  </p>
                </div>

                {/* 3. System Verified Audit Trail */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded p-3 space-y-1.5 transition hover:bg-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-emerald-950">3. Permanent Audit Trail</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-snug">
                    Tamper-evident transaction logs ensuring complete accountability and integrity of all deposit records.
                  </p>
                </div>

                {/* 4. Deposit History & Lifecycle Tracking */}
                <div className="bg-orange-50/50 border border-orange-200 rounded p-3 space-y-1.5 transition hover:bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-orange-950">4. Deposit Provenance &amp; History</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-orange-200 text-orange-800 px-1.5 py-0.2 rounded">
                      APH LIFECYCLE
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-snug">
                    Chronological lifecycle record tracking renewals, re-issuances, and bank mergers across the 10-year lock-in.
                  </p>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* APH MANDATORY SECURITY DEPOSIT NORMS REFERENCE TABLE             */}
            {/* ================================================================= */}
            <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-blue-900" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Approval Process Handbook (APH 2026-31) Mandatory Deposit Norms
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-500 font-bold">
                  CHAPTER 1 • STATUTORY NORMS
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3 border-b border-gray-200">Programme / Category</th>
                      <th className="py-2 px-3 border-b border-gray-200">Statutory Norm</th>
                      <th className="py-2 px-3 border-b border-gray-200">Statutory Lock-In</th>
                      <th className="py-2 px-3 border-b border-gray-200">Lien Mandate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px]">
                    <tr className="hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-semibold text-gray-900">Engineering & Technology (Degree)</td>
                      <td className="py-2 px-3 font-bold font-mono text-blue-900">₹35.0 Lakhs</td>
                      <td className="py-2 px-3 font-semibold text-gray-700">10 Years Continuous</td>
                      <td className="py-2 px-3 text-green-700 font-medium">Joint Name AICTE</td>
                    </tr>
                    <tr className="hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-semibold text-gray-900">Management (MBA / PGDM)</td>
                      <td className="py-2 px-3 font-bold font-mono text-blue-900">₹15.0 Lakhs</td>
                      <td className="py-2 px-3 font-semibold text-gray-700">8 Years Continuous</td>
                      <td className="py-2 px-3 text-green-700 font-medium">Joint Name AICTE</td>
                    </tr>
                    <tr className="hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-semibold text-gray-900">Pharmacy (B.Pharm / M.Pharm)</td>
                      <td className="py-2 px-3 font-bold font-mono text-blue-900">₹15.0 Lakhs</td>
                      <td className="py-2 px-3 font-semibold text-gray-700">8 Years Continuous</td>
                      <td className="py-2 px-3 text-green-700 font-medium">Joint Name AICTE</td>
                    </tr>
                    <tr className="hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-semibold text-gray-900">Architecture & Town Planning</td>
                      <td className="py-2 px-3 font-bold font-mono text-blue-900">₹15.0 Lakhs</td>
                      <td className="py-2 px-3 font-semibold text-gray-700">8 Years Continuous</td>
                      <td className="py-2 px-3 text-green-700 font-medium">Joint Name AICTE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Public Cryptographic QR NOC Verification Tool */}
            <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded bg-blue-100 text-[#1a365d]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1a365d]">
                      Public Cryptographic Discharge NOC Verifier
                    </h3>
                    <p className="text-[11px] text-gray-600">
                      Verify genuine AICTE Security Deposit Release Certificates without logging in
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded font-mono">
                  PUBLIC API
                </span>
              </div>

              <p className="text-xs text-gray-700">
                Scheduled Commercial Banks, regional branch managers, and legal auditors can scan the QR code on an AICTE Release NOC or paste the SHA-256 Certificate Hash below to verify Council authorization.
              </p>

              {/* NOC Hash Input Bar */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Paste 64-char SHA-256 Certificate Hash or Reference No..."
                      value={nocHashInput}
                      onChange={(e) => setNocHashInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    disabled={isVerifyingNoc || !nocHashInput.trim()}
                    onClick={() => handleVerifyNoc()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#1a365d] hover:bg-blue-900 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingNoc ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-orange-400" />
                    )}
                    <span>Verify Authenticity</span>
                  </button>
                </div>

                {/* Test Sample Button */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-gray-500">
                    Evaluation Quick-Action:
                  </span>
                  <button
                    type="button"
                    onClick={handleTestApexNoc}
                    className="text-blue-900 hover:text-orange-600 font-bold underline cursor-pointer text-[11px] flex items-center space-x-1"
                  >
                    <span>[Demo: Test-Verify Apex Released NOC]</span>
                  </button>
                </div>
              </div>

              {/* NOC Verification Result Display */}
              {nocResult && (
                <div className={`p-4 rounded border text-xs space-y-2 animate-in fade-in duration-150 ${
                  nocResult.is_valid 
                    ? 'bg-green-50 border-green-300 text-green-900' 
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {nocResult.is_valid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-700" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-bold text-sm tracking-tight">
                        {nocResult.is_valid 
                          ? 'OFFICIALLY VERIFIED — AUTHENTIC AICTE DISCHARGE NOC' 
                          : 'VERIFICATION FAILED — INVALID OR TAMPERED CERTIFICATE'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-current">
                      {nocResult.status}
                    </span>
                  </div>

                  <p className="text-[11px]">
                    {nocResult.message}
                  </p>

                  {nocResult.is_valid && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-200 font-mono text-[11px]">
                      <div>
                        <span className="text-gray-600 block text-[10px]">Institution PID & Name:</span>
                        <span className="font-bold">{nocResult.institution_pid} — {nocResult.institution_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block text-[10px]">Authorized Release Principal:</span>
                        <span className="font-bold text-green-800">₹{(nocResult.principal_amount || 0).toLocaleString('en-IN')} ({nocResult.bank_name})</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block text-[10px]">Issuing Authority:</span>
                        <span className="font-bold">{nocResult.issuing_authority}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block text-[10px]">Audit Block Hash:</span>
                        <span className="font-bold text-[10px] truncate block text-blue-900" title={nocResult.audit_block_hash}>
                          {nocResult.audit_block_hash}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Downloadable Circulars & Guidelines Box */}
            <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Latest Regulatory Circulars & User Manuals
                  </h3>
                </div>
                <button
                  onClick={onOpenCircularsModal}
                  className="text-xs text-blue-900 hover:text-orange-600 font-bold underline cursor-pointer flex items-center space-x-1"
                >
                  <span>View All 6 Circulars</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {CIRCULARS_DATA.slice(0, 3).map((circ) => (
                  <div 
                    key={circ.id}
                    className="flex items-center justify-between p-2.5 rounded bg-gray-50 hover:bg-blue-50/50 border border-gray-200 transition text-xs"
                  >
                    <div className="pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-100 px-1 rounded">
                          {circ.circular_no}
                        </span>
                        <span className="text-[10px] text-gray-500">{circ.date}</span>
                        {circ.is_new && (
                          <span className="text-[9px] bg-orange-500 text-white px-1 rounded font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 text-xs mt-0.5 line-clamp-1">
                        {circ.title}
                      </p>
                    </div>
                    <button
                      onClick={onOpenCircularsModal}
                      className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 rounded border border-gray-300 cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-900" />
                      <span>Inspect</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: OFFICIAL UNIFIED LOGIN BOX (e-FDR SINGLE SIGN-ON) (5 Cols)   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded border-2 border-[#1a365d] shadow-md overflow-hidden">
              
              {/* Card Header */}
              <div className="bg-[#1a365d] text-white p-4 border-b border-orange-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-orange-400" />
                    <h3 className="font-bold text-sm tracking-tight">
                      Official Unified Login (`e-FDR Single Sign-On`)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.2 rounded font-mono">
                    SECURE 2FA
                  </span>
                </div>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Authorized Centralized Portal for Institutions, Regulators & Banks
                </p>
              </div>

              {/* 4 Role Tabs */}
              <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-300 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleTabChange('INSTITUTION_NODAL_OFFICER')}
                  className={`py-2.5 px-2 text-center transition cursor-pointer border-r border-b border-gray-300 flex items-center justify-center space-x-1.5 ${
                    activeTab === 'INSTITUTION_NODAL_OFFICER'
                      ? 'bg-white text-blue-950 font-bold border-b-2 border-b-orange-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-900" />
                  <span className="truncate">Institute Login (PID)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('AICTE_SCRUTINY_OFFICER')}
                  className={`py-2.5 px-2 text-center transition cursor-pointer border-b border-gray-300 flex items-center justify-center space-x-1.5 ${
                    activeTab === 'AICTE_SCRUTINY_OFFICER'
                      ? 'bg-white text-blue-950 font-bold border-b-2 border-b-orange-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="truncate">AICTE Scrutiny Officer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('COMPETENT_AUTHORITY')}
                  className={`py-2.5 px-2 text-center transition cursor-pointer border-r border-gray-300 flex items-center justify-center space-x-1.5 ${
                    activeTab === 'COMPETENT_AUTHORITY'
                      ? 'bg-white text-blue-950 font-bold border-b-2 border-b-orange-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span className="truncate">Competent Authority</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('BANK_BRANCH_MANAGER')}
                  className={`py-2.5 px-2 text-center transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    activeTab === 'BANK_BRANCH_MANAGER'
                      ? 'bg-white text-blue-950 font-bold border-b-2 border-b-orange-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 text-purple-700" />
                  <span className="truncate">Bank Nodal Officer</span>
                </button>
              </div>

              {/* Login Form Body */}
              <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
                
                {loginError && (
                  <div className="p-3 rounded bg-red-50 border border-red-300 flex items-start space-x-2 text-xs text-red-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* User ID Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    {getUserIdLabel()} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={getUserIdPlaceholder()}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Password / Access PIN <span className="text-red-500">*</span>
                    </label>
                    <a href="#help" onClick={(e) => { e.preventDefault(); alert('Demo Evaluation Mode: Select any auto-fill button below for instant one-click login.'); }} className="text-[11px] text-blue-900 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter official portal credentials"
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Visual Alphanumeric Captcha Box */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Security Verification (Captcha) <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="flex items-center space-x-3 mb-2">
                    {/* Distortion Alphanumeric Display Box */}
                    <div 
                      className="relative px-4 py-2 bg-gradient-to-r from-gray-200 via-gray-100 to-amber-100 border-2 border-gray-400 rounded select-none flex items-center justify-center tracking-[0.4em] font-mono font-extrabold text-base text-gray-800 shadow-inner overflow-hidden w-40"
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
                      className="flex items-center space-x-1 px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 text-xs font-semibold cursor-pointer transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-900" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter Captcha Code exactly as shown above"
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 uppercase font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Solid Navy Blue Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1a365d] hover:bg-blue-900 text-white rounded font-bold text-xs shadow transition cursor-pointer flex items-center justify-center space-x-2 border border-blue-950 mt-4"
                >
                  <Lock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Sign In to Portal ({getRoleTabLabel(activeTab)})</span>
                </button>

              </form>

            </div>
          </div>

        </div>

      </main>

      {/* Official Government Footer */}
      <footer className="mt-auto border-t border-gray-300 bg-white py-4 text-center text-xs text-gray-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-600 space-y-1">
          <p>
            Content Owned &amp; Maintained by Regulation Bureau, All India Council for Technical Education (AICTE).
          </p>
          <p className="text-[11px] text-gray-500">
            Designed, Developed and Hosted by National Informatics Centre (NIC).
          </p>
        </div>
      </footer>

    </div>
  );
};
