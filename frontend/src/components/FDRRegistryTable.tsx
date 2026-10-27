import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  GitBranch, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  Building2,
  Lock,
  Filter,
  ShieldAlert,
  Download
} from 'lucide-react';
import type { FDRInstrument } from '../types';
import { DigitalVaultModal } from './DigitalVaultModal';

interface FDRRegistryTableProps {
  fdrs: FDRInstrument[];
  loading?: boolean;
  onRefresh?: () => void;
}

export interface DeterministicFlag {
  id: string;
  label: string;
  description: string;
}

export const getDeterministicFlags = (fdr: FDRInstrument): DeterministicFlag[] => {
  const flags: DeterministicFlag[] = [];
  const rawFlags = fdr.flags || [];

  // 1. Cryptographic Duplicate File Hashing
  if (fdr.duplicate_flag || rawFlags.includes('DUPLICATE_FILE_FRAUD')) {
    flags.push({
      id: 'DUPLICATE_FILE_FRAUD',
      label: '⚠️ DUPLICATE HASH DETECTED',
      description: 'Identical SHA-256 cryptographic file digest detected across multiple submissions.',
    });
  }

  // 2. Chronological Rule Engine: 10-Year (120 Month) Tenure Validation
  let isTenureViolation = fdr.tenure_violation_flag || rawFlags.includes('TENURE_VIOLATION_FLAG');
  if (!isTenureViolation && fdr.inst_issue_date && fdr.inst_maturity_date) {
    const start = new Date(fdr.inst_issue_date);
    const end = new Date(fdr.inst_maturity_date);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (months < 120) {
        isTenureViolation = true;
      }
    }
  }
  if (isTenureViolation) {
    flags.push({
      id: 'TENURE_VIOLATION_FLAG',
      label: '⚠️ TENURE VIOLATION',
      description: `Deposit lock-in period (${fdr.tenure_months || '<120'} months) fails mandatory 10-year (120-month) APH requirement.`,
    });
  }

  // 3. Dual-Blind Delta Comparison: Principal or Maturity Mismatch
  const hasDataMismatch = fdr.data_mismatch_flag || 
    rawFlags.includes('DATA_MISMATCH_FLAG') || 
    fdr.bank_verified_status === 'MISMATCH_FLAGGED' ||
    (fdr.bank_confirmed_principal != null && fdr.bank_confirmed_principal !== fdr.inst_principal_amount) ||
    (fdr.bank_confirmed_maturity_date && fdr.inst_maturity_date && fdr.bank_confirmed_maturity_date !== fdr.inst_maturity_date);

  if (hasDataMismatch) {
    flags.push({
      id: 'DATA_MISMATCH_FLAG',
      label: '⚠️ DATA MISMATCH',
      description: 'College claimed principal or maturity date deviates from Authoritative Core Banking (CBS) record.',
    });
  }

  // 4. Lien & Encumbrance Detection
  const hasLienViolation = fdr.lien_encumbrance_flag || 
    rawFlags.includes('LIEN_ENCUMBRANCE_FLAG') || 
    (fdr.bank_lien_status && fdr.bank_lien_status !== 'ACTIVE_JOINT_AICTE');

  if (hasLienViolation) {
    flags.push({
      id: 'LIEN_ENCUMBRANCE_FLAG',
      label: '⚠️ LIEN ACTIVE',
      description: 'Depository bank indicates unauthorized lien or loan facility sanctioned against FDR.',
    });
  }

  // 5. Cross-Registry AICTE ERP Hold
  if (fdr.cross_registry_hold_flag || rawFlags.includes('CROSS_REGISTRY_HOLD_FLAG')) {
    flags.push({
      id: 'CROSS_REGISTRY_HOLD_FLAG',
      label: '⚠️ CROSS-REGISTRY HOLD',
      description: 'Statutory hold flagged in internal AICTE ERP (e.g. pending litigation or unpaid faculty salaries).',
    });
  }

  return flags;
};

