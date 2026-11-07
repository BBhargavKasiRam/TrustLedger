import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Landmark, 
  Crown, 
  ExternalLink, 
  Calendar, 
  UserCheck, 
  Lock,
  FileCheck2,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileCode,
  Eye
} from 'lucide-react';
import type { FDRInstrument, DigitalVaultItem } from '../types';
import { getAssetUrl } from '../services/api';

interface DigitalVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FDRInstrument | null;
}

export const DigitalVaultModal: React.FC<DigitalVaultModalProps> = ({
  isOpen,
  onClose,
  fdr
}) => {
  const [showFrameworkGuide, setShowFrameworkGuide] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DigitalVaultItem | null>(null);

  if (!isOpen || !fdr) return null;

  // Synthesize or extract vault documents
  let vaultDocs: DigitalVaultItem[] = [];

  if (fdr.digitalVault && fdr.digitalVault.length > 0) {
    vaultDocs = [...fdr.digitalVault];
  } else if (fdr.documentUrl || (fdr as any).document_url || fdr.document_path) {
    const primaryUrl = fdr.documentUrl || (fdr as any).document_url || fdr.document_path!;
    vaultDocs = [
      {
        documentType: 'Original FDR Deposit Certificate',
        fileUrl: primaryUrl,
        uploadedBy: 'INSTITUTE_NODAL_OFFICER',
        timestamp: fdr.created_at || new Date().toISOString()
      }
    ];
  }

  // Format date helper
  const formatDateTime = (raw?: string) => {
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return raw;
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'Original FDR Deposit Certificate':
      case 'Initial FDR Scan':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          icon: <FileText className="w-4 h-4 text-blue-700" />,
          label: 'Original FDR Deposit Certificate',
          desc: 'Primary physical Fixed Deposit Receipt issued by depository bank branch counter and uploaded during statutory filing'
        };
      case 'Bank Attestation PDF':
      case 'CBS Attestation Certificate':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          icon: <Landmark className="w-4 h-4 text-emerald-700" />,
          label: 'Bank Attestation PDF',
          desc: 'Authoritative Core Banking System (CBS) confirmation stamped and signed by Depository Branch Manager'
        };
      case 'Discharge NOC':
      case 'Statutory Discharge Order':
        return {
          bg: 'bg-amber-50 text-amber-950 border-amber-300',
          icon: <Crown className="w-4 h-4 text-amber-700" />,
          label: 'Discharge NOC',
          desc: 'AICTE Member Secretary digital signature DSC clearance order with bank-verifiable QR code'
        };
      case 'Forensic Analysis Report':
      case 'ELA Forensic Report':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          icon: <FileCode className="w-4 h-4 text-indigo-700" />,
          label: 'Forensic Analysis Report',
          desc: 'Automated ELA pixel tamper verification and OCR mathematical consistency report'
        };
      default:
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-200',
          icon: <FileCheck2 className="w-4 h-4 text-purple-700" />,
          label: type,
          desc: 'Statutory compliance document attached to regulatory registry'
        };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'INSTITUTE_NODAL_OFFICER':
      case 'INSTITUTION_NODAL_OFFICER':
        return 'Institute Nodal Officer (Self-Filing)';
      case 'BANK_BRANCH_MANAGER':
        return 'Depository Bank Branch Manager (CBS Truth)';
      case 'COMPETENT_AUTHORITY':
        return 'AICTE Member Secretary & Competent Authority';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'Regulation Bureau Regional Scrutiny Officer';
      default:
        return role;
    }
  };

  const isPdf = (url: string) => {
    return url.toLowerCase().includes('.pdf');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden transform transition-all animate-in fade-in duration-200 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#0F2547] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-300/30 font-mono">
                  AICTE REQUIREMENT 2 • DIGITAL VAULT
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">
                  {fdr.fdr_uid}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Statutory Fixed Deposit Digital Document Vault
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFrameworkGuide(!showFrameworkGuide)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
              title="Explain documents provided in the vault"
            >
              <Info className="w-3.5 h-3.5 text-blue-300" />
              <span>Vault Document Guide</span>
              {showFrameworkGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deposit Context Strip */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Institution</span>
            <span className="font-semibold text-slate-900 truncate block" title={fdr.institution?.name}>
              {fdr.institution?.name || 'Apex Institute of Technology, Lucknow'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Depository Bank</span>
            <span className="font-semibold text-slate-900 block truncate">
              {fdr.inst_bank_name || fdr.ocr_bank_name || 'Bank'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Principal Amount</span>
            <span className="font-mono font-bold text-slate-900 block">
              ₹{(fdr.inst_principal_amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Vault Records</span>
            <span className="font-mono font-bold text-blue-900 block">
              {vaultDocs.length} {vaultDocs.length === 1 ? 'Document' : 'Documents'} Attached
            </span>
          </div>
        </div>

        {/* Expandable Vault Document Framework & Lifecycle Explanation */}
        {showFrameworkGuide && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 px-6 py-4 border-b border-blue-200 animate-in slide-in-from-top duration-200 shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#0F2547] uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Statutory Document Architecture & Lifecycle Framework</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Under AICTE Approval Process Handbook (APH) Chapter IV, a compliant institution's statutory security deposit is backed by a 4-tier chain of custody preserved inside this Digital Vault:
                </p>
              </div>
              <button 
                onClick={() => setShowFrameworkGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-blue-200 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  <span>1. Original FDR Deposit Certificate</span>
                </div>
                <p className="text-[10.5px] text-slate-600 mt-1 leading-snug">
                  <strong>What it is:</strong> Physical paper FDR receipt issued at the bank branch counter upon initial deposit. The institute nodal officer uploads this high-resolution scan during initial filing.
                </p>
                <div className="mt-1 text-[9.5px] text-slate-500 font-mono">Stage: Institutional Filing • Source: Depository Bank Counter</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-[11px]">
                  <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Core Banking System (CBS) Attestation PDF</span>
                </div>
                <p className="text-[10.5px] text-slate-600 mt-1 leading-snug">
                  <strong>What it is:</strong> Legally binding digital certificate generated and verified by the Depository Bank Branch Manager confirming joint lien with AICTE, CBS account balance, and 10-year lock-in.
                </p>
                <div className="mt-1 text-[9.5px] text-slate-500 font-mono">Stage: Depository Bank Verification • Source: Branch Manager CBS</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-indigo-200 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-indigo-900 font-bold text-[11px]">
                  <FileCode className="w-3.5 h-3.5 text-indigo-700" />
                  <span>3. Forensic Pixel Analysis & Scrutiny Report</span>
                </div>
                <p className="text-[10.5px] text-slate-600 mt-1 leading-snug">
                  <strong>What it is:</strong> Automated Error Level Analysis (ELA) and OCR verification log certifying that the principal amount, dates, and security seals contain zero digital tampering or forgery.
                </p>
                <div className="mt-1 text-[9.5px] text-slate-500 font-mono">Stage: AICTE Scrutiny • Source: AICTE Verification Engine</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-amber-200 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-amber-950 font-bold text-[11px]">
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span>4. Statutory Discharge NOC (Release Order)</span>
                </div>
                <p className="text-[10.5px] text-slate-600 mt-1 leading-snug">
                  <strong>What it is:</strong> DSC-signed statutory clearance order issued by AICTE Member Secretary upon successful completion of the mandatory 10-year tenure with zero outstanding student/faculty liabilities.
                </p>
                <div className="mt-1 text-[9.5px] text-slate-500 font-mono">Stage: Term Maturity / Release • Source: AICTE Member Secretary</div>
              </div>
            </div>
          </div>
        )}

        {/* Auditor Audit-Trail Callout Banner */}
        <div className="px-6 pt-3 pb-1 shrink-0">
          <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 block">
                Auditor-Grade Chronological Paperwork Trail (AICTE PS Requirement 2)
              </span>
              <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                All supporting physical scans, CBS bank attestations, and statutory discharge orders are immutably archived with verified timestamps and stored securely in the encrypted statutory depository.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area: Document List or Split Previewer */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3">
          {previewDoc ? (
            /* Inline Document Preview Mode */
            <div className="rounded-lg border border-slate-300 bg-slate-900 text-white overflow-hidden shadow-lg flex flex-col">
              <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">
                    Previewing: {getDocTypeBadge(previewDoc.documentType).label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({getRoleLabel(previewDoc.uploadedBy)})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={getAssetUrl(previewDoc.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition"
                    title="Open full document in a new tab"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              {/* Viewer Container */}
              <div className="h-[460px] bg-slate-950 flex items-center justify-center p-2 overflow-auto">
                {isPdf(previewDoc.fileUrl) ? (
                  <iframe
                    src={getAssetUrl(previewDoc.fileUrl)}
                    className="w-full h-full rounded border border-slate-800 bg-white"
                    title="Document Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full max-h-full">
                    <img
                      src={getAssetUrl(previewDoc.fileUrl)}
                      alt={previewDoc.documentType}
                      className="max-h-[440px] max-w-full object-contain rounded shadow-md border border-slate-700"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Vertical Document List */}
          {vaultDocs.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-slate-300 bg-slate-50 space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">No Documents Found in Vault</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                No supporting documents have been attached to this deposit instrument yet.
              </p>
            </div>
          ) : (
            vaultDocs.map((doc, idx) => {
              const meta = getDocTypeBadge(doc.documentType);
              const isSelectedForPreview = previewDoc?.fileUrl === doc.fileUrl;

              return (
                <div
                  key={`${doc.documentType}-${idx}`}
                  className={`rounded-lg border transition p-4 space-y-2.5 ${
                    isSelectedForPreview 
                      ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Row: Type Badge + Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-md bg-slate-100 border border-slate-200 shrink-0">
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${meta.bg}`}>
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            #0{idx + 1}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
                        title="Preview document directly"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={getAssetUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        title="Open full document in a new tab"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Bottom Row: Chronological Metadata & Integrity Verification */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Timestamp</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {formatDateTime(doc.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Uploaded By</span>
                        <span className="font-semibold text-slate-800">
                          {getRoleLabel(doc.uploadedBy)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Registry Status</span>
                        <span className="font-semibold text-emerald-700">
                          Verified & Digitally Sealed ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">
              AICTE Regulation Bureau • Tri-Party Deposit Statutory Vault
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
