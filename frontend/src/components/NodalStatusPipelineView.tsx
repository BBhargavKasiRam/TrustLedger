import React, { useState } from 'react';
import { 
  FileCheck2, 
  Clock, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck, 
  FileSpreadsheet,
  BadgeAlert,
  Lock
} from 'lucide-react';
import type { FDRInstrument, Institution } from '../types';
import { DigitalVaultModal } from './DigitalVaultModal';

interface NodalStatusPipelineViewProps {
  fdrs: FDRInstrument[];
  institution?: Institution | null;
  loading?: boolean;
  onRefresh?: () => void;
  onNavigateToSubmit?: () => void;
  onNavigateToRelease?: () => void;
  onNavigateToRenewal?: () => void;
}

export const NodalStatusPipelineView: React.FC<NodalStatusPipelineViewProps> = ({
  fdrs,
  institution,
  loading,
  onNavigateToSubmit,
  onNavigateToRelease,
  onNavigateToRenewal
}) => {
  const [selectedVaultFdr, setSelectedVaultFdr] = useState<FDRInstrument | null>(null);

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Derive step progress from FDR statuses
  const getPipelineSteps = (fdr: FDRInstrument) => {
    const isMatured = fdr.lifecycle_status === 'MATURED_ACTION_PENDING' || fdr.lifecycle_status === 'RELEASE_APPROVED_NOC_ISSUED';
    const isBankConfirmed = fdr.bank_verified_status === 'VERIFIED_API' || fdr.bank_verified_status === 'VERIFIED_MAGIC_LINK';
    const isBankFlagged = fdr.bank_verified_status === 'MISMATCH_FLAGGED' || fdr.bank_lien_status === 'LOAN_TAKEN_ENCUMBERED';
    const isDiscrepancy = fdr.math_tamper_flag || isBankFlagged || fdr.lifecycle_status === 'DISCREPANCY_FLAGGED';
    const isAicteApproved = isBankConfirmed && !isDiscrepancy;
    const isReleaseApproved = fdr.lifecycle_status === 'RELEASE_APPROVED_NOC_ISSUED';
    const isSuperseded = fdr.lifecycle_status === 'RENEWED_SUPERSEDED';

    return [
      {
        id: 1,
        title: '1. Submitted',
        subtitle: 'Receipt & Joint Pledge',
        status: 'COMPLETED' as const,
        details: `Submitted on ${fdr.inst_issue_date || 'Registration Date'}`
      },
      {
        id: 2,
        title: '2. Bank Attestation',
        subtitle: 'Core Banking (CBS)',
        status: isBankConfirmed 
          ? ('COMPLETED' as const) 
          : isBankFlagged 
          ? ('WARNING' as const) 
          : ('IN_PROGRESS' as const),
        details: isBankConfirmed 
          ? `Confirmed by ${fdr.inst_bank_name || 'Issuing Bank'}` 
          : isBankFlagged 
          ? 'Bank Reported Discrepancy / Encumbrance' 
          : 'Pending Branch Manager CBS Attestation'
      },
      {
        id: 3,
        title: '3. AICTE Scrutiny',
        subtitle: 'Regional Bureau Norms',
        status: isDiscrepancy
          ? ('WARNING' as const)
          : isAicteApproved
          ? ('COMPLETED' as const)
          : ('IN_PROGRESS' as const),
        details: isDiscrepancy
          ? 'Requires Bureau Scrutiny Resolution'
          : isAicteApproved
          ? 'APH Norms & Clause Verified ✓'
          : 'Under Regulation Bureau Scrutiny'
      },
      {
        id: 4,
        title: isReleaseApproved ? '4. Discharged' : isSuperseded ? '4. Superseded' : '4. Active',
        subtitle: isReleaseApproved ? 'NOC Issued' : isSuperseded ? 'Renewed in DAG' : 'Joint AICTE Lien',
        status: (isAicteApproved || isReleaseApproved || isSuperseded) ? ('COMPLETED' as const) : ('PENDING' as const),
        details: isReleaseApproved
          ? 'Lien Discharged via AICTE NOC'
          : isSuperseded
          ? 'Superseded by Renewal Deposit'
          : isMatured
          ? 'Matured — Action Pending'
          : isAicteApproved
          ? 'Active Regulatory Security Deposit'
          : 'Awaiting Final Activation'
      }
    ];
  };

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

  const getStatusBadge = (status: string, daysRemaining?: number | null) => {
    switch (status) {
      case 'RELEASE_APPROVED_NOC_ISSUED':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>NOC ISSUED &amp; DISCHARGED</span>
          </span>
        );
      case 'EXPIRED_ACTION_REQUIRED':
      case 'MATURED_ACTION_PENDING':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-900 border border-red-400 font-bold px-2.5 py-1 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-red-700" />
            <span>EXPIRED • ACTION REQUIRED {daysRemaining != null && daysRemaining <= 0 ? `(${Math.abs(daysRemaining)}d OVERDUE)` : ''}</span>
          </span>
        );
      case 'MATURITY_T30':
      case 'APPROACHING_MATURITY_T30':
        return (
          <span className="inline-flex items-center space-x-1 bg-orange-50 text-orange-900 border border-orange-300 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-orange-700" />
            <span>RENEWAL DUE (T-30 NOTICE) {daysRemaining != null ? `• ${daysRemaining}d` : ''}</span>
          </span>
        );
      case 'MATURITY_T60':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>T-60 ADVISORY {daysRemaining != null ? `• ${daysRemaining}d REMAINING` : ''}</span>
          </span>
        );
      case 'MATURITY_T90':
      case 'APPROACHING_MATURITY_T90':
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 border border-blue-300 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            <span>T-90 WATCHDOG {daysRemaining != null ? `• ${daysRemaining}d REMAINING` : ''}</span>
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-800 border border-red-300 font-bold px-2.5 py-1 rounded text-xs shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>REGULATORY REVIEW PENDING</span>
          </span>
        );
      case 'RENEWED_SUPERSEDED':
        return (
          <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2.5 py-1 rounded text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>SUPERSEDED BY RENEWAL</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 border border-blue-200 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>ACTIVE STATUTORY DEPOSIT {daysRemaining != null && daysRemaining < 9999 ? `(${daysRemaining}d)` : ''}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Top Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200 font-mono">
                PID: {institution?.pid || '1-100200301'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {institution?.programme_tier || 'Technical Degree Institution'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              My Submitted Fixed Deposit Receipts
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Live status tracking across bank attestation, AICTE regulatory scrutiny, and deposit validity.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onNavigateToSubmit}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>+ Submit New FDR</span>
            </button>
          </div>
        </div>

        {/* Institution Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Total Submitted Instruments</span>
            <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">{fdrs.length}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-md border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Total Deposited Principal</span>
            <span className="text-lg font-bold text-[#1E3A8A] font-mono mt-0.5 block">
              {formatCurrency(fdrs.reduce((acc, curr) => acc + (curr.inst_principal_amount || 0), 0))}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-md border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Sanctioned APH Norm</span>
            <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">
              {formatCurrency(institution?.required_fdr_norm || 3500000)}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-md border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Statutory Lock-in Mandate</span>
            <span className="text-lg font-bold text-emerald-800 font-mono mt-0.5 block">
              8–10 Years Joint
            </span>
          </div>
        </div>
      </div>

      {/* Zero FDRs Empty State */}
      {fdrs.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="p-3 bg-blue-50 text-[#1E3A8A] rounded-full w-12 h-12 mx-auto flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Fixed Deposit Receipts Registered</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your institution has not uploaded any security deposit receipt yet. Click below to submit your bank FDR certificate for verification.
          </p>
          <button
            onClick={onNavigateToSubmit}
            className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
          >
            Submit Initial Security Deposit (FDR)
          </button>
        </div>
      )}

      {/* Submitted FDRs List with High-Level Visual Status Pipeline */}
      <div className="space-y-4">
        {fdrs.map((fdr) => {
          const steps = getPipelineSteps(fdr);
          const isLapsed = fdr.lifecycle_status === 'MATURED_ACTION_PENDING';
          const isApproaching = fdr.lifecycle_status === 'APPROACHING_MATURITY_T30';
          const isDiscrepant = fdr.math_tamper_flag || fdr.bank_verified_status === 'MISMATCH_FLAGGED' || fdr.lifecycle_status === 'DISCREPANCY_FLAGGED';

          return (
            <div 
              key={fdr.id} 
              className={`bg-white rounded-lg border shadow-xs transition-all overflow-hidden ${
                isDiscrepant
                  ? 'border-red-200 ring-1 ring-red-100'
                  : isLapsed
                  ? 'border-amber-300 ring-1 ring-amber-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Instrument Header */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-md bg-white border border-slate-200 text-[#1E3A8A] shadow-2xs mt-0.5">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-sm text-[#1E3A8A]">
                        {fdr.fdr_uid}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-700 font-semibold">
                        Receipt Ref: <span className="font-mono text-slate-900">{fdr.inst_fdr_number || 'FDR-REC-AICTE'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedVaultFdr(fdr)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 text-[10px] font-semibold transition cursor-pointer ml-2 shadow-2xs"
                        title="Open multi-file Digital Vault"
                      >
                        <Lock className="w-3 h-3 text-[#1E3A8A]" />
                        <span>Open Digital Vault</span>
                        {fdr.digitalVault && fdr.digitalVault.length > 0 && (
                          <span className="text-[9px] font-mono font-bold bg-[#1E3A8A] text-white px-1 py-0.1 rounded-full">
                            {fdr.digitalVault.length}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span><strong>Bank:</strong> {fdr.inst_bank_name}</span>
                      <span><strong>IFSC:</strong> <span className="font-mono">{fdr.inst_ifsc}</span></span>
                      <span><strong>Issue Date:</strong> {fdr.inst_issue_date || '—'}</span>
                      <span><strong>Maturity Date:</strong> <span className="font-semibold text-slate-900">{fdr.inst_maturity_date || '—'}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <span className="text-xs text-slate-500 font-medium">Principal Amount</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {formatCurrency(fdr.inst_principal_amount)}
                  </span>
                  <div>
                    {getStatusBadge(
                      fdr.lifecycleState || fdr.lifecycle_status,
                      fdr.daysRemaining !== undefined && fdr.daysRemaining !== null
                        ? fdr.daysRemaining
                        : calculateDaysRemainingUtc(fdr.bankAttestedMaturityDate || fdr.bank_confirmed_maturity_date || fdr.inst_maturity_date)
                    )}
                  </div>
                </div>
              </div>

              {/* High-Level Visual Status Pipeline (Submitted -> Bank Attestation -> AICTE Scrutiny -> Active) */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Regulatory Verification Pipeline</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Live Multi-Tier Verification Workflow
                  </span>
                </div>

                {/* 4-Step Stepper */}
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                    {steps.map((step) => {
                      const isComplete = step.status === 'COMPLETED';
                      const isWarning = step.status === 'WARNING';
                      const isInProgress = step.status === 'IN_PROGRESS';

                      return (
                        <div key={step.id} className="flex md:flex-col items-start md:items-center space-x-3 md:space-x-0 md:text-center">
                          {/* Step Circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-xs shadow-2xs transition-all ${
                            isComplete 
                              ? 'bg-emerald-600 text-white border-emerald-600' 
                              : isWarning 
                              ? 'bg-red-600 text-white border-red-600 animate-pulse' 
                              : isInProgress 
                              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] animate-pulse ring-4 ring-blue-100' 
                              : 'bg-white text-slate-400 border-slate-300'
                          }`}>
                            {isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : isWarning ? (
                              <AlertTriangle className="w-4 h-4 text-white" />
                            ) : isInProgress ? (
                              <Clock className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <span>{step.id}</span>
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="mt-1 md:mt-2.5">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {step.title}
                            </h4>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {step.subtitle}
                            </span>
                            <span className={`text-[10px] font-medium block mt-1 px-1.5 py-0.5 rounded ${
                              isComplete 
                                ? 'bg-emerald-50 text-emerald-800' 
                                : isWarning 
                                ? 'bg-red-50 text-red-800 font-bold' 
                                : isInProgress 
                                ? 'bg-blue-50 text-blue-900 font-semibold' 
                                : 'text-slate-400'
                            }`}>
                              {step.details}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Alert Notices for Nodal Officer */}
                {isLapsed && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-900 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Statutory Notice: Fixed Deposit Has Matured</strong>
                        <p className="text-[11px] text-red-800 mt-0.5">
                          This deposit matured on {fdr.inst_maturity_date}. Per APH norms, please initiate statutory 5-year renewal or apply for official release to maintain Extension of Approval (EoA) compliance.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {onNavigateToRenewal && (
                        <button
                          onClick={onNavigateToRenewal}
                          className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          Renew Deposit
                        </button>
                      )}
                      {onNavigateToRelease && (
                        <button
                          onClick={onNavigateToRelease}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-red-900 border border-red-300 rounded text-xs font-semibold cursor-pointer"
                        >
                          Request Release
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isApproaching && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Maturity Reminder: T-30 Expiry Notification</strong>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Deposit expires within 30 days. Automated SMS &amp; WhatsApp alerts have been dispatched. Ensure renewal submission prior to maturity date.
                        </p>
                      </div>
                    </div>
                    {onNavigateToRenewal && (
                      <button
                        onClick={onNavigateToRenewal}
                        className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Prepare Renewal
                      </button>
                    )}
                  </div>
                )}

                {isDiscrepant && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-900 flex items-start space-x-2">
                    <BadgeAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Compliance Advisory: Regulatory Review Underway</strong>
                      <p className="text-[11px] text-red-800 mt-0.5">
                        A discrepancy or encumbrance notification has been noted by the Regulation Bureau. The AICTE Scrutiny Officer is reviewing records with the issuing bank. Please monitor this desk for official directives.
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      AICTE Joint Pledge: {fdr.inst_joint_holder_text ? 'Recorded ✓' : 'Standard Norm'}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      No-Lien Declared: {fdr.inst_no_lien_declared ? 'Yes ✓' : 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onNavigateToRelease && (
                      <button
                        onClick={onNavigateToRelease}
                        className="inline-flex items-center space-x-1 text-[#1E3A8A] hover:text-[#172554] font-semibold cursor-pointer hover:underline"
                      >
                        <span>Apply for Release (NOC)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          );
        })}
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
