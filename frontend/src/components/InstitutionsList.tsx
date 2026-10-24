import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  DollarSign, 
  MapPin, 
  GraduationCap 
} from 'lucide-react';
import type { Institution } from '../types';

interface InstitutionsListProps {
  institutions: Institution[];
  selectedInstitutionId: number | null;
  onSelectInstitution: (id: number) => void;
}

export const InstitutionsList: React.FC<InstitutionsListProps> = ({
  institutions,
  selectedInstitutionId,
  onSelectInstitution
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded border border-gray-300 shadow-sm p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-200 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-900">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Registered AICTE Institutions & Compliance Profiles
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                Pillar 4 ERP Check
              </span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Live AICTE Permanent ID (PID) binding with automated regulatory penalty & court clearance flags
            </p>
          </div>
        </div>

        <span className="text-xs text-gray-600 font-mono font-bold">
          {institutions.length} Institutions Enrolled
        </span>
      </div>

      {/* Grid of Institution Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {institutions.map((inst) => {
          const isSelected = selectedInstitutionId === inst.id;
          const hasFlags = inst.pending_court_cases || inst.unpaid_salary_complaints || inst.pending_pgrc_penalties > 0 || inst.evc_deficiencies;

          return (
            <div
              key={inst.id}
              onClick={() => onSelectInstitution(inst.id)}
              className={`relative rounded border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#1a365d] bg-blue-50/50 shadow-sm ring-1 ring-[#1a365d]'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {/* Institution PID & Region */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#1a365d] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {inst.pid}
                </span>
                <span className="text-[10px] text-gray-600 font-semibold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {inst.region} Region
                </span>
              </div>

              {/* Name */}
              <h3 className="mt-2 text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                {inst.name}
              </h3>

              {/* State & Tier */}
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{inst.state}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-800 font-medium">{inst.programme_tier}</span>
                </div>
              </div>

              {/* Required Norm */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-[11px] text-gray-600 font-medium">Statutory FDR Norm:</span>
                <span className="text-xs font-bold text-gray-900 font-mono">
                  {formatCurrency(inst.required_fdr_norm)}
                </span>
              </div>

              {/* Regulatory & Compliance Badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {!hasFlags ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded border border-green-300">
                    <ShieldCheck className="w-3 h-3 text-green-700" />
                    <span>Clean ERP Record</span>
                  </span>
                ) : (
                  <>
                    {inst.pending_court_cases && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                        <Scale className="w-3 h-3 text-red-600" />
                        <span>Court Case Active</span>
                      </span>
                    )}
                    {inst.unpaid_salary_complaints && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Faculty Salary Claim</span>
                      </span>
                    )}
                    {inst.pending_pgrc_penalties > 0 && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                        <DollarSign className="w-3 h-3 text-red-600" />
                        <span>Penalty: {formatCurrency(inst.pending_pgrc_penalties)}</span>
                      </span>
                    )}
                    {inst.evc_deficiencies && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded border border-orange-300">
                        <span>EVC Deficiencies</span>
                      </span>
                    )}
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
