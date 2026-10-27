import React from 'react';
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
  Cloud,
  FileCheck2
} from 'lucide-react';
import type { FDRInstrument, DigitalVaultItem } from '../types';

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
  if (!isOpen || !fdr) return null;

  // Synthesize or extract vault documents
  let vaultDocs: DigitalVaultItem[] = [];

  if (fdr.digitalVault && fdr.digitalVault.length > 0) {
    vaultDocs = [...fdr.digitalVault];
  } else if (fdr.documentUrl || (fdr as any).document_url || fdr.document_path) {
    const primaryUrl = fdr.documentUrl || (fdr as any).document_url || fdr.document_path!;
    vaultDocs = [
      {
        documentType: 'Initial FDR Scan',
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
      case 'Initial FDR Scan':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          icon: <FileText className="w-4 h-4 text-blue-700" />,
          label: 'Initial FDR Scan',
          desc: 'Original physical FDR receipt certificate uploaded during statutory filing'
        };
      case 'Bank Attestation PDF':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          icon: <Landmark className="w-4 h-4 text-emerald-700" />,
          label: 'Bank Attestation PDF',
          desc: 'Authoritative Core Banking System (CBS) confirmation stamped by Depository Branch Manager'
        };
      case 'Discharge NOC':
        return {
          bg: 'bg-amber-50 text-amber-950 border-amber-300',
          icon: <Crown className="w-4 h-4 text-amber-700" />,
          label: 'Discharge NOC',
          desc: 'AICTE Member Secretary digital signature DSC clearance order with bank-verifiable QR code'
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden transform transition-all animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#0F2547] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Vault"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deposit Context Strip */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Institution</span>
            <span className="font-semibold text-slate-900 truncate block" title={fdr.institution?.name}>
              {fdr.institution?.name || 'Apex Institute'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Depository Bank</span>
            <span className="font-semibold text-slate-900 block truncate">
              {fdr.inst_bank_name}
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
              {vaultDocs.length} {vaultDocs.length === 1 ? 'Document' : 'Documents'}
            </span>
          </div>
        </div>

        {/* Auditor Audit-Trail Callout Banner */}
        <div className="px-6 pt-4 pb-2">
          <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 block">
                Auditor-Grade Chronological Paperwork Trail (AICTE PS Requirement 2)
              </span>
              <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                All supporting physical scans, CBS bank attestations, and statutory discharge orders are immutably archived with verified timestamps and stored in the secure Cloudinary depository.
              </p>
            </div>
          </div>
        </div>

        {/* Vertical Document List */}
        <div className="px-6 py-3 max-h-[420px] overflow-y-auto space-y-3">
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
              return (
                <div
                  key={`${doc.documentType}-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition p-4 space-y-2.5"
                >
                  {/* Top Row: Type Badge + View Document Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-md bg-slate-100 border border-slate-200">
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

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
                      title="Open full document in a new tab"
                    >
                      <span>View Document</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Bottom Row: Chronological Metadata & Auditor Review Details */}
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
                      <Cloud className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Cloud Depository</span>
                        <span className="font-mono text-[10px] text-slate-500 truncate block" title={doc.fileUrl}>
                          {doc.fileUrl.replace(/^https?:\/\//, '')}
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
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">
              AICTE Regulation Bureau • Tri-Party Deposit Repository
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