export const FDRRegistryTable: React.FC<FDRRegistryTableProps> = ({ fdrs }) => {
  const [selectedVaultFdr, setSelectedVaultFdr] = useState<FDRInstrument | null>(null);
  const [filterFlaggedOnly, setFilterFlaggedOnly] = useState<boolean>(false);
  const [sortByMaturityAsc, setSortByMaturityAsc] = useState<boolean>(true);

  const calculateDaysRemainingUtc = (matStr?: string | null) => {
    if (!matStr) return 9999;
    try {
      const now = new Date();
      const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const parts = matStr.split('T')[0].split('-');
      if (parts.length < 3) return 9999;
      const matUtc = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return Math.ceil((matUtc - todayUtc) / (1000 * 60 * 60 * 24));
    } catch {
      return 9999;
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

  const getStatusBadge = (status: string, daysRemaining?: number | null) => {
    switch (status) {
      case 'EXPIRED_ACTION_REQUIRED':
      case 'MATURED_ACTION_PENDING':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-900 border border-red-300 font-semibold px-2.5 py-0.5 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-red-700" />
            <span>EXPIRED • ACTION REQUIRED</span>
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-800 border border-red-300 font-semibold px-2.5 py-0.5 rounded text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>DISCREPANCY FLAGGED</span>
          </span>
        );
      case 'MATURITY_T30':
      case 'APPROACHING_MATURITY_T30':
        return (
          <span className="inline-flex items-center space-x-1 bg-orange-50 text-orange-900 border border-orange-300 font-semibold px-2.5 py-0.5 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-orange-700" />
            <span>CRITICAL EXPIRY: T-30</span>
          </span>
        );
      case 'MATURITY_T60':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2.5 py-0.5 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>ADVISORY: T-60</span>
          </span>
        );
      case 'MATURITY_T90':
      case 'APPROACHING_MATURITY_T90':
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 border border-blue-300 font-semibold px-2.5 py-0.5 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            <span>WATCHDOG: T-90</span>
          </span>
        );
      case 'RENEWED_SUPERSEDED':
        return (
          <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2.5 py-0.5 rounded text-xs">
            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            <span>SUPERSEDED BY DAG</span>
          </span>
        );
      case 'RELEASE_APPROVED_NOC_ISSUED':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold px-2.5 py-0.5 rounded text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>NOC ISSUED &amp; DISCHARGED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold px-2.5 py-0.5 rounded text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{status} {daysRemaining != null && daysRemaining < 9999 ? `(${daysRemaining}d)` : ''}</span>
          </span>
        );
    }
  };

  // Compute flagged count and sorted/filtered records (AICTE Requirement 4)
  const { processedFdrs, flaggedCount } = useMemo(() => {
    let count = 0;
    const itemsWithFlags = fdrs.map(f => {
      const flags = getDeterministicFlags(f);
      if (flags.length > 0) count++;
      const matStr = f.bankAttestedMaturityDate || f.bank_confirmed_maturity_date || f.inst_maturity_date;
      const daysRemaining = f.daysRemaining !== undefined && f.daysRemaining !== null
        ? f.daysRemaining
        : calculateDaysRemainingUtc(matStr);
      return { fdr: f, flags, daysRemaining };
    });

    let displayList = itemsWithFlags;

    if (filterFlaggedOnly) {
      displayList = itemsWithFlags.filter(item => item.flags.length > 0);
    }

    if (sortByMaturityAsc) {
      // AICTE Requirement 4: Automatically sort records by "Days Remaining" in ascending order
      // so the most critically expiring deposits always float to the very top
      displayList = [...displayList].sort((a, b) => a.daysRemaining - b.daysRemaining);
    } else if (!filterFlaggedOnly) {
      displayList = [...displayList].sort((a, b) => b.flags.length - a.flags.length);
    }

    return { processedFdrs: displayList, flaggedCount: count };
  }, [fdrs, filterFlaggedOnly, sortByMaturityAsc]);

  return (
    <div id="centralized-fdr-repository" className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1E3A8A] shadow-sm p-6">
      
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-[#1E3A8A]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Centralized Security Deposit / FDR Repository
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200">
                  Dual-Truth Direct Comparison
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Centralized statutory registry across all approved technical institutions under APH Norms. Direct side-by-side comparison of Institution Claim and Authoritative Bank Core Banking (CBS) Truth.
              </p>
            </div>
          </div>
        </div>

        {/* Quick-Filter & Metric Counters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs shrink-0">
          {/* AICTE Requirement 8: Consolidated Management Report CSV Export */}
          <button
            type="button"
            onClick={() => {
              window.open('/api/reports/export-csv', '_blank');
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-800 shadow-2xs cursor-pointer transition"
            title="Download Consolidated Management Report (CSV) containing full institution & deposit truth"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Management Report (CSV)</span>
          </button>

          {/* AICTE Requirement 4: Maturity Countdown Sort Button */}
          <button
            type="button"
            onClick={() => setSortByMaturityAsc(!sortByMaturityAsc)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold text-xs border transition shadow-2xs cursor-pointer ${
              sortByMaturityAsc
                ? 'bg-[#1E3A8A] text-white border-blue-950 ring-2 ring-blue-300'
                : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
            }`}
            title="Sort records by Days Remaining in ascending order (Critically expiring deposits float to top)"
          >
            <Clock className="w-3.5 h-3.5 text-inherit" />
            <span>Maturity Countdown (Asc)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterFlaggedOnly(!filterFlaggedOnly)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold text-xs border transition shadow-2xs cursor-pointer ${
              filterFlaggedOnly
                ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-400 ring-offset-1'
                : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-inherit" />
            <span>Requires Scrutiny (Flagged)</span>
            <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
              filterFlaggedOnly ? 'bg-white text-red-700' : 'bg-red-600 text-white'
            }`}>
              {flaggedCount}
            </span>
          </button>

          {filterFlaggedOnly && (
            <button
              type="button"
              onClick={() => setFilterFlaggedOnly(false)}
              className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer font-medium text-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Show All ({fdrs.length})</span>
            </button>
          )}

          <div className="flex items-center space-x-1 text-slate-600 pl-2 border-l border-slate-300">
            <span className="font-medium">Total:</span>
            <span className="font-mono font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {fdrs.length}
            </span>
          </div>
        </div>
      </div>

      {/* FDR Table */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">FDR UID / Lineage &amp; Flags</th>
              <th className="py-3 px-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">Institution</th>
              
              {/* Direct Dual-Truth Comparison Headers */}
              <th className="py-3 px-3.5 border-b-2 border-slate-400 bg-slate-100 text-slate-800 border-l border-slate-200 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>COL A: INSTITUTION CLAIM</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                  COLLEGE SUBMITTED
                </span>
              </th>

              <th className="py-3 px-3.5 border-b-2 border-emerald-600 bg-emerald-50 text-emerald-950 border-l border-emerald-200 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                  <span>COL C: AUTHORITATIVE BANK TRUTH</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded mt-1 inline-block">
                  CORE BANKING (CBS)
                </span>
              </th>

              <th className="py-3 px-3 border-b border-slate-200 bg-slate-50 text-slate-700 border-l border-slate-200 text-center font-bold">
                Digital Vault (Multi-Doc)
              </th>

              <th className="py-3 px-3.5 border-b border-slate-200 bg-slate-50 text-slate-700 border-l border-slate-200">Lifecycle Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {processedFdrs.map(({ fdr, flags, daysRemaining }) => {
              const hasFlags = flags.length > 0;
              const hasLineageParent = !!fdr.parent_fdr_id;
              const isSlaBreached = !!((fdr as any).slaBreached || (fdr as any).sla_breached);

              return (
                <tr 
                  key={fdr.id} 
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSlaBreached
                      ? 'bg-red-100/50 border-l-4 border-l-red-700 ring-1 ring-red-400'
                      : hasFlags 
                      ? 'bg-red-50/30 border-l-4 border-l-red-500' 
                      : ''
                  }`}
                >
                  
                  {/* UID & Lineage & Deterministic Flags */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap align-top">
                    <div className="font-mono font-bold text-[#1E3A8A] text-sm">{fdr.fdr_uid}</div>
                    
                    {isSlaBreached && (
                      <div className="mt-1">
                        <span className="inline-flex items-center space-x-1 bg-red-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>CRITICAL SLA BREACH</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1.5 mt-1">
                      {hasLineageParent ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-semibold">
                          <GitBranch className="w-3 h-3 text-amber-700" />
                          <span>Re-issued (Bank Merger)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Initial Deposit
                        </span>
                      )}
                    </div>

                    {/* Distinct Red Badges for Flagged Violations */}
                    {hasFlags && (
                      <div className="flex flex-col gap-1 mt-2">
                        {flags.map((flag) => (
                          <span
                            key={flag.id}
                            title={flag.description}
                            className="inline-flex items-center space-x-1 bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs whitespace-nowrap max-w-fit"
                          >
                            <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                            <span>{flag.label}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Institution */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap align-top">
                    <div className="font-semibold text-slate-900">
                      {fdr.institution?.name || `Institution #${fdr.institution_id}`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      PID: <strong className="text-slate-700">{fdr.institution?.pid}</strong> • {fdr.institution?.programme_tier}
                    </div>
                  </td>

                  {/* Column Set A: College Claim */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap bg-slate-50/50 border-l border-slate-200 align-top">
                    <div className="font-bold text-slate-900 text-sm">
                      {formatCurrency(fdr.inst_principal_amount)}
                    </div>
                    <div className="text-[10px] text-slate-600 flex items-center space-x-1 mt-0.5">
                      <Landmark className="w-3 h-3 text-slate-400" />
                      <span>{fdr.inst_bank_name} ({fdr.inst_ifsc})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Matures: {fdr.inst_maturity_date || '—'}
                    </div>
                    {fdr.tenure_months ? (
                      <div className={`text-[10px] font-mono mt-0.5 ${
                        fdr.tenure_months < 120 ? 'text-red-700 font-bold' : 'text-slate-500'
                      }`}>
                        Tenure: {fdr.tenure_months} mos {fdr.tenure_months < 120 ? '(Violates 120 mo)' : '✓'}
                      </div>
                    ) : null}
                  </td>

                  {/* Column Set C: Bank Truth */}
                  <td className={`py-3.5 px-3.5 whitespace-nowrap border-l align-top ${
                    fdr.bank_verified_status === 'MISMATCH_FLAGGED' || fdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED' || (fdr.bank_confirmed_principal != null && fdr.bank_confirmed_principal !== fdr.inst_principal_amount)
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-emerald-50/30 border-emerald-100'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-sm ${fdr.bank_confirmed_principal !== fdr.inst_principal_amount ? 'text-red-700' : 'text-emerald-800'}`}>
                        {formatCurrency(fdr.bank_confirmed_principal)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        fdr.bank_verified_status === 'VERIFIED_API' || fdr.bank_verified_status === 'VERIFIED_MAGIC_LINK'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}>
                        {fdr.bank_verified_status}
                      </span>
                    </div>
                    <div className="text-[10px] mt-1 font-medium">
                      {fdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED' ? (
                        <span className="text-red-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          LOAN TAKEN ENCUMBERED (Unauthorized!)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          Joint AICTE Lien Active ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Attested by: {fdr.bank_manager_email || '—'}
                    </div>
                  </td>

                  {/* AICTE Requirement 2: Digital Vault Retrieval */}
                  <td className="py-3.5 px-3 whitespace-nowrap border-l border-slate-200 text-center align-top">
                    <button
                      type="button"
                      onClick={() => setSelectedVaultFdr(fdr)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 font-semibold text-xs shadow-2xs transition cursor-pointer"
                      title="Open multi-file Digital Vault for this FDR"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Open Digital Vault</span>
                      {fdr.digitalVault && fdr.digitalVault.length > 0 && (
                        <span className="ml-0.5 text-[10px] font-mono font-bold bg-[#1E3A8A] text-white px-1.5 py-0.2 rounded-full">
                          {fdr.digitalVault.length}
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Lifecycle Status & Maturity Countdown Metric */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap border-l border-slate-200 align-top">
                    {getStatusBadge(fdr.lifecycleState || fdr.lifecycle_status, daysRemaining)}
                    <div className="text-[10px] font-mono mt-1 font-semibold flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {daysRemaining <= 0 ? (
                        <span className="text-red-700 font-bold">{Math.abs(daysRemaining)}d OVERDUE</span>
                      ) : daysRemaining <= 90 ? (
                        <span className="text-amber-800 font-bold">{daysRemaining}d remaining (Watchdog)</span>
                      ) : (
                        <span className="text-slate-500">{daysRemaining}d remaining</span>
                      )}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Digital Vault Modal */}
      <DigitalVaultModal
        isOpen={!!selectedVaultFdr}
        onClose={() => setSelectedVaultFdr(null)}
        fdr={selectedVaultFdr}
      />

    </div>
  );
};
