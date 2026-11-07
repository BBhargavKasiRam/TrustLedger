import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Building2, 
  FileCheck2, 
  Landmark, 
  QrCode, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Shield, 
  Fingerprint, 
  GitBranch, 
  Scale,
  ArrowRight,
  BookOpen,
  BarChart3
} from 'lucide-react';
import type { UserSession, NOCVerificationResponse, UserPreset } from '../types';
import { api } from '../services/api';

interface PublicLandingPageProps {
  onLoginSuccess?: (session: UserSession) => void;
  presets?: UserPreset[];
  currentSession?: UserSession | null;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  currentSession
}) => {
  const navigate = useNavigate();

  // Public QR NOC Verification State
  const [nocHashInput, setNocHashInput] = useState<string>('');
  const [isVerifyingNoc, setIsVerifyingNoc] = useState<boolean>(false);
  const [nocResult, setNocResult] = useState<NOCVerificationResponse | null>(null);

  // Handle Public NOC Verification
  const handleVerifyNoc = async (hashToVerify?: string) => {
    const hash = (hashToVerify || nocHashInput).trim();
    if (!hash) return;

    setIsVerifyingNoc(true);
    try {
      const res = await api.verifyNOC(hash);
      setNocResult(res);
    } catch {
      setNocResult({
        noc_certificate_hash: hash,
        is_valid: false,
        fdr_uid: 'N/A',
        institution_name: 'Unknown / Unregistered',
        institution_pid: 'N/A',
        bank_name: 'N/A',
        ifsc: 'N/A',
        principal_amount: 0,
        issued_at: new Date().toISOString(),
        issuing_authority: 'AICTE Regulation Bureau',
        audit_block_hash: '0x0000000000000000',
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

  return (
    <div className="w-full flex-1 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Main Full-Width Viewport */}
      <main id="main-content" className="flex-1 w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Active Session Continuity Banner (if already logged in) */}
        {currentSession && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#002147] to-[#003870] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border-l-4 border-amber-400 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-amber-400 text-slate-950 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 font-mono">
                  ACTIVE AUTHENTICATED SESSION DETECTED
                </span>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  Welcome back, {currentSession.userName} ({currentSession.designation})
                </h4>
                <p className="text-xs text-blue-200">
                  Role: <span className="font-semibold text-white">{currentSession.role}</span> {currentSession.institutionPid ? `• PID: ${currentSession.institutionPid}` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <span>Go to Your Workbench Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Statutory Advisory Strip */}
        <div className="bg-amber-50 border-l-4 border-amber-600 border border-amber-200 p-4.5 rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-sm shadow-xs">
          <div className="flex items-center space-x-3.5">
            <span className="flex items-center justify-center p-2 rounded-full bg-amber-500 text-white font-bold shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="font-bold text-amber-950 uppercase tracking-wide text-xs block font-mono">
                Statutory Advisory: Circular No. AICTE/RB/FDR/2026/04 • Approval Process Handbook (APH)
              </span>
              <p className="text-slate-700 font-medium text-xs sm:text-sm mt-0.5">
                Mandatory Core Banking (CBS) Lien Marking in Scheduled Commercial Banks and cryptographic digital attestation for institutional fixed deposit receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2 shrink-0 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => navigate('/deposit-norms')}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            >
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Chapter IV Deposit Norms →</span>
            </button>
            <button
              onClick={() => navigate('/circulars')}
              className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-blue-900 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              <span>Gazette Circulars</span>
            </button>
          </div>
        </div>

        {/* AICTE Bureau Mandate Hero Card (Full Width) */}
        <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-[#002147] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="h-5 w-1.5 bg-amber-500 rounded-full" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  VidyaKosh Portal • Regulation Bureau Mandate
                </h2>
                <span className="text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono">
                  NATIONAL REPOSITORY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
                Streamline and digital verification of Security Deposit / Fixed Deposit Receipt (FDR) operations across all technical institutions approved under Chapter IV of the Approval Process Handbook (APH 2026-31). Replaces manual paper verification with cryptographic, CBS-attested tripartite governance.
              </p>
            </div>
          </div>

          {/* National Governance & Compliance Metrics: 3 Balanced Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
            
            {/* Metric 1: Deposit Security */}
            <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl flex flex-col items-center justify-between text-center transition hover:bg-blue-50">
              <div className="flex items-center space-x-2 mb-1.5 text-blue-900">
                <Building2 className="w-5 h-5 text-blue-700 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Deposit Security
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-[#002147] tracking-tight my-1 font-mono">
                Joint Lien Secured
              </span>
              <span className="text-xs text-slate-600 font-medium mt-1">
                Direct RBI Scheduled Bank Core Banking Depository
              </span>
            </div>

            {/* Metric 2: Audit Integrity */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-xl flex flex-col items-center justify-between text-center transition hover:bg-emerald-50">
              <div className="flex items-center space-x-2 mb-1.5 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Audit Integrity
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-emerald-800 tracking-tight my-1 font-mono">
                SHA-256 Verified
              </span>
              <span className="text-xs text-slate-600 font-medium mt-1">
                Cryptographic Immutable Block Ledger &amp; Lineage
              </span>
            </div>

            {/* Metric 3: Release Gateway */}
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-xl flex flex-col items-center justify-between text-center transition hover:bg-amber-50">
              <div className="flex items-center space-x-2 mb-1.5 text-amber-900">
                <FileCheck2 className="w-5 h-5 text-amber-700 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Release Gateway
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-amber-800 tracking-tight my-1 font-mono">
                4-Gate Authorized
              </span>
              <span className="text-xs text-slate-600 font-medium mt-1">
                Class-3 Digital Signature (DSC) QR Discharge NOC
              </span>
            </div>

          </div>
        </div>

        {/* 4 Pillars of Solution Architecture Grid (Spacious 4-Column Layout) */}
        <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-[#002147] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <Shield className="w-5 h-5 text-[#002147]" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Architectural Pillars of Regulatory Governance
              </h3>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono self-start sm:self-auto">
              NATIONAL SINGLE WINDOW SYSTEM (NSWS) ALIGNED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Tri-Party Dual-Truth Isolation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2 transition hover:bg-blue-50/50 hover:border-blue-300">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-50 text-[#002147] border border-blue-200">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  PILLAR 1
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 pt-1">
                1. Tri-Party Dual-Truth
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict mathematical isolation of College Claim vs. Vision AI Forensics vs. Authoritative Bank Truth to eliminate silent claim overrides.
              </p>
            </div>

            {/* 2. OpenCV ELA & Math Forensics */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2 transition hover:bg-purple-50/50 hover:border-purple-300">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                  PILLAR 2
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 pt-1">
                2. Computer Vision Forensics
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Error-Level Analysis (ELA) pixel forensics, quarterly compound interest anomaly detection, and perceptual hash collision scans.
              </p>
            </div>

            {/* 3. 3-Tier Bank Verification Gateway */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2 transition hover:bg-emerald-50/50 hover:border-emerald-300">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  PILLAR 3
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 pt-1">
                3. CBS Bank Gateway
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Core Banking CBS API, live RBI IFSC verification, and zero-login OTP Magic Links routed to official bank branch emails.
              </p>
            </div>

            {/* 4. 4-Gate Statutory Release Protocol */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2 transition hover:bg-amber-50/50 hover:border-amber-300">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <GitBranch className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  PILLAR 4
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 pt-1">
                4. 4-Gate Release &amp; Lineage
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pre-clearance compliance gate checks (PGRC dues, salaries, court cases) paired with cryptographic QR Discharge NOC issuance.
              </p>
            </div>

          </div>
        </div>

        {/* Public Cryptographic QR NOC Verification Tool (Full Width) */}
        <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-emerald-600 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Public Cryptographic Discharge NOC Verifier
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time statutory verification tool for bank branch managers, auditors, and law enforcement
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-mono self-start sm:self-auto">
              PUBLIC ZERO-LOGIN TOOL
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Scan the QR code on any AICTE Security Deposit Release Certificate or paste the 64-character SHA-256 cryptographic hash below to verify genuine Council authorization before liquidating fixed deposit accounts.
          </p>

          {/* NOC Hash Input Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Paste 64-char SHA-256 Certificate Hash..."
                  value={nocHashInput}
                  onChange={(e) => setNocHashInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] transition"
                />
              </div>
              <button
                disabled={isVerifyingNoc || !nocHashInput.trim()}
                onClick={() => handleVerifyNoc()}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#002147] hover:bg-[#003870] text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isVerifyingNoc ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Search className="w-4 h-4 text-amber-400" />
                )}
                <span>Verify NOC Authenticity</span>
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
                className="text-[#002147] hover:text-amber-700 font-bold underline cursor-pointer text-xs flex items-center space-x-1"
              >
                <span>[Test with Sample Genuine Apex Discharge NOC Hash]</span>
              </button>
            </div>
          </div>

          {/* NOC Verification Result Display */}
          {nocResult && (
            <div className={`p-5 rounded-xl border text-xs space-y-3 animate-in fade-in duration-150 ${
              nocResult.is_valid 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  {nocResult.is_valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span className="font-extrabold text-sm tracking-tight">
                    {nocResult.is_valid 
                      ? 'OFFICIALLY VERIFIED — AUTHENTIC AICTE DISCHARGE NOC' 
                      : 'VERIFICATION FAILED — INVALID OR TAMPERED CERTIFICATE'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-0.5 rounded border border-current self-start sm:self-auto">
                  {nocResult.status}
                </span>
              </div>

              <p className="text-xs">
                {nocResult.message}
              </p>

              {nocResult.is_valid && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-emerald-200 font-mono text-xs">
                  <div className="bg-white/80 p-2.5 rounded border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">Institution PID &amp; Name:</span>
                    <strong className="text-slate-900 block truncate">{nocResult.institution_pid} — {nocResult.institution_name}</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">Authorized Release Principal:</span>
                    <strong className="text-emerald-800 block">₹{(nocResult.principal_amount || 0).toLocaleString('en-IN')} ({nocResult.bank_name})</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">Issuing Authority:</span>
                    <strong className="text-slate-900 block">{nocResult.issuing_authority}</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">Audit Block Hash:</span>
                    <strong className="text-[10px] truncate block text-[#002147]" title={nocResult.audit_block_hash}>
                      {nocResult.audit_block_hash}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Directory Launchpad (Links across all sections) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/about-us/overview"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg inline-block mb-3">
                <Building2 className="w-5 h-5 text-blue-800" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 group-hover:text-[#002147] transition">
                About VidyaKosh Portal
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Overview of statutory tripartite governance, regulatory mandate, and council objectives.
              </p>
            </div>
            <span className="text-xs font-bold text-[#002147] mt-4 flex items-center space-x-1">
              <span>Read Overview</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/deposit-norms"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg inline-block mb-3">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 group-hover:text-[#002147] transition">
                APH Deposit Norms
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Chapter IV mandatory deposit amounts, lock-in tenures, and discipline breakdown.
              </p>
            </div>
            <span className="text-xs font-bold text-[#002147] mt-4 flex items-center space-x-1">
              <span>Explore Norms</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/circulars"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg inline-block mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 group-hover:text-[#002147] transition">
                Official Circulars &amp; SOPs
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Gazette repository of official notifications and step-by-step SOP manuals.
              </p>
            </div>
            <span className="text-xs font-bold text-[#002147] mt-4 flex items-center space-x-1">
              <span>Browse Circulars</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/statistics/dashboard"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg inline-block mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 group-hover:text-[#002147] transition">
                National Statistics
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Live regulatory indicators across 10,800+ approved institutions and banks.
              </p>
            </div>
            <span className="text-xs font-bold text-[#002147] mt-4 flex items-center space-x-1">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

      </main>

    </div>
  );
};
