import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const GovFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-3.5 px-6 border-t border-slate-800 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center space-x-2 text-center sm:text-left">
          <span>🇮🇳</span>
          <span className="font-medium text-slate-300">
            © All India Council for Technical Education (AICTE), Ministry of Education, Government of India.
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>UX4G &amp; GIGW 3.0 Compliant</span>
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="hidden md:inline font-mono">Secured by SHA-256 Audit Ledger</span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="font-mono text-amber-400 font-bold">SIH26265</span>
        </div>
      </div>
    </footer>
  );
};
