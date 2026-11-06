import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { CircularsAndManuals } from './CircularsAndManuals';

export const CircularsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-[#002147] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-[#002147] text-amber-400 p-1.5 rounded-md font-bold text-xs flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>OFFICIAL GAZETTE</span>
              </span>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                REGULATORY REPOSITORY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#002147] tracking-tight">
              Official Ministry &amp; Regulatory Council Circulars, SOPs &amp; User Manuals
            </h1>
            <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
              Authoritative statutory notifications, Standard Operating Procedures (SOPs), Core Banking attestation advisories, and Approval Process Handbook directives governing institutional security deposits.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="self-start md:self-center flex items-center space-x-2 bg-[#002147] hover:bg-[#003870] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </button>
        </div>

        {/* Quick Statutory Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs text-slate-700">
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Cryptographic Authenticity:</strong> SHA-256 verifiable official circulars</span>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <Download className="w-4 h-4 text-blue-600 shrink-0" />
            <span><strong>Full Gazette Downloads:</strong> Instant print &amp; PDF regulatory access</span>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <ExternalLink className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>APH 2026-31 Concordance:</strong> Complies with Chapter IV statutory provisions</span>
          </div>
        </div>
      </div>

      {/* Embedded Circulars & Manuals Interactive Directory */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <CircularsAndManuals />
      </div>

    </div>
  );
};
