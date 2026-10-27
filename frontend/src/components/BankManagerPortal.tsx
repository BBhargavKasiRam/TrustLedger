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
  ShieldCheck,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';
import type { BankFDRSession, FDRInstrument } from '../types';
import { api, getAssetUrl } from '../services/api';

interface BankManagerPortalProps {
  fdrs: FDRInstrument[];
  targetFdrUid?: string;
  onSelectFdr?: (uid: string) => void;
  onAttestationSubmitted: () => void;
  onReturnToScrutiny?: () => void;
}

export const BankManagerPortal: React.FC<BankManagerPortalProps> = ({
  fdrs,
  targetFdrUid,
  onSelectFdr,
  onAttestationSubmitted,
  onReturnToScrutiny
}) => {
  const [selectedFdrUid, setSelectedFdrUid] = useState<string>(targetFdrUid || (fdrs[0]?.fdr_uid || 'FDR-2026-309'));
  const [session, setSession] = useState<BankFDRSession | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  // Secure 2FA Gateway State (Portal locked until OTP entered)
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Attestation form fields (CBS Truth)
  const [actualPrincipal, setActualPrincipal] = useState<number>(1500000);
  const [actualMaturityDate, setActualMaturityDate] = useState<string>('2031-06-09');
  const [lienStatus, setLienStatus] = useState<string>('LOAN_TAKEN_ENCUMBERED');
  const [remarks, setRemarks] = useState<string>(
    'SBI Core Banking System alert: True deposit balance is Rs 15,00,000. Active overdraft loan of Rs 20,00,000 sanctioned against this deposit to college trust without AICTE NOC.'
  );

  const [attestationPdf, setAttestationPdf] = useState<File | null>(null);
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
        
        // Setup initial form based on scenario or existing bank truth from DB
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

  const handleVerifyOtp = () => {
    if (otpCode.trim().length === 6) {
      setOtpVerified(true);
      setOtpError(null);
    } else {
      setOtpError('Please enter a valid 6-digit numeric authorization OTP.');
    }
  };

  const handleSelectFdr = (uid: string) => {
    setSelectedFdrUid(uid);
    onSelectFdr?.(uid);
  };

  const handleSubmitAttestation = async () => {
    if (!session || !otpVerified) return;
    setSubmitting(true);
    try {
      let res;
      if (attestationPdf) {
        const formData = new FormData();
        formData.append('fdr_uid', session.fdr_uid);
        formData.append('magic_link_token', session.magic_link_token || 'ml_demo_token');
        formData.append('otp_code', otpCode || '849201');
        formData.append('attested_principal', String(Number(actualPrincipal)));
        formData.append('attested_maturity_date', actualMaturityDate);
        formData.append('lien_status', lienStatus);
        formData.append('manager_remarks', remarks);
        formData.append('manager_email', session.bank_manager_email || 'branch.manager@sbi.co.in');
        formData.append('file', attestationPdf);
        res = await api.submitTier2Attestation(formData);
      } else {
        res = await api.submitTier2Attestation({
          fdr_uid: session.fdr_uid,
          magic_link_token: session.magic_link_token || 'ml_demo_token',
          otp_code: otpCode || '849201',
          attested_principal: Number(actualPrincipal),
          attested_maturity_date: actualMaturityDate,
          lien_status: lienStatus,
          manager_remarks: remarks,
          manager_email: session.bank_manager_email || 'branch.manager@sbi.co.in'
        });
      }

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

  // 1. GATEWAY SCREEN: Render when OTP is not verified yet
  if (!otpVerified) {
    return (
      <div id="bank-manager-gateway" className="max-w-2xl mx-auto my-6 space-y-6">
        <div className="bg-white rounded-lg border-2 border-[#1E3A8A]/30 p-8 shadow-md">
          {/* Gateway Header */}
          <div className="flex items-start space-x-4 border-b border-gray-200 pb-5">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-[#1E3A8A]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                  ZERO-LOGIN 2FA GATEWAY
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  AICTE Regulation Bureau
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mt-1">
                Bank Branch Manager Attestation Gateway
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Official Depository Fixed Deposit Verification for Scheduled Commercial Banks
              </p>
            </div>
          </div>

          <div className="py-6 space-y-5">
            {/* Regulatory Notice Banner */}
            <div className="bg-amber-50 border border-amber-300 rounded p-4 text-xs text-amber-900 flex items-start space-x-3">
              <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950">
                  Encrypted Regulatory Depository Session
                </p>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  You have accessed the secure depository attestation micro-portal via an encrypted, single-use regulatory link. To unlock institution deposit records and attest Core Banking System (CBS) balances, please enter the 6-digit One-Time Password (OTP) dispatched to your registered branch email.
                </p>
              </div>
            </div>

            {/* Session Recipient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded border border-gray-200 font-sans">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Depository Bank:</span>
                <span className="font-bold text-gray-900 text-sm">
                  {session?.inst_bank_name || 'State Bank of India'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Registered Branch Manager Email:</span>
                <span className="font-mono text-blue-950 font-bold text-xs">
                  {session?.bank_manager_email || 'bm.pune@sbi.co.in'}
                </span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-1">
                <span className="text-[10px] text-gray-500">Cryptographic Magic-Link Token:</span>
                <span className="font-mono text-[10px] text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-300">
                  {session?.magic_link_token ? `${session.magic_link_token.slice(0, 18)}...` : 'ml_sec_849201'}
                </span>
              </div>
            </div>

            {/* OTP Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Authorization Code (OTP)
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                      if (otpError) setOtpError(null);
                    }}
                    placeholder="849201"
                    autoFocus
                    className="w-56 text-center text-2xl font-mono font-bold tracking-[0.3em] bg-gray-50 border-2 border-gray-300 focus:border-blue-900 focus:bg-white rounded-lg py-3 px-4 shadow-inner text-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-500 text-center mt-2">
                  Authorization Code sent to registered branch email • Demo OTP: <strong className="font-mono text-gray-800">849201</strong>
                </p>
                {otpError && (
                  <p className="text-xs text-red-600 font-bold text-center mt-2 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {otpError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4 text-amber-300" />
                <span>Verify OTP &amp; Open Attestation Desk</span>
              </button>
            </form>
          </div>

          <div className="border-t border-gray-200 pt-4 flex items-center justify-between text-[11px] text-gray-500">
            <span>Protected under Information Technology Act, 2000</span>
            <span className="flex items-center gap-1 font-semibold text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> 256-bit TLS Encrypted
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN DASHBOARD: Render only after OTP is verified
  return (
    <div id="bank-manager-portal" className="space-y-6">
      
      {/* High-Trust Authenticated Header */}
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
                <span className="text-[11px] font-mono text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  2FA Session Authenticated
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight mt-0.5">
                AICTE Regulatory Bureau — External Bank Branch Manager Attestation Micro-Portal
              </h2>
            </div>
          </div>

          {/* Authenticated Session Badge */}
          <div className="flex items-center space-x-3 bg-gray-50 border border-gray-300 p-2.5 rounded text-xs min-w-max">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" />
            <div>
              <div className="text-[10px] text-gray-600 uppercase font-bold">Authenticated Branch Manager</div>
              <div className="font-mono text-xs font-bold text-blue-950">
                {session?.bank_manager_email || 'bm.pune@sbi.co.in'}
              </div>
            </div>
            <span className="text-[10px] font-mono text-green-900 bg-green-100 border border-green-300 px-2 py-0.5 rounded font-bold">
              ACTIVE ✓
            </span>
          </div>
        </div>
      </div>

      {/* Vertical Data Table: Assigned FDR Attestation Queue */}
      <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-900" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Assigned FDR Attestation Queue
              </h3>
              <p className="text-[11px] text-gray-500">
                Select an FDR record from your branch queue below to review self-declared institution claims against Core Banking System (CBS) ledgers.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-blue-950 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded shrink-0">
            {fdrs.length} Instruments in Queue
          </span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-[11px] text-gray-700 font-bold uppercase tracking-wider bg-gray-100">
                <th className="py-2.5 px-3">FDR Receipt No</th>
                <th className="py-2.5 px-3">Institution Name</th>
                <th className="py-2.5 px-3">Claimed Principal</th>
                <th className="py-2.5 px-3">Maturity Date</th>
                <th className="py-2.5 px-3">Attestation Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans bg-white">
              {fdrs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No deposit instruments found in your branch attestation queue.
                  </td>
                </tr>
              ) : (
                fdrs.map((f) => {
                  const isSelected = selectedFdrUid === f.fdr_uid;
                  const instName = f.institution?.name || `Institution #${f.institution_id}`;
                  const fdrNumber = f.inst_fdr_number || f.fdr_uid;

                  return (
                    <tr
                      key={f.id}
                      onClick={() => handleSelectFdr(f.fdr_uid)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* FDR Receipt No */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-950">
                            {fdrNumber}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                            {f.fdr_uid}
                          </span>
                        </div>
                      </td>

                      {/* Institution Name */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-900 max-w-xs truncate" title={instName}>
                          {instName}
                        </div>
                        {f.institution?.pid && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            PID: {f.institution.pid}
                          </span>
                        )}
                      </td>

                      {/* Claimed Principal */}
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {formatCurrency(f.inst_principal_amount)}
                      </td>

                      {/* Maturity Date */}
                      <td className="py-3 px-3 font-mono text-gray-700">
                        {f.inst_maturity_date || '—'}
                      </td>

                      {/* Attestation Status */}
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          f.bank_verified_status === 'VERIFIED_MATCH'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : f.bank_verified_status === 'MISMATCH_FLAGGED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {f.bank_verified_status === 'VERIFIED_MATCH'
                            ? 'CBS Attested (Matched)'
                            : f.bank_verified_status === 'MISMATCH_FLAGGED'
                            ? 'Discrepancy Flagged'
                            : 'Pending Attestation'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFdr(f.fdr_uid);
                          }}
                          className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#1E3A8A] text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                          }`}
                        >
                          {isSelected ? 'Reviewing Form ↓' : 'Select for Attestation'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
                  <span className="text-gray-600">Bank &amp; Branch IFSC:</span>
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
                Official Core Banking System (CBS) Direct Attestation Form
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-950 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Depository CBS Terminal
            </span>
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
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>
                    Discrepancy: College claimed {formatCurrency(session.inst_principal_amount)} vs Bank CBS Truth {formatCurrency(actualPrincipal)}
                  </span>
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
                Authoritative CBS Lien &amp; Encumbrance Status <span className="text-red-600">*</span>
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
                placeholder="Enter core banking remarks and audit observations..."
                className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-xs text-gray-900 focus:outline-none focus:border-blue-900 font-sans"
              />
            </div>

            {/* Supporting CBS Attestation PDF Upload (AICTE Requirement 2 & 3) */}
            <div>
              <label className="text-[11px] text-gray-800 font-bold block mb-1">
                Supporting Bank Attestation PDF (Signed Confirmation / Stamped CBS Statement)
              </label>
              <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block truncate max-w-[260px]">
                      {attestationPdf ? attestationPdf.name : 'Upload Official Bank Confirmation PDF'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {attestationPdf 
                        ? `${(attestationPdf.size / 1024).toFixed(1)} KB • Routes to Cloudinary Digital Vault` 
                        : 'Routes to Cloudinary & permanently attaches as "Bank Attestation PDF"'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded border border-blue-200 cursor-pointer transition shrink-0">
                    Browse PDF
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttestationPdf(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {attestationPdf && (
                    <button
                      type="button"
                      onClick={() => setAttestationPdf(null)}
                      className="p-1 text-gray-400 hover:text-red-600 transition"
                      title="Clear file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
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
                  <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
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
                      <span>Return to Central Scrutiny Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
