import React from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  GitBranch, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Building2,
  Eye
} from 'lucide-react';
import type { FDRInstrument } from '../types';

interface FDRRegistryTableProps {
  fdrs: FDRInstrument[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const FDRRegistryTable: React.FC<FDRRegistryTableProps> = ({ fdrs }) => {
  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATURED_ACTION_PENDING':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2.5 py-0.5 rounded text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>MATURED: ACTION PENDING</span>
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-800 border border-red-300 font-semibold px-2.5 py-0.5 rounded text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>DISCREPANCY FLAGGED</span>
          </span>
        );
      case 'APPROACHING_MATURITY_T30':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2.5 py-0.5 rounded text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>CRITICAL EXPIRY: T-30</span>
          </span>
        );
      case 'APPROACHING_MATURITY_T90':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2.5 py-0.5 rounded text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>APPROACHING: T-90</span>
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
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1E3A8A] shadow-sm p-6">
      
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
                  Tri-Party Dual-Truth
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Centralized statutory registry across all approved technical institutions under APH Norms. Explicitly isolates institution claims from AI forensics and authoritative bank confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 shrink-0">
          <span className="font-medium">Total Seeded Instruments:</span>
          <span className="font-mono font-bold text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {fdrs.length} Active Records
          </span>
        </div>
      </div>

      {/* FDR Table */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">FDR UID / Lineage</th>
              <th className="py-3 px-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">Institution</th>
              
              {/* Distinct 3-Way Tri-Party Isolation Headers (Strictly UX4G Specification) */}
              <th className="py-3 px-3.5 border-b-2 border-slate-400 bg-slate-100 text-slate-800 border-l border-slate-200 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>COL A: INSTITUTION CLAIM</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                  COLLEGE SUBMITTED
                </span>
              </th>

              <th className="py-3 px-3.5 border-b-2 border-indigo-500 bg-indigo-50 text-indigo-950 border-l border-indigo-200 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-700" />
                  <span>COL B: AI FORENSICS</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded mt-1 inline-block">
                  VISION AI • OCR • MATH
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

              <th className="py-3 px-3.5 border-b border-slate-200 bg-slate-50 text-slate-700 border-l border-slate-200">Lifecycle Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {fdrs.map((fdr) => {
              const hasDiscrepancy = fdr.math_tamper_flag || fdr.bank_verified_status === 'MISMATCH_FLAGGED';
              const hasLineageParent = !!fdr.parent_fdr_id;

              return (
                <tr key={fdr.id} className={`hover:bg-slate-50/80 transition-colors ${hasDiscrepancy ? 'bg-red-50/40' : ''}`}>
                  
                  {/* UID & Lineage */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                    <div className="font-mono font-bold text-[#1E3A8A] text-sm">{fdr.fdr_uid}</div>
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
                  </td>

                  {/* Institution */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {fdr.institution?.name || `Institution #${fdr.institution_id}`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      PID: <strong className="text-slate-700">{fdr.institution?.pid}</strong> • {fdr.institution?.programme_tier}
                    </div>
                  </td>

                  {/* Column Set A: College Claim */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap bg-slate-50/50 border-l border-slate-200">
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
                  </td>

                  {/* Column Set B: AI Forensics */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap bg-indigo-50/30 border-l border-indigo-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {formatCurrency(fdr.ocr_principal_amount)}
                      </span>
                      {fdr.math_tamper_flag ? (
                        <span className="inline-flex items-center space-x-1 bg-red-50 text-red-800 border border-red-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                          <ShieldAlert className="w-3 h-3 text-red-600" />
                          <span>Math Tamper Flag!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                          <span>Math Verified ✓</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      ELA Tamper Score: <strong className={fdr.ela_tamper_score && fdr.ela_tamper_score > 0.5 ? 'text-red-600 font-bold' : 'text-slate-800'}>{fdr.ela_tamper_score ?? '0.00'}</strong>
                      {fdr.ocr_joint_clause_found && ' • Joint AICTE Clause ✓'}
                    </div>
                    {fdr.math_expected_maturity && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Calculated Yield: {formatCurrency(fdr.math_expected_maturity)}
                      </div>
                    )}
                  </td>

                  {/* Column Set C: Bank Truth */}
                  <td className={`py-3.5 px-3.5 whitespace-nowrap border-l ${
                    fdr.bank_verified_status === 'MISMATCH_FLAGGED' || fdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED'
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

                  {/* Lifecycle Status */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap border-l border-slate-200">
                    {getStatusBadge(fdr.lifecycle_status)}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
