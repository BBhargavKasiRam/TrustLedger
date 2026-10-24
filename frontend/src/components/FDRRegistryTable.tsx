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
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>MATURED: ACTION PENDING</span>
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3 h-3 text-red-700" />
            <span>DISCREPANCY FLAGGED</span>
          </span>
        );
      case 'APPROACHING_MATURITY_T30':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
            <Clock className="w-3 h-3 text-orange-700" />
            <span>CRITICAL EXPIRY: T-30</span>
          </span>
        );
      case 'APPROACHING_MATURITY_T90':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
            <Clock className="w-3 h-3 text-yellow-700" />
            <span>APPROACHING: T-90</span>
          </span>
        );
      case 'RENEWED_SUPERSEDED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <GitBranch className="w-3 h-3 text-gray-600" />
            <span>SUPERSEDED BY DAG</span>
          </span>
        );
      case 'RELEASE_APPROVED_NOC_ISSUED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            <span>NOC ISSUED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle2 className="w-3 h-3 text-green-700" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded border border-gray-300 shadow-sm p-6">
      
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-200 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-900">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Centralized Security Deposit/FDR Repository
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  Instrument-wise Records
                </span>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Centralized statutory registry across all approved technical institutions. Distinguishes between institution-submitted information and bank-confirmed information.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>Total Seeded Instruments:</span>
          <span className="font-mono font-bold text-[#1a365d] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            {fdrs.length} FDRs
          </span>
        </div>
      </div>

      {/* FDR Table */}
      <div className="mt-5 overflow-x-auto rounded border border-gray-300">
        <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
          <thead className="text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5 border-b border-gray-300 bg-gray-100 text-gray-700">FDR UID / Lineage</th>
              <th className="py-3 px-3.5 border-b border-gray-300 bg-gray-100 text-gray-700">Institution</th>
              
              {/* Distinct 3-Way Diff Headers (X-Factor #1) */}
              <th className="py-3 px-3.5 border-b-2 border-slate-400 bg-slate-100 text-slate-800 border-l border-slate-300">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-700" />
                  <span className="font-bold">Column A: College Claimed</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded mt-1 inline-block">
                  DEPOSIT FILING
                </span>
              </th>

              <th className="py-3 px-3.5 border-b-2 border-sky-500 bg-sky-100 text-sky-950 border-l border-sky-200">
                <div className="flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-800" />
                  <span className="font-bold">Column B: AI & Forensics</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-sky-200 text-sky-900 px-1.5 py-0.2 rounded mt-1 inline-block">
                  AI OCR & MATH TRUTH
                </span>
              </th>

              <th className="py-3 px-3.5 border-b-2 border-emerald-600 bg-emerald-100 text-emerald-950 border-l border-emerald-200">
                <div className="flex items-center space-x-1.5">
                  <Landmark className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="font-bold">Column C: Bank Truth</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded mt-1 inline-block">
                  CORE BANKING (CBS)
                </span>
              </th>

              <th className="py-3 px-3.5 border-b border-gray-300 bg-gray-100 text-gray-700 border-l border-gray-300">Lifecycle Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {fdrs.map((fdr) => {
              const hasDiscrepancy = fdr.math_tamper_flag || fdr.bank_verified_status === 'MISMATCH_FLAGGED';
              const hasLineageParent = !!fdr.parent_fdr_id;

              return (
                <tr key={fdr.id} className={`hover:bg-gray-50 transition ${hasDiscrepancy ? 'bg-red-50/40' : ''}`}>
                  
                  {/* UID & Lineage */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                    <div className="font-mono font-bold text-blue-900 text-sm">{fdr.fdr_uid}</div>
                    <div className="flex items-center space-x-1.5 mt-1">
                      {hasLineageParent ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-medium">
                          <GitBranch className="w-3 h-3" />
                          <span>Status: Re-issued (Bank Merger)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono">
                          Initial Deposit
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Institution */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      {fdr.institution?.name || `Institution #${fdr.institution_id}`}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      PID: {fdr.institution?.pid} • {fdr.institution?.programme_tier}
                    </div>
                  </td>

                  {/* Column Set A: College Declared */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap bg-slate-50/50 border-l border-slate-200">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(fdr.inst_principal_amount)}
                    </div>
                    <div className="text-[10px] text-gray-600 flex items-center space-x-1 mt-0.5">
                      <Landmark className="w-3 h-3 text-gray-400" />
                      <span>{fdr.inst_bank_name} ({fdr.inst_ifsc})</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Matures: {fdr.inst_maturity_date || '—'}
                    </div>
                  </td>

                  {/* Column Set B: OCR & Forensics */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap bg-sky-50/40 border-l border-sky-200">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(fdr.ocr_principal_amount)}
                      </span>
                      {fdr.math_tamper_flag ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Math Tamper Flag!</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-green-700 font-semibold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                          Math Verified ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      ELA Score: <strong className={fdr.ela_tamper_score && fdr.ela_tamper_score > 0.5 ? 'text-red-600 font-bold' : 'text-gray-800'}>{fdr.ela_tamper_score ?? '0.00'}</strong>
                      {fdr.ocr_joint_clause_found && ' • Joint Clause ✓'}
                    </div>
                    {fdr.math_expected_maturity && (
                      <div className="text-[10px] text-gray-500 font-mono">
                        Calculated Yield: {formatCurrency(fdr.math_expected_maturity)}
                      </div>
                    )}
                  </td>

                  {/* Column Set C: Bank Confirmed */}
                  <td className={`py-3.5 px-3.5 whitespace-nowrap border-l ${
                    fdr.bank_verified_status === 'MISMATCH_FLAGGED' || fdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED'
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-emerald-50/30 border-emerald-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${fdr.bank_confirmed_principal !== fdr.inst_principal_amount ? 'text-red-700' : 'text-green-800'}`}>
                        {formatCurrency(fdr.bank_confirmed_principal)}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                        fdr.bank_verified_status === 'VERIFIED_API' || fdr.bank_verified_status === 'VERIFIED_MAGIC_LINK'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {fdr.bank_verified_status}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5 font-medium">
                      {fdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED' ? (
                        <span className="text-red-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          LOAN TAKEN ENCUMBERED (Unauthorized!)
                        </span>
                      ) : (
                        <span className="text-green-700 font-medium">
                          Joint AICTE Lien Active ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Attested by: {fdr.bank_manager_email || '—'}
                    </div>
                  </td>

                  {/* Lifecycle Status */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap border-l border-gray-200">
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
