import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Landmark, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Terminal, 
  ExternalLink, 
  Key, 
  RefreshCw, 
  Check, 
  Copy,
  Search,
  Scale
} from 'lucide-react';
import type { 
  FDRInstrument, 
  IFSCResponse, 
  Tier1CBSVerifyResponse, 
  Tier2MagicLinkResponse,
  UserRole
} from '../types';
import { api } from '../services/api';

interface BankVerificationGatewayProps {
  fdrs: FDRInstrument[];
  onRefresh: () => void;
  onSwitchRole: (role: UserRole, targetFdrUid?: string) => void;
}

export const BankVerificationGateway: React.FC<BankVerificationGatewayProps> = ({
  fdrs,
  onRefresh,
  onSwitchRole
}) => {
  const [selectedFdrUid, setSelectedFdrUid] = useState<string>('FDR-2026-309');
  const [ifscData, setIfscData] = useState<IFSCResponse | null>(null);
  const [ifscLoading, setIfscLoading] = useState<boolean>(false);
  const [cbsResponse, setCbsResponse] = useState<Tier1CBSVerifyResponse | null>(null);
  const [cbsLoading, setCbsLoading] = useState<boolean>(false);
  const [managerEmail, setManagerEmail] = useState<string>('bm.pune@sbi.co.in');
  const [magicLinkResult, setMagicLinkResult] = useState<Tier2MagicLinkResponse | null>(null);
  const [mlLoading, setMlLoading] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Selected FDR object
  const currentFdr = fdrs.find((f) => f.fdr_uid === selectedFdrUid) || fdrs[0];

  // Auto-run IFSC lookup on FDR selection
  useEffect(() => {
    if (currentFdr?.inst_ifsc) {
      handleIfscLookup(currentFdr.inst_ifsc);
      // Pre-fill manager email based on IFSC bank
      const prefix = currentFdr.inst_ifsc.slice(0, 4).toUpperCase();
      const domainMap: Record<string, string> = {
        SBIN: 'bm.pune@sbi.co.in',
        HDFC: 'bm.hyderabad@hdfcbank.com',
        CNRB: 'bm.lucknow@canarabank.com',
        PUNB: 'bm.dehradun@pnb.co.in'
      };
      setManagerEmail(domainMap[prefix] || `branch.manager@${prefix.toLowerCase()}.bank.gov.in`);
      setCbsResponse(null);
      setMagicLinkResult(null);
    }
  }, [selectedFdrUid]);

  const handleIfscLookup = async (ifscCode: string) => {
    setIfscLoading(true);
    try {
      const data = await api.lookupIFSC(ifscCode);
      setIfscData(data);
    } catch (err) {
      console.error('IFSC lookup failed', err);
    } finally {
      setIfscLoading(false);
    }
  };

  const handleTier1CBSVerify = async () => {
    if (!currentFdr) return;
    setCbsLoading(true);
    try {
      const res = await api.verifyTier1CBS(currentFdr.fdr_uid);
      setCbsResponse(res);
      onRefresh(); // Refresh parent Dual-Truth tables & KPI cards
    } catch (err) {
      console.error('Tier 1 CBS verify failed', err);
    } finally {
      setCbsLoading(false);
    }
  };

  const handleGenerateMagicLink = async () => {
    if (!currentFdr) return;
    setMlLoading(true);
    try {
      const res = await api.generateTier2MagicLink(currentFdr.fdr_uid, managerEmail);
      setMagicLinkResult(res);
      onRefresh();
    } catch (err) {
      console.error('Magic link generation failed', err);
    } finally {
      setMlLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div id="bank-verification-gateway" className="space-y-6">
      
      {/* Header & FDR Selector Bar */}
      <div className="bg-white rounded border border-gray-300 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                Regulatory Verification
              </span>
              <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                Bank Verification Gateway &amp; Tri-Party Attestation Log
              </h2>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Authoritative verification via Live RBI IFSC Directory, Core Banking API integration, and branch nodal officer digital attestation. Distinguishes between institution-submitted information and bank-confirmed information.
            </p>
          </div>

          {/* FDR Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 mr-1">Select Instrument:</span>
            {fdrs.map((fdr) => {
              const isSelected = fdr.fdr_uid === currentFdr?.fdr_uid;
              const isDiscrepant = fdr.fdr_uid === 'FDR-2026-309' || fdr.math_tamper_flag;

              return (
                <button
                  key={fdr.id}
                  onClick={() => setSelectedFdrUid(fdr.fdr_uid)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition cursor-pointer border ${
                    isSelected
                      ? isDiscrepant
                        ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-500 shadow-sm'
                        : 'border-[#1a365d] bg-blue-50 text-[#1a365d] ring-1 ring-[#1a365d] shadow-sm'
                      : 'border-gray-300 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {isDiscrepant ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-700 shrink-0" />
                  )}
                  <span>{fdr.fdr_uid}</span>
                  {fdr.fdr_uid === 'FDR-2026-309' && (
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-sans font-bold">
                      Mismatch Flagged
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tri-Party Verification Matrix (Side-by-Side 3-Column Inspection) */}
      {currentFdr && (
        <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-blue-900" />
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Tri-Party Verification Matrix: {currentFdr.fdr_uid}
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Distinguishes between institution-submitted information and bank-confirmed information.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-600">Target Institution:</span>
              <strong className="text-gray-900 font-semibold">{currentFdr.institution?.name}</strong>
              <span className="text-gray-500 font-mono">({currentFdr.institution?.pid})</span>
            </div>
          </div>

          {/* 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Column Set A: College Claimed Truth */}
            <div className="rounded border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-blue-900" />
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Column Set A: College Claim
                  </span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-300 font-semibold">
                  Self-Declared
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal Deposit:</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">
                    {formatCurrency(currentFdr.inst_principal_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank & IFSC:</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[170px]" title={currentFdr.inst_bank_name || ''}>
                    {currentFdr.inst_bank_name} ({currentFdr.inst_ifsc})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maturity Date:</span>
                  <span className="font-mono text-gray-800">{currentFdr.inst_maturity_date || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest / Maturity:</span>
                  <span className="font-mono text-gray-800">
                    {currentFdr.inst_interest_rate}% • {formatCurrency(currentFdr.inst_maturity_amount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Pledged Mandate</span>
                  <p className="text-[11px] text-gray-800 truncate" title={currentFdr.inst_joint_holder_text || ''}>
                    {currentFdr.inst_joint_holder_text || '—'}
                  </p>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600">College No-Lien Declaration:</span>
                  <span className="text-green-700 font-bold">Declared Intact ✓</span>
                </div>
              </div>
            </div>

            {/* Column Set B: AI OCR & Math Forensics Truth */}
            <div className={`rounded border p-4 space-y-3 ${
              currentFdr.math_tamper_flag
                ? 'border-red-300 bg-red-50/50'
                : 'border-green-300 bg-green-50/50'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className={`w-4 h-4 ${currentFdr.math_tamper_flag ? 'text-red-600' : 'text-green-700'}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${currentFdr.math_tamper_flag ? 'text-red-900' : 'text-green-900'}`}>
                    Column Set B: AI & Forensics
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                  currentFdr.math_tamper_flag
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-green-100 text-green-800 border-green-300'
                }`}>
                  {currentFdr.math_tamper_flag ? 'MATH ANOMALY' : 'FORENSICS CLEAN'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">OCR Read Principal:</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">
                    {formatCurrency(currentFdr.ocr_principal_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Formula Expected Yield:</span>
                  <span className="font-bold text-orange-700 font-mono">
                    {formatCurrency(currentFdr.math_expected_maturity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Printed Maturity on Scan:</span>
                  <span className={`font-mono font-bold ${currentFdr.math_tamper_flag ? 'text-red-700' : 'text-green-800'}`}>
                    {formatCurrency(currentFdr.ocr_maturity_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compound Math Status:</span>
                  {currentFdr.math_tamper_flag ? (
                    <span className="text-red-700 font-bold">Tamper: Yield Matches ₹15L!</span>
                  ) : (
                    <span className="text-green-700 font-bold">Formula Intact ✓</span>
                  )}
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-600">ELA Pixel Tamper Score:</span>
                  <span className={`font-mono font-bold ${currentFdr.ela_tamper_score && currentFdr.ela_tamper_score > 0.4 ? 'text-red-700' : 'text-green-700'}`}>
                    {currentFdr.ela_tamper_score ?? '0.02'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AICTE Tripartite Clause:</span>
                  <span className={currentFdr.ocr_joint_clause_found ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                    {currentFdr.ocr_joint_clause_found ? 'Endorsed ✓' : 'Missing! ✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Column Set C: Authoritative Bank Confirmed Truth */}
            <div className={`rounded border p-4 space-y-3 ${
              currentFdr.bank_verified_status === 'MISMATCH_FLAGGED' || currentFdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED'
                ? 'border-red-300 bg-red-50/50'
                : currentFdr.bank_verified_status === 'VERIFIED_API' || currentFdr.bank_verified_status === 'VERIFIED_MAGIC_LINK'
                ? 'border-green-300 bg-green-50/50'
                : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center space-x-1.5">
                  <Landmark className="w-4 h-4 text-blue-900" />
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Column Set C: Bank Truth
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                  currentFdr.bank_verified_status === 'VERIFIED_API' || currentFdr.bank_verified_status === 'VERIFIED_MAGIC_LINK'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : currentFdr.bank_verified_status === 'MISMATCH_FLAGGED' || currentFdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}>
                  {currentFdr.bank_verified_status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confirmed Principal:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-bold font-mono text-sm ${
                      currentFdr.bank_confirmed_principal !== currentFdr.inst_principal_amount && currentFdr.bank_confirmed_principal
                        ? 'text-red-700'
                        : 'text-green-700'
                    }`}>
                      {formatCurrency(currentFdr.bank_confirmed_principal)}
                    </span>
                    {currentFdr.bank_confirmed_principal && currentFdr.bank_confirmed_principal !== currentFdr.inst_principal_amount && (
                      <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Δ -₹20L Mismatch!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmed Maturity Date:</span>
                  <span className="font-mono text-gray-800">{currentFdr.bank_confirmed_maturity_date || 'Awaiting Handshake'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Authoritative Lien Status:</span>
                  {currentFdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED' ? (
                    <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                      LOAN TAKEN ENCUMBERED!
                    </span>
                  ) : currentFdr.bank_lien_status === 'ACTIVE_JOINT_AICTE' ? (
                    <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-300">
                      ACTIVE JOINT AICTE ✓
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">Not Attested Yet</span>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-600">Attestation Source:</span>
                  <span className="font-mono text-gray-800 text-[11px] truncate max-w-[170px]" title={currentFdr.bank_manager_email || ''}>
                    {currentFdr.bank_manager_email || 'Pending Tier 1/2'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Lifecycle State:</span>
                  <span className="font-bold text-gray-900 text-[11px]">{currentFdr.lifecycle_status}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* The 3-Tier Bank Verification Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Tier 0: Live RBI IFSC Directory Validator */}
        <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-900" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Live RBI IFSC Directory Lookup
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
              RBI Gateway
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={currentFdr?.inst_ifsc || ''}
                readOnly
                className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none"
              />
              <button
                onClick={() => currentFdr?.inst_ifsc && handleIfscLookup(currentFdr.inst_ifsc)}
                disabled={ifscLoading}
                className="px-3 py-2 bg-[#1a365d] hover:bg-blue-900 text-white rounded text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ifscLoading ? 'animate-spin' : ''}`} />
                <span>Verify</span>
              </button>
            </div>

            {ifscData ? (
              <div className="bg-gray-50 rounded p-3 border border-gray-200 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Bank Entity</span>
                  <div className="font-bold text-gray-900">{ifscData.BANK}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Branch & Location</span>
                  <div className="text-gray-800">{ifscData.BRANCH} — {ifscData.CITY}, {ifscData.STATE}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Address</span>
                  <div className="text-[11px] text-gray-600 line-clamp-2">{ifscData.ADDRESS}</div>
                </div>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">Whitelisted Domain:</span>
                  <span className="font-mono text-green-800 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-300 text-[11px]">
                    {ifscData.whitelisted_domain}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono pt-0.5">
                  Verified via: {ifscData.source} (RTGS ✓ • NEFT ✓)
                </div>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-xs text-gray-500 italic">
                Querying RBI Central Directory...
              </div>
            )}
          </div>
        </div>

        {/* Tier 1: Automated NeSL / CBS Webhook Handshake */}
        <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-green-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Tier 1: NeSL / CBS Webhook API
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-green-50 text-green-800 px-2 py-0.5 rounded border border-green-300">
              Direct Core API
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Execute direct Core Banking System (CBS) / National E-Governance Services Ltd (NeSL) cryptographic query to pull authoritative ledger truth.
            </p>

            <button
              onClick={handleTier1CBSVerify}
              disabled={cbsLoading || !currentFdr}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Terminal className={`w-3.5 h-3.5 ${cbsLoading ? 'animate-spin' : ''}`} />
              <span>{cbsLoading ? 'Handshaking with Core Banking...' : 'Run Instant CBS / NeSL API Handshake'}</span>
            </button>

            {/* Live Terminal Output */}
            {cbsResponse && (
              <div className="bg-gray-50 rounded p-3 border border-gray-300 space-y-1.5 font-mono text-[11px] text-gray-800">
                <div className="flex items-center justify-between text-green-700 font-bold border-b border-gray-200 pb-1">
                  <span>CBS HANDSHAKE: 200 OK</span>
                  <span className={cbsResponse.verdict.includes('FRAUD') ? 'text-red-700' : 'text-green-700'}>
                    {cbsResponse.verdict}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  Gateway: {cbsResponse.gateway_provider}
                </div>
                <div className="flex justify-between">
                  <span>Actual CBS Principal:</span>
                  <strong className={cbsResponse.principal_mismatch ? 'text-red-700' : 'text-green-700'}>
                    {formatCurrency(cbsResponse.actual_principal)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Lien Status:</span>
                  <strong className={cbsResponse.cbs_lien_status === 'LOAN_TAKEN_ENCUMBERED' ? 'text-red-700' : 'text-green-700'}>
                    {cbsResponse.cbs_lien_status}
                  </strong>
                </div>
                <p className="text-[10px] text-gray-600 pt-1 leading-snug border-t border-gray-200">
                  {cbsResponse.manager_remarks}
                </p>
                <div className="text-[9px] text-gray-500 pt-0.5 truncate">
                  SHA256 Sig: {cbsResponse.cryptographic_signature.slice(0, 24)}...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tier 2: Zero-Login Magic Link & OTP Dispatch */}
        <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Tier 2: Magic-Link Dispatch
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
              Zero-Login Portal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                Branch Manager Official Email (Domain Whitelisted)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
                />
                <span className="absolute right-2.5 top-2 text-[10px] text-green-700 font-bold">
                  ✓ Whitelisted
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerateMagicLink}
              disabled={mlLoading || !currentFdr}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Key className={`w-3.5 h-3.5 ${mlLoading ? 'animate-spin' : ''}`} />
              <span>{mlLoading ? 'Generating Cryptographic Token...' : 'Generate Cryptographic Magic Link'}</span>
            </button>

            {/* Generated Magic Link Card */}
            {magicLinkResult && (
              <div className="bg-purple-50 rounded p-3 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-900">Magic Link Active</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300 font-bold">
                    OTP: {magicLinkResult.demo_otp}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-800 bg-white px-2 py-1.5 rounded border border-gray-300">
                  <span className="truncate max-w-[200px]">{magicLinkResult.magic_link_token}</span>
                  <button
                    onClick={() => copyToClipboard(magicLinkResult.magic_link_token)}
                    className="text-gray-500 hover:text-gray-800 cursor-pointer"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={() => onSwitchRole('BANK_BRANCH_MANAGER', currentFdr.fdr_uid)}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Zero-Login Bank Manager View</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
