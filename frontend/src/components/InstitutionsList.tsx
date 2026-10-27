import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  DollarSign, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  Eye, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import type { Institution } from '../types';

interface InstitutionsListProps {
  institutions: Institution[];
  selectedInstitutionId: number | null;
  onSelectInstitution: (id: number) => void;
}

type SortColumn = 'pid' | 'name' | 'region' | 'required_fdr_norm' | 'compliance';
type SortDirection = 'asc' | 'desc';

export const InstitutionsList: React.FC<InstitutionsListProps> = ({
  institutions,
  selectedInstitutionId,
  onSelectInstitution
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | 'CLEAN' | 'FLAGGED'>('ALL');
  const [sortColumn, setSortColumn] = useState<SortColumn>('pid');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Pipeline
  const filteredAndSortedInstitutions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = institutions.filter((inst) => {
      // 1. Search Query Filter (PID or Name)
      const matchesSearch = 
        !query ||
        inst.pid.toLowerCase().includes(query) ||
        inst.name.toLowerCase().includes(query) ||
        (inst.city && inst.city.toLowerCase().includes(query)) ||
        inst.state.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Compliance Status Filter
      const hasFlags = inst.pending_court_cases || 
        inst.unpaid_salary_complaints || 
        inst.pending_pgrc_penalties > 0 || 
        inst.evc_deficiencies;

      if (complianceFilter === 'CLEAN') return !hasFlags;
      if (complianceFilter === 'FLAGGED') return hasFlags;
      return true;
    });

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'pid') {
        comparison = a.pid.localeCompare(b.pid);
      } else if (sortColumn === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortColumn === 'region') {
        comparison = a.region.localeCompare(b.region);
      } else if (sortColumn === 'required_fdr_norm') {
        comparison = a.required_fdr_norm - b.required_fdr_norm;
      } else if (sortColumn === 'compliance') {
        const aFlags = (a.pending_court_cases ? 1 : 0) + (a.unpaid_salary_complaints ? 1 : 0) + (a.pending_pgrc_penalties > 0 ? 1 : 0) + (a.evc_deficiencies ? 1 : 0);
        const bFlags = (b.pending_court_cases ? 1 : 0) + (b.unpaid_salary_complaints ? 1 : 0) + (b.pending_pgrc_penalties > 0 ? 1 : 0) + (b.evc_deficiencies ? 1 : 0);
        comparison = aFlags - bFlags;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [institutions, searchQuery, complianceFilter, sortColumn, sortDirection]);

  const cleanCount = institutions.filter(i => !i.pending_court_cases && !i.unpaid_salary_complaints && i.pending_pgrc_penalties === 0 && !i.evc_deficiencies).length;
  const flaggedCount = institutions.length - cleanCount;

  const renderSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 ml-1 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-[#1E3A8A] font-bold ml-1 inline" />
      : <ChevronDown className="w-3.5 h-3.5 text-[#1E3A8A] font-bold ml-1 inline" />;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-[#1E3A8A]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Registered AICTE Institutions & Compliance Profiles
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200 font-mono">
                Executive Master Ledger
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Live AICTE Permanent ID (PID) bindings with real-time statutory FDR deposit requirements, court clearance records, and bureau penalty tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto text-xs text-slate-600 font-mono font-bold">
          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
            {institutions.length} Institutions Enrolled
          </span>
        </div>
      </div>

      {/* Dense Controls Bar: Search & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by AICTE PID (e.g. 1-432109876) or Institution Name..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Executive Compliance Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
          <button
            onClick={() => setComplianceFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              complianceFilter === 'ALL'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All ({institutions.length})
          </button>
          <button
            onClick={() => setComplianceFilter('CLEAN')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              complianceFilter === 'CLEAN'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Clean ERP ({cleanCount})
          </button>
          <button
            onClick={() => setComplianceFilter('FLAGGED')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              complianceFilter === 'FLAGGED'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Action Needed ({flaggedCount})
          </button>
        </div>
      </div>

      {/* Dense Executive Data Table */}
      <div className="overflow-x-auto rounded-md border border-slate-200 shadow-2xs">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              {/* AICTE PID Column */}
              <th 
                onClick={() => handleSort('pid')}
                className="py-2.5 px-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition select-none"
              >
                <div className="flex items-center">
                  <span>AICTE PID</span>
                  {renderSortIndicator('pid')}
                </div>
              </th>

              {/* Institution Name Column */}
              <th 
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition select-none"
              >
                <div className="flex items-center">
                  <span>Institution Name &amp; Profile</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              {/* Region Column */}
              <th 
                onClick={() => handleSort('region')}
                className="py-2.5 px-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition select-none"
              >
                <div className="flex items-center">
                  <span>Region</span>
                  {renderSortIndicator('region')}
                </div>
              </th>

              {/* Statutory FDR Norm Column */}
              <th 
                onClick={() => handleSort('required_fdr_norm')}
                className="py-2.5 px-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition select-none text-right"
              >
                <div className="flex items-center justify-end">
                  <span>Statutory FDR Norm</span>
                  {renderSortIndicator('required_fdr_norm')}
                </div>
              </th>

              {/* ERP Compliance Status Column */}
              <th 
                onClick={() => handleSort('compliance')}
                className="py-2.5 px-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition select-none"
              >
                <div className="flex items-center">
                  <span>ERP Compliance Status</span>
                  {renderSortIndicator('compliance')}
                </div>
              </th>

              {/* Active/Pending Actions Column */}
              <th className="py-2.5 px-3 border-b border-slate-200 text-center font-bold">
                Active/Pending Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredAndSortedInstitutions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <Building2 className="w-6 h-6 text-slate-300" />
                    <span className="font-semibold text-slate-700">No institutions found matching criteria</span>
                    <span className="text-[11px] text-slate-400">
                      Try clearing search filters or search by a different PID/Name.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedInstitutions.map((inst) => {
                const isSelected = selectedInstitutionId === inst.id;
                const hasFlags = inst.pending_court_cases || 
                  inst.unpaid_salary_complaints || 
                  inst.pending_pgrc_penalties > 0 || 
                  inst.evc_deficiencies;

                return (
                  <tr
                    key={inst.id}
                    onClick={() => onSelectInstitution(inst.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/60 font-medium border-l-4 border-l-amber-600'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* AICTE PID */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#1a365d] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {inst.pid}
                      </span>
                    </td>

                    {/* Institution Name & Details */}
                    <td className="py-2.5 px-3 align-middle max-w-xs sm:max-w-sm">
                      <div className="font-bold text-xs text-slate-900 leading-snug">
                        {inst.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{inst.city ? `${inst.city}, ` : ''}{inst.state}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{inst.programme_tier}</span>
                        </span>
                      </div>
                    </td>

                    {/* Region */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {inst.region} Region
                      </span>
                    </td>

                    {/* Statutory FDR Norm */}
                    <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {formatCurrency(inst.required_fdr_norm)}
                      </span>
                    </td>

                    {/* ERP Compliance Status */}
                    <td className="py-2.5 px-3 align-middle">
                      {!hasFlags ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 whitespace-nowrap">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Clean ERP Record</span>
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {inst.pending_court_cases && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-300 whitespace-nowrap">
                              <Scale className="w-3 h-3 text-red-600 shrink-0" />
                              <span>Court Case Active</span>
                            </span>
                          )}
                          {inst.unpaid_salary_complaints && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Salary Claim</span>
                            </span>
                          )}
                          {inst.pending_pgrc_penalties > 0 && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-300 whitespace-nowrap">
                              <DollarSign className="w-3 h-3 text-red-600 shrink-0" />
                              <span>PGRC: {formatCurrency(inst.pending_pgrc_penalties)}</span>
                            </span>
                          )}
                          {inst.evc_deficiencies && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-orange-900 bg-orange-50 px-2 py-0.5 rounded border border-orange-300 whitespace-nowrap">
                              <span>EVC Deficiencies</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Active/Pending Actions */}
                    <td className="py-2.5 px-3 align-middle text-center whitespace-nowrap">
                      {isSelected ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold bg-[#1E3A8A] text-white shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Active Target</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInstitution(inst.id);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 transition cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect Profile</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 gap-2">
        <span>
          Displaying {filteredAndSortedInstitutions.length} of {institutions.length} Technical Institutions under AICTE APH Regulatory Norms
        </span>
        <span className="font-mono text-slate-400">
          Executive View • Pillar 4 ERP Verification
        </span>
      </div>

    </div>
  );
};
