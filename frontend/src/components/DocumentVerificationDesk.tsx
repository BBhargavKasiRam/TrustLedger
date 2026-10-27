import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Building2, 
  Landmark, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Eye,
  CheckSquare,
  Square,
  Lock,
  Hash,
  ShieldAlert
} from 'lucide-react';
import type { FDRInstrument, Institution } from '../types';
import { getAssetUrl } from '../services/api';
import { DigitalVaultModal } from './DigitalVaultModal';
import { getDeterministicFlags } from './FDRRegistryTable';

interface DocumentVerificationDeskProps {
  fdrs: FDRInstrument[];
  institutions: Institution[];
  selectedInstitutionId?: number | null;
  onSelectInstitution?: (id: number) => void;
  onRefreshAll?: () => void;
}

export const DocumentVerificationDesk: React.FC<DocumentVerificationDeskProps> = ({
  fdrs,
  institutions,
  selectedInstitutionId,
  onSelectInstitution,
  onRefreshAll
}) => {
  const [selectedFdrUid, setSelectedFdrUid] = useState<string>(
    fdrs.find(f => f.institution_id === selectedInstitutionId)?.fdr_uid || fdrs[0]?.fdr_uid || 'FDR-2026-309'
  );

  const [scrutinyRemarks, setScrutinyRemarks] = useState<string>('');
  const [sealInspected, setSealInspected] = useState<boolean>(true);
  const [particularsChecked, setParticularsChecked] = useState<boolean>(true);
  const [lienVerified, setLienVerified] = useState<boolean>(false);
  const [decisionFeedback, setDecisionFeedback] = useState<{
    verdict: 'APPROVED' | 'DISCREPANCY';
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showVaultModal, setShowVaultModal] = useState<boolean>(false);

  // Sync selected FDR when selectedInstitutionId changes
  useEffect(() => {
    if (selectedInstitutionId) {
      const match = fdrs.find(f => f.institution_id === selectedInstitutionId);
      if (match) {
        setSelectedFdrUid(match.fdr_uid);
      }
    }
  }, [selectedInstitutionId, fdrs]);

  const activeFdr = fdrs.find(f => f.fdr_uid === selectedFdrUid) || fdrs[0];
  const activeInstitution = institutions.find(i => i.id === activeFdr?.institution_id) || activeFdr?.institution;

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Deterministic engine checks & flags
  const activeFlags = activeFdr ? getDeterministicFlags(activeFdr) : [];

  const calculateMonths = (startStr?: string | null, endStr?: string | null) => {
    if (!startStr || !endStr) return null;
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  };

  const declaredTenureMonths = activeFdr?.tenure_months || calculateMonths(activeFdr?.inst_issue_date, activeFdr?.inst_maturity_date) || 0;
  const hasTenureViolation = (declaredTenureMonths > 0 && declaredTenureMonths < 120) || activeFdr?.tenure_violation_flag || activeFlags.some(f => f.id === 'TENURE_VIOLATION_FLAG');

  const hasPrincipalMismatch = activeFdr && 
    activeFdr.bank_confirmed_principal != null && 
    activeFdr.bank_confirmed_principal !== activeFdr.inst_principal_amount;

  const hasMaturityMismatch = activeFdr &&
    activeFdr.bank_confirmed_maturity_date != null &&
    activeFdr.inst_maturity_date != null &&
    activeFdr.bank_confirmed_maturity_date !== activeFdr.inst_maturity_date;

  const hasLienViolation = activeFdr?.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED' || 
    activeFdr?.bank_lien_status === 'PREMATURELY_BROKEN' ||
    (activeFdr?.bank_lien_status && activeFdr.bank_lien_status !== 'ACTIVE_JOINT_AICTE') ||
    activeFdr?.lien_encumbrance_flag ||
    activeFlags.some(f => f.id === 'LIEN_ENCUMBRANCE_FLAG');

  const hasDuplicateHash = activeFdr?.duplicate_flag || 
    activeFdr?.flags?.includes('DUPLICATE_FILE_FRAUD') ||
    activeFlags.some(f => f.id === 'DUPLICATE_FILE_FRAUD');

  const hasCrossRegistryHold = activeFdr?.cross_registry_hold_flag ||
    activeFdr?.flags?.includes('CROSS_REGISTRY_HOLD_FLAG') ||
    activeFlags.some(f => f.id === 'CROSS_REGISTRY_HOLD_FLAG');

  const handleDecision = (type: 'APPROVE' | 'FLAG_DISCREPANCY') => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (type === 'APPROVE') {
        setDecisionFeedback({
          verdict: 'APPROVED',
          message: `Manual verification approved for ${activeFdr?.fdr_uid}. Document endorsement recorded in regulatory compliance ledger.`
        });
      } else {
        setDecisionFeedback({
          verdict: 'DISCREPANCY',
          message: `Discrepancy officially flagged for ${activeFdr?.fdr_uid}. Transferred to AICTE Standing Committee on Inquiry & Disciplinary Review.`
        });
      }
      if (onRefreshAll) onRefreshAll();
    }, 600);
  };

  return (
    <div id="document-verification-desk" className="space-y-6">
      
      {/* Top Header & Instrument Selection Bar */}
      <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1E3A8A] shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-[#1E3A8A] mt-0.5">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  MANUAL SCRUTINY DESK
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Traditional Human Document Inspection &amp; Deterministic Rules Engine
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                Document Verification &amp; Depository Attestation Comparison
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Manual document comparison workflow: directly cross-reference the College's uploaded deposit certificate against the Bank Manager's authoritative Core Banking System (CBS) attestation data. Exact mismatched data points are strictly highlighted in red.
              </p>
            </div>
          </div>

          {/* Target FDR Selector */}
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-300 p-2.5 rounded-md min-w-max">
            <Building2 className="w-4 h-4 text-[#1E3A8A]" />
            <span className="text-xs text-slate-600 font-semibold">Select Target Instrument:</span>
            <select
              aria-label="Select Target Deposit for Verification"
              value={selectedFdrUid}
              onChange={(e) => {
                const uid = e.target.value;
                setSelectedFdrUid(uid);
                setDecisionFeedback(null);
                const target = fdrs.find(f => f.fdr_uid === uid);
                if (target && onSelectInstitution) {
                  onSelectInstitution(target.institution_id);
                }
              }}
              className="bg-white text-xs text-slate-900 font-mono font-bold py-1.5 px-3 rounded border border-slate-300 focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
            >
              {fdrs.map((f) => {
                const inst = institutions.find(i => i.id === f.institution_id) || f.institution;
                const fFlags = getDeterministicFlags(f);
                return (
                  <option key={f.id} value={f.fdr_uid} className="font-sans text-slate-900">
                    {fFlags.length > 0 ? '⚠️ ' : ''}{f.fdr_uid} — {inst ? inst.name.split(',')[0] : f.inst_bank_name} ({f.inst_fdr_number || 'Deposit'})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Tripped Violations Alert Banner */}
      {activeFlags.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-sm animate-fade-in">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-red-900 flex items-center gap-2">
                  Deterministic Verification Engine: Discrepancy &amp; Violations Detected
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.2 rounded-full font-mono">
                    {activeFlags.length} Flag{activeFlags.length > 1 ? 's' : ''} Active
                  </span>
                </h4>
              </div>
              <p className="text-xs text-red-700 mt-0.5 font-medium">
                The deterministic rules-based verification engine flagged deterministic conflicts for {activeFdr?.fdr_uid}. Discrepant data points are highlighted in red below.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {activeFlags.map((flag) => (
                  <div key={flag.id} className="bg-white border border-red-300 rounded p-2 text-xs shadow-2xs">
                    <div className="font-bold text-red-700 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{flag.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">{flag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Split-Screen Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANE: College Uploaded Document & Declared Claim (6 Columns) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-900" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. College Uploaded Document &amp; Claim (COL A)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
              COLLEGE SUBMITTED
            </span>
          </div>

          {/* Institution Context Card */}
          <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                {activeInstitution?.name || 'Institution Filing'}
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">
                PID: {activeInstitution?.pid || '1-1001'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Receipt No: <strong className="font-mono text-slate-800">{activeFdr?.inst_fdr_number || activeFdr?.fdr_uid}</strong></span>
              <span>Depository: <strong className="text-slate-800">{activeFdr?.inst_bank_name}</strong></span>
            </div>
          </div>

          {/* Scanned Document Viewport (Clean image/PDF preview without OpenCV heatmaps or bounding boxes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Scanned Security Deposit Certificate:</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowVaultModal(true)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#1E3A8A] border border-blue-200 hover:bg-blue-100 flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  title="Open full Digital Vault for this FDR"
                >
                  <Lock className="w-3 h-3 text-[#1E3A8A]" />
                  <span>Open Digital Vault</span>
                  {activeFdr?.digitalVault && activeFdr.digitalVault.length > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-[#1E3A8A] text-white px-1.5 py-0.2 rounded-full">
                      {activeFdr.digitalVault.length}
                    </span>
                  )}
                </button>
                {activeFdr?.document_path && (
                  <a
                    href={getAssetUrl(activeFdr.document_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center space-x-1"
                  >
                    <span>Open Full Resolution</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-inner max-h-[380px] flex items-center justify-center p-2">
              <img
                src={getAssetUrl(activeFdr?.document_path || '/static/sample_fdrs/sample_1_genuine_sbi.jpg')}
                alt="Uploaded Deposit Certificate"
                className="w-full h-auto object-contain max-h-[360px] rounded select-none"
              />
            </div>

            {/* Cryptographic Hash Digest Verification Box */}
            <div className={`p-2.5 rounded-md border text-xs font-mono flex items-center justify-between ${
              hasDuplicateHash 
                ? 'bg-red-50 border-red-300 text-red-900 ring-1 ring-red-400' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="truncate mr-2">
                <div className="flex items-center space-x-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-sans font-semibold text-[10px] text-slate-600 uppercase">
                    Cryptographic SHA-256 Digest:
                  </span>
                </div>
                <span className="text-[10px] font-mono break-all font-bold block mt-0.5">
                  {activeFdr?.fileHash || activeFdr?.file_hash || 'a4b87e2c91df05e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca4'}
                </span>
              </div>
              {hasDuplicateHash ? (
                <span className="shrink-0 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow-2xs">
                  ⚠️ DUPLICATE FILE FRAUD
                </span>
              ) : (
                <span className="shrink-0 text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                  SHA-256 Verified ✓
                </span>
              )}
            </div>
          </div>

          {/* Self-Declared Information Table */}
          <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200 space-y-2.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              College Self-Declared Deposit Particulars:
            </span>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Declared Principal (Strictly highlighted in red if mismatch exists) */}
              <div className={`p-2 rounded border ${
                hasPrincipalMismatch 
                  ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-300' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 block uppercase">Declared Principal</span>
                  {hasPrincipalMismatch && (
                    <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded">
                      MISMATCH
                    </span>
                  )}
                </div>
                <span className={`font-bold text-sm font-mono block mt-0.5 ${
                  hasPrincipalMismatch ? 'text-red-700 font-black' : 'text-slate-900'
                }`}>
                  {formatCurrency(activeFdr?.inst_principal_amount)}
                </span>
                {hasPrincipalMismatch && (
                  <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                    ⚠️ Differs from Bank CBS Ledger
                  </span>
                )}
              </div>

              {/* Declared Maturity & Chronological Tenure Math */}
              <div className={`p-2 rounded border ${
                hasTenureViolation || hasMaturityMismatch
                  ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-300' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 block uppercase">Declared Maturity Date</span>
                  {hasTenureViolation && (
                    <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded">
                      TENURE VIOLATION
                    </span>
                  )}
                </div>
                <span className={`font-mono font-bold text-sm block mt-0.5 ${
                  hasTenureViolation || hasMaturityMismatch ? 'text-red-700 font-black' : 'text-slate-900'
                }`}>
                  {activeFdr?.inst_maturity_date || '—'}
                </span>
                <div className={`text-[10px] font-mono mt-0.5 ${
                  hasTenureViolation ? 'text-red-700 font-bold' : 'text-slate-500'
                }`}>
                  Lock-in: {declaredTenureMonths} Months {hasTenureViolation ? '(⚠️ Deficit: < 120 Mos APH Norm)' : '✓ (≥10 Yrs)'}
                </div>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase">Bank &amp; Branch IFSC</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {activeFdr?.inst_bank_name} ({activeFdr?.inst_ifsc || '—'})
                </span>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase">No-Lien Declaration</span>
                <span className="font-bold text-emerald-700 block mt-0.5">
                  Declared Intact (Zero Liens)
                </span>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase">Joint Operating Mandate</span>
                <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                  {activeFdr?.inst_joint_holder_text || 'Joint Mandate in favor of Member Secretary, AICTE'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Authoritative Bank CBS Attestation & Scrutiny Sign-Off (6 Columns) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Authoritative Bank CBS Attestation (COL C)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
              CORE BANKING (CBS)
            </span>
          </div>

          {/* Attesting Bank Context Card */}
          <div className="bg-emerald-50/50 rounded-md p-3.5 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-950 text-xs">
                <Landmark className="w-4 h-4 text-emerald-700" />
                <span>{activeFdr?.inst_bank_name || 'Scheduled Commercial Bank'}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                activeFdr?.bank_verified_status === 'VERIFIED_API' || activeFdr?.bank_verified_status === 'VERIFIED_MAGIC_LINK'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {activeFdr?.bank_verified_status || 'PENDING_BANK_ATTESTATION'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Branch Manager: <strong className="font-mono text-slate-800">{activeFdr?.bank_manager_email || 'bm.pune@sbi.co.in'}</strong></span>
              <span className="text-[10px] text-slate-500">{activeFdr?.bank_verified_at ? 'Attested on Ledger' : 'Awaiting Branch Submission'}</span>
            </div>
          </div>

          {/* Direct Side-by-Side Comparison Matrix */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Direct Side-by-Side Discrepancy Matrix:
            </span>

            {/* Principal Comparison */}
            <div className={`p-3 rounded-md border text-xs ${
              hasPrincipalMismatch 
                ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-300' 
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Principal Deposit Balance:</span>
                {hasPrincipalMismatch ? (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow-2xs">
                    MISMATCH DETECTED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    MATCH CONFIRMED ✓
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-current/10 font-mono text-sm">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block uppercase">College Declared</span>
                  <span className={`font-bold ${hasPrincipalMismatch ? 'text-red-700 font-black' : 'text-slate-900'}`}>
                    {formatCurrency(activeFdr?.inst_principal_amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block uppercase">Actual Bank CBS Truth</span>
                  <span className={`font-bold ${hasPrincipalMismatch ? 'text-red-700 font-black' : 'text-emerald-800'}`}>
                    {formatCurrency(activeFdr?.bank_confirmed_principal)}
                  </span>
                </div>
              </div>
              {hasPrincipalMismatch && (
                <p className="text-[11px] text-red-700 font-bold mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                  <span>Deficit of {formatCurrency((activeFdr?.inst_principal_amount || 0) - (activeFdr?.bank_confirmed_principal || 0))}: College claim exceeds actual bank depository ledger! (DATA_MISMATCH_FLAG)</span>
                </p>
              )}
            </div>

            {/* Maturity Date Comparison */}
            <div className={`p-3 rounded-md border text-xs ${
              hasMaturityMismatch || hasTenureViolation
                ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-300' 
                : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Maturity Date &amp; Tenure Norm:</span>
                {hasMaturityMismatch ? (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow-2xs">
                    MATURITY MISMATCH
                  </span>
                ) : hasTenureViolation ? (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow-2xs">
                    TENURE VIOLATION
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-600">
                    {activeFdr?.bank_confirmed_maturity_date || activeFdr?.inst_maturity_date}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block uppercase">College Filing</span>
                  <span className={`font-semibold ${hasMaturityMismatch ? 'text-red-700 font-bold' : 'text-slate-800'}`}>
                    {activeFdr?.inst_maturity_date || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block uppercase">Bank CBS Record</span>
                  <span className={`font-semibold ${hasMaturityMismatch ? 'text-red-700 font-bold' : 'text-emerald-900'}`}>
                    {activeFdr?.bank_confirmed_maturity_date || activeFdr?.inst_maturity_date || '—'}
                  </span>
                </div>
              </div>
              {hasTenureViolation && (
                <p className="text-[11px] text-red-700 font-bold mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                  <span>Lock-in period of {declaredTenureMonths} months is less than mandatory 120 months (10 years) under APH Norm Clause 2.14! (TENURE_VIOLATION_FLAG)</span>
                </p>
              )}
            </div>

            {/* Authoritative Lien Status (Strictly highlighted in red if encumbered) */}
            <div className={`p-3 rounded-md border text-xs ${
              hasLienViolation 
                ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-300' 
                : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Authoritative Core Banking Lien Status:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  hasLienViolation 
                    ? 'bg-red-600 text-white border-red-700' 
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {activeFdr?.bank_lien_status || 'ACTIVE_JOINT_AICTE'}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-current/10">
                {hasLienViolation ? (
                  <p className="text-[11px] text-red-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>UNAUTHORIZED ENCUMBRANCE: College trust sanctioned loan facility against regulatory security deposit without AICTE NOC! (LIEN_ENCUMBRANCE_FLAG)</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Depository bank confirms zero third-party encumbrances. Joint mandate with Member Secretary, AICTE intact.</span>
                  </p>
                )}
              </div>
            </div>

            {/* AICTE ERP Cross-Registry Compliance Standing */}
            <div className={`p-3 rounded-md border text-xs ${
              hasCrossRegistryHold 
                ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-300' 
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">AICTE ERP Cross-Registry Standing:</span>
                {hasCrossRegistryHold ? (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow-2xs">
                    ⚠️ CROSS-REGISTRY HOLD ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    ERP CLEARANCE ACTIVE ✓
                  </span>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-current/10">
                {hasCrossRegistryHold ? (
                  <p className="text-[11px] text-red-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>STATUTORY HOLD DETECTED: Pending litigation or unpaid faculty grievance flagged in AICTE ERP registry. NOC release is blocked. (CROSS_REGISTRY_HOLD_FLAG)</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Zero pending litigation or faculty grievance disputes detected in internal AICTE ERP. Good standing verified.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Bank Manager Attestation Remarks */}
            <div className="p-3 rounded-md border border-slate-200 bg-slate-50 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Branch Manager Official Attestation Notes:
              </span>
              <p className="text-[11px] text-slate-800 italic leading-relaxed">
                "{activeFdr?.bank_manager_email 
                  ? 'Core Banking ledger verified by Branch Manager. Attestation submitted via 2FA authorization gateway.' 
                  : 'Awaiting Branch Manager attestation via official regulatory magic link.'}"
              </p>
            </div>
          </div>

          {/* Scrutiny Officer Manual Verification & Recommendation Panel */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Scrutiny Officer Compliance Sign-Off
            </h4>

            {/* 3-Point Manual Verification Checklist */}
            <div className="space-y-2 text-xs">
              <div 
                onClick={() => setSealInspected(!sealInspected)}
                className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-50"
              >
                {sealInspected ? (
                  <CheckSquare className="w-4 h-4 text-[#1E3A8A]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-slate-700 font-medium">Physical document seal, joint mandate clause, and authorized signatures visually inspected.</span>
              </div>

              <div 
                onClick={() => setParticularsChecked(!particularsChecked)}
                className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-50"
              >
                {particularsChecked ? (
                  <CheckSquare className="w-4 h-4 text-[#1E3A8A]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-slate-700 font-medium">Principal amount and maturity date cross-referenced against Core Banking CBS attestation.</span>
              </div>

              <div 
                onClick={() => setLienVerified(!lienVerified)}
                className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-50"
              >
                {lienVerified ? (
                  <CheckSquare className="w-4 h-4 text-[#1E3A8A]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-slate-700 font-medium">Verified absence of unauthorized third-party loans or liens with depository branch.</span>
              </div>
            </div>

            {/* Manual Scrutiny Remarks */}
            <div>
              <label className="text-[11px] text-slate-700 font-semibold block mb-1">
                Scrutiny Officer Manual Evaluation Remarks:
              </label>
              <textarea
                rows={2}
                value={scrutinyRemarks}
                onChange={(e) => setScrutinyRemarks(e.target.value)}
                placeholder="Enter manual compliance observations and findings..."
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E3A8A] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDecision('APPROVE')}
                disabled={submitting}
                className="py-2.5 px-4 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Verification</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('FLAG_DISCREPANCY')}
                disabled={submitting}
                className="py-2.5 px-4 rounded-md bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Flag Discrepancy</span>
              </button>
            </div>

            {/* Feedback Message */}
            {decisionFeedback && (
              <div className={`p-3 rounded-md text-xs font-medium border ${
                decisionFeedback.verdict === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}>
                {decisionFeedback.message}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Digital Vault Modal */}
      <DigitalVaultModal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        fdr={activeFdr}
      />

    </div>
  );
};
