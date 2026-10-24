import React from 'react';
import { 
  Building2, 
  FileCheck2, 
  Crown, 
  Landmark, 
  ArrowRight
} from 'lucide-react';
import type { UserRole, Institution } from '../types';

interface RolePerspectiveBannerProps {
  role: UserRole;
  selectedInstitution?: Institution;
  onActionClick?: (action: string) => void;
}

export const RolePerspectiveBanner: React.FC<RolePerspectiveBannerProps> = ({
  role,
  selectedInstitution,
  onActionClick
}) => {
  const getBannerDetails = () => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return {
          title: 'Perspective: Institution Nodal Officer',
          subtitle: selectedInstitution 
            ? `Active College: ${selectedInstitution.name} (PID: ${selectedInstitution.pid})`
            : 'Select an institution from the top bar to inspect its FDR filings',
          borderLeft: 'border-l-sky-600',
          icon: <Building2 className="w-5 h-5 text-sky-700" />,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
          actions: [
            'Upload New FDR Deposit Certificate',
            'Submit Renewal or Bank Merger Request',
            'Track Statutory Release, Discharge, or Refund Status'
          ]
        };
      case 'AICTE_SCRUTINY_OFFICER':
        return {
          title: 'Perspective: AICTE Scrutiny & Regulation Bureau Officer',
          subtitle: 'Active Regional Workbench: North / West / South AICTE Regional Bureaus',
          borderLeft: 'border-l-emerald-600',
          icon: <FileCheck2 className="w-5 h-5 text-emerald-700" />,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          actions: [
            'Examine Document Text & Authenticity Analysis',
            'Evaluate Compound Interest Calculation & Verification',
            'Gate 3 Scrutiny Officer Verification & Recommendation'
          ]
        };
      case 'COMPETENT_AUTHORITY':
        return {
          title: 'Perspective: Competent Authority (AICTE Member Secretary / Chairman)',
          subtitle: 'High-Level Regulatory Oversight & Statutory NOC Issuance Gateway',
          borderLeft: 'border-l-amber-600',
          icon: <Crown className="w-5 h-5 text-amber-700" />,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          actions: [
            'Nationwide Security Deposit Liquidity Analytics (₹1.35 Cr Seeded)',
            'Gate 4 Final NOC Authorization with Digital Certificate',
            'Enforce Defaulter Penalties on Non-Compliant Colleges'
          ]
        };
      case 'BANK_BRANCH_MANAGER':
        return {
          title: 'Perspective: Bank Branch Manager Attestation Portal',
          subtitle: 'Secure API & One-Click Verification Gateway for Branch Managers',
          borderLeft: 'border-l-purple-600',
          icon: <Landmark className="w-5 h-5 text-purple-700" />,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          actions: [
            'Direct Attestation of Principal & Maturity Date',
            'Lien Encumbrance Declaration (ACTIVE_JOINT_AICTE vs LOAN_TAKEN)',
            'Digital Signature & Regulatory Audit Ledger Entry'
          ]
        };
    }
  };

  const details = getBannerDetails();

  return (
    <div className={`bg-white rounded border border-gray-300 border-l-4 ${details.borderLeft} p-4 shadow-sm transition-all`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Role Info */}
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded bg-gray-100 border border-gray-200 mt-0.5">
            {details.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">{details.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${details.badgeColor}`}>
                ACTIVE PERSPECTIVE
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">{details.subtitle}</p>
          </div>
        </div>

        {/* Right: Key Role Actions Ready */}
        <div className="flex flex-wrap items-center gap-2">
          {details.actions.map((act, i) => (
            <button
              key={i}
              onClick={() => onActionClick && onActionClick(act)}
              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold bg-gray-50 hover:bg-gray-100 text-gray-800 hover:text-blue-900 border border-gray-300 hover:border-blue-400 px-2.5 py-1 rounded shadow-2xs transition cursor-pointer"
            >
              <ArrowRight className="w-3 h-3 text-orange-600" />
              <span>{act}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
