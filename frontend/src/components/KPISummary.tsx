import React from 'react';
import { 
  IndianRupee, 
  AlertTriangle, 
  Clock, 
  Fingerprint, 
  Building2 
} from 'lucide-react';
import type { DashboardSummary } from '../types';

interface KPISummaryProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

export const KPISummary: React.FC<KPISummaryProps> = ({ summary, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-white rounded border border-gray-200 border-t-4 border-t-gray-300 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Locked Security Deposit',
      value: formatCurrency(summary.total_security_deposit_locked),
      subtext: `Across ${summary.total_institutions} AICTE Institutions`,
      icon: <IndianRupee className="w-5 h-5 text-blue-700" />,
      topBorderColor: 'border-t-blue-700',
      valueColor: 'text-gray-900'
    },
    {
      title: 'Registered Institutions',
      value: summary.total_institutions.toString(),
      subtext: 'Engineering, MBA & Diploma Norms',
      icon: <Building2 className="w-5 h-5 text-[#1a365d]" />,
      topBorderColor: 'border-t-[#1a365d]',
      valueColor: 'text-gray-900'
    },
    {
      title: 'Maturity / Renewal Action',
      value: summary.maturing_action_needed_count.toString(),
      subtext: 'T-90, T-30 & Matured Pending Queue',
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      topBorderColor: 'border-t-orange-500',
      valueColor: 'text-orange-600'
    },
    {
      title: 'Discrepancy / Tamper Alerts',
      value: summary.discrepancy_tamper_count.toString(),
      subtext: 'Compound Math / ELA / Lien Anomalies',
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      topBorderColor: 'border-t-red-600',
      valueColor: 'text-red-600'
    },
    {
      title: 'Audit Trail: System Verified',
      value: summary.audit_chain_verified ? 'SYSTEM VERIFIED' : 'ACTION REQUIRED',
      subtext: 'Permanent Regulatory Audit Trail',
      icon: <Fingerprint className="w-5 h-5 text-green-700" />,
      topBorderColor: summary.audit_chain_verified ? 'border-t-green-600' : 'border-t-red-600',
      valueColor: summary.audit_chain_verified ? 'text-green-700' : 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded border border-gray-300 border-t-4 ${card.topBorderColor} p-4 shadow-sm transition-all hover:shadow`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{card.title}</span>
            <div className="p-2 rounded bg-gray-50 border border-gray-200">
              {card.icon}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-black tracking-tight ${card.valueColor}`}>
              {card.value}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 font-medium">
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
};
