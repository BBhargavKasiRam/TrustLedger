import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Eye, 
  FileCheck2,
  Building2,
  Check
} from 'lucide-react';
import type { BankFDRSession, FDRInstrument } from '../types';
import { api, getAssetUrl } from '../services/api';

interface BankManagerPortalProps {
  fdrs: FDRInstrument[];
  targetFdrUid?: string;
  onAttestationSubmitted: () => void;
  onReturnToScrutiny?: () => void;
}

export const BankManagerPortal: React.FC<BankManagerPortalProps> = ({
  fdrs,
  targetFdrUid,
  onAttestationSubmitted,
  onReturnToScrutiny
}) => {
  const [selectedFdrUid, setSelectedFdrUid] = useState<string>(targetFdrUid || 'FDR-2026-309');
  const [session, setSession] = useState<BankFDRSession | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  // OTP state
  const [otpCode, setOtpCode] = useState<string>('849201');
  const [otpVerified, setOtpVerified] = useState<boolean>(true);

  // Attestation form fields
  const [actualPrincipal, setActualPrincipal] = useState<number>(1500000);
  const [actualMaturityDate, setActualMaturityDate] = useState<string>('2031-06-09');
  const [lienStatus, setLienStatus] = useState<string>('LOAN_TAKEN_ENCUMBERED');
  const [remarks, setRemarks] = useState<string>(
    'SBI Core Banking System alert: True deposit balance is Rs 15,00,000. Active overdraft loan of Rs 20,00,000 sanctioned against this deposit to college trust without AICTE NOC.'
  );

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [attestationSuccess, setAttestationSuccess] = useState<{
    verdict: string;
    hash: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (targetFdrUid) {
      setSelectedFdrUid(targetFdrUid);
    }
  }, [targetFdrUid]);

  // Load session whenever selectedFdrUid changes
  useEffect(() => {
    const fetchSession = async () => {
      setLoadingSession(true);
      setAttestationSuccess(null);
      try {
        const data = await api.getBankFDRSession(selectedFdrUid);
        setSession(data);
        
        // Setup initial form based on scenario or bank truth from DB
        const isDiscrepant = (data as any).discrepancy_flag || (data as any).math_tamper_flag || (data as any).verification_status === 'MISMATCH_FLAGGED' || ((data as any).bank_principal_amount != null && (data as any).bank_principal_amount !== data.inst_principal_amount);

        if ((data as any).bank_principal_amount != null) {
          setActualPrincipal((data as any).bank_principal_amount);
          setActualMaturityDate((data as any).bank_maturity_date || data.inst_maturity_date || '2031-06-09');
          setLienStatus((data as any).bank_lien_status || (isDiscrepant ? 'LOAN_TAKEN_ENCUMBERED' : 'ACTIVE_JOINT_AICTE'));
          setRemarks((data as any).bank_manager_remarks || (isDiscrepant
            ? 'Core Banking System alert: Deposit balance differs from self-declared claim. Unauthorized encumbrance identified.'
            : 'Core Banking balance and maturity match certificate. Security deposit jointly pledged to Member Secretary, AICTE with zero third-party encumbrances.'));
        } else if (isDiscrepant) {
          // Pre-set to discrepancy scenario
          const trueBal = Math.round((data.inst_principal_amount || 3500000) * 0.42857);
          setActualPrincipal(trueBal);
          setActualMaturityDate(data.inst_maturity_date || '2031-06-09');
          setLienStatus('LOAN_TAKEN_ENCUMBERED');
          setRemarks(
            `Core Banking System alert: True deposit balance is Rs ${trueBal.toLocaleString('en-IN')}. Active overdraft loan sanctioned against this deposit without AICTE NOC.`
          );
        } else {
          // Pre-set to clean authentic scenario
          setActualPrincipal(data.inst_principal_amount || 3500000);
          setActualMaturityDate(data.inst_maturity_date || '2034-10-24');
          setLienStatus('ACTIVE_JOINT_AICTE');
          setRemarks(
            'Core Banking balance and maturity match certificate. Security deposit jointly pledged to Member Secretary, AICTE with zero third-party encumbrances.'
          );
        }
      } catch (err) {
        console.error('Failed to load bank FDR session', err);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSession();
  }, [selectedFdrUid]);

  const handleApplyPreset = (type: 'CLEAN' | 'FRAUD') => {
    if (type === 'CLEAN') {
      setActualPrincipal(session?.inst_principal_amount || 3500000);
      setActualMaturityDate(session?.inst_maturity_date || '2034-10-24');
      setLienStatus('ACTIVE_JOINT_AICTE');
      setRemarks(
        'Core Banking balance and maturity match certificate. Security deposit jointly pledged to Member Secretary, AICTE with zero third-party encumbrances.'
      );
    } else {
      const claimed = session?.inst_principal_amount || 3500000;
      const trueBal = (session as any)?.bank_principal_amount || Math.round(claimed * 0.42857);
      setActualPrincipal(trueBal);
      setActualMaturityDate((session as any)?.bank_maturity_date || session?.inst_maturity_date || '2031-06-09');
      setLienStatus('LOAN_TAKEN_ENCUMBERED');
      setRemarks(
        `CBS Attestation Alert: True principal is Rs ${trueBal.toLocaleString('en-IN')} only. An unauthorized loan encumbrance is marked in favor of the college management.`
      );
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode.length === 6) {
      setOtpVerified(true);
    }
  };

  const handleSubmitAttestation = async () => {
    if (!session || !otpVerified) return;
    setSubmitting(true);
    try {
      const res = await api.submitTier2Attestation({
        fdr_uid: session.fdr_uid,
        magic_link_token: session.magic_link_token || 'ml_demo_token',
        otp_code: otpCode,
        attested_principal: Number(actualPrincipal),
        attested_maturity_date: actualMaturityDate,
        lien_status: lienStatus,
        manager_remarks: remarks,
        manager_email: session.bank_manager_email || 'branch.manager@sbi.co.in'
      });

      setAttestationSuccess({
        verdict: res.verdict,
        hash: res.audit_entry_hash,
        message: res.message
      });

      onAttestationSubmitted();
    } catch (err) {
      console.error('Attestation submission failed', err);
    } finally {
      setSubmitting(false);
    }
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
    <div id="bank-manager-portal" className="space-y-6">
      
      {/* High-Trust Zero-Login Security Header */}
      <div className="bg-white rounded border border-gray-300 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 shadow-sm">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  Bank Attestation Gateway
                </span>
                <span className="text-[11px] font-mono text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-300 font-semibold">
                  Session Token: {session?.magic_link_token ? `${session.magic_link_token.slice(0, 12)}...` : 'ml_verified_active'}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight mt-0.5 flex items-center gap-2">
                AICTE Regulatory Bureau — External Bank Branch Manager Attestation Micro-Portal
              </h2>
            </div>
          </div>

          {/* 2FA OTP Step Box */}
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 p-2 rounded">
            <div className="text-right">
              <div className="text-[10px] text-gray-600 uppercase font-bold">2FA SMS / Email OTP</div>
              <div className="text-[11px] font-mono text-orange-700 font-bold">{session?.bank_manager_email || 'bm.pune@sbi.co.in'}</div>
            </div>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                const val = e.target.value;
                setOtpCode(val);
                if (val === '849201' || val.length === 6) {
                  setOtpVerified(true);
                }
              }}
              className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-center font-mono font-bold text-gray-900 text-xs focus:outline-none focus:border-blue-900"
            />
            <button
              onClick={handleVerifyOtp}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                otpVerified
                  ? 'bg-green-700 text-white'
                  : 'bg-[#1a365d] hover:bg-blue-900 text-white'
              }`}
            >
              {otpVerified ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
              <span>{otpVerified ? 'Verified ✓' : 'Verify'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Instrument Selector for Demo Ease */}
      <div className="flex items-center justify-between bg-white rounded border border-gray-300 px-4 py-2.5 text-xs">
        <span className="text-gray-600 font-semibold">Active Attestation Target:</span>
        <div className="flex items-center space-x-2">
          {fdrs.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFdrUid(f.fdr_uid)}
              className={`px-3 py-1 rounded font-mono text-xs font-bold transition cursor-pointer ${
                selectedFdrUid === f.fdr_uid
                  ? 'bg-[#1a365d] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {f.fdr_uid}
            </button>
          ))}
        </div>
      </div>

      {/* Split Screen Attestation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: What College Submitted (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-900" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                College Submission (AICTE Filing)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-gray-500 font-semibold">
              {session?.inst_fdr_number}
            </span>
          </div>

          {loadingSession || !session ? (
            <div className="h-64 flex items-center justify-center text-xs text-gray-500">
              Loading submission record...
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              
              {/* Institution Context */}
              <div className="bg-gray-50 rounded p-3 border border-gray-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-gray-600 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-900" />
                  <span>Submitting Institution:</span>
                </div>
                <div className="font-bold text-gray-900 text-sm">{session.institution_name}</div>
                <div className="text-[11px] text-gray-600 font-mono">
                  Permanent ID: {session.institution_pid} • Tier: {session.programme_tier}
                </div>
              </div>

              {/* Claimed Particulars */}
              <div className="bg-gray-50 rounded p-3 border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">College Claimed Principal:</span>
                  <span className="font-bold font-mono text-base text-blue-950">
                    {formatCurrency(session.inst_principal_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank & Branch IFSC:</span>
                  <span className="font-semibold text-gray-800">{session.inst_bank_name} ({session.inst_ifsc})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Claimed Maturity Date:</span>
                  <span className="font-mono text-gray-800">{session.inst_maturity_date || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Claimed No-Lien Clause:</span>
                  <span className="text-green-700 font-bold">Declared Intact</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Joint Operating Clause</span>
                  <p className="text-[11px] text-gray-700 leading-snug pt-0.5 line-clamp-2">
                    {session.inst_joint_holder_text || '—'}
                  </p>
                </div>
              </div>

              {/* Document Image Preview */}
              <div className="rounded overflow-hidden border border-gray-300 bg-gray-100">
                <img
                  src={getAssetUrl(session.document_path || '/static/sample_fdrs/sample_2_tampered_principal_pune.jpg')}
                  alt="Scanned FDR Document"
                  className="w-full h-auto object-cover max-h-56"
                />
              </div>

            </div>
          )}
        </div>

        {/* Right Side: Official Core Banking System (CBS) Direct Attestation Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-2">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-blue-900" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Official Core Banking System (CBS) Attestation
              </h3>
            </div>
            
            {/* Quick Demo Pre-fill Presets */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('CLEAN')}
                className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-800 border border-green-300 rounded text-[11px] font-bold transition cursor-pointer"
              >
                Preset A: 100% Clean
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('FRAUD')}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded text-[11px] font-bold transition cursor-pointer"
              >
                Preset B: Flag Fraud (₹15L)
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Actual Principal Input */}
            <div>
              <label className="text-[11px] text-gray-800 font-bold block mb-1">
                Actual CBS Ledger Principal Amount (₹) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={actualPrincipal}
                onChange={(e) => setActualPrincipal(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded px-3.5 py-2.5 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-900"
              />
              {session && actualPrincipal !== session.inst_principal_amount && (
                <p className="text-[11px] text-red-700 font-semibold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Discrepancy: College claimed {formatCurrency(session.inst_principal_amount)} vs Bank CBS Truth {formatCurrency(actualPrincipal)}
                </p>
              )}
            </div>

            {/* Actual Maturity Date */}
            <div>
              <label className="text-[11px] text-gray-800 font-bold block mb-1">
                Actual CBS Maturity Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={actualMaturityDate}
                onChange={(e) => setActualMaturityDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded px-3.5 py-2.5 text-xs font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-900"
              />
            </div>

            {/* Core Banking Lien Status Dropdown */}
            <div>
              <label className="text-[11px] text-gray-800 font-bold block mb-1">
                Authoritative CBS Lien & Encumbrance Status <span className="text-red-600">*</span>
              </label>
              <select
                aria-label="Core Banking Lien Status"
                value={lienStatus}
                onChange={(e) => setLienStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-900 cursor-pointer"
              >
                <option value="ACTIVE_JOINT_AICTE" className="text-green-700 font-semibold">
                  ACTIVE_JOINT_AICTE — Joint Mandate with AICTE Active (Zero Third-Party Liens)
                </option>
                <option value="LOAN_TAKEN_ENCUMBERED" className="text-red-700 font-semibold">
                  LOAN_TAKEN_ENCUMBERED — Unauthorized Overdraft / Loan Facility Sanctioned Against FD!
                </option>
                <option value="PREMATURELY_BROKEN" className="text-amber-700 font-semibold">
                  PREMATURELY_BROKEN — Fixed Deposit Liquidated Prematurely Without AICTE NOC!
                </option>
              </select>
            </div>

            {/* Official Remarks */}
            <div>
              <label className="text-[11px] text-gray-800 font-bold block mb-1">
                Branch Manager Official Attestation Remarks
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-xs text-gray-900 focus:outline-none focus:border-blue-900 font-sans"
              />
            </div>

            {/* Submission Button */}
            <button
              onClick={handleSubmitAttestation}
              disabled={submitting || !otpVerified}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              <span>
                {submitting
                  ? 'Transmitting Attestation & Recording to Audit Log...'
                  : 'Submit Official Bank Attestation & Seal Block'}
              </span>
            </button>

            {/* Success Toast */}
            {attestationSuccess && (
              <div className="p-4 rounded bg-green-50 border border-green-300 text-green-900 text-xs space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                  <span>Attestation Registered on AICTE Ledger!</span>
                </div>
                <p>{attestationSuccess.message}</p>
                <div className="flex items-center space-x-1 font-mono text-[10px] text-gray-700 pt-1">
                  <span className="text-gray-500 font-sans">Chained Hash:</span>
                  <span className="text-blue-900 font-bold truncate">{attestationSuccess.hash}</span>
                </div>
                {onReturnToScrutiny && (
                  <div className="pt-2 border-t border-green-200 flex justify-end">
                    <button
                      type="button"
                      onClick={onReturnToScrutiny}
                      className="px-3.5 py-1.5 rounded bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
                    >
                      <span>Return to Central Scrutiny Desk →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
