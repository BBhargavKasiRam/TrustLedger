import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowLeft, 
  ShieldCheck, 
  BookOpen, 
  Scale, 
  ChevronRight, 
  Layers,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getPortalPageByPath, getPortalSectionById } from '../data/portalPagesData';
import type { PortalSubPage, PortalSection } from '../data/portalPagesData';

interface PortalDirectoryPageProps {
  page?: PortalSubPage;
  section?: PortalSection;
}

export const PortalDirectoryPage: React.FC<PortalDirectoryPageProps> = ({ page: propPage, section: propSection }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page and section from prop or URL
  const activePage = propPage || getPortalPageByPath(location.pathname);
  const activeSection = propSection || (activePage ? getPortalSectionById(activePage.sectionId) : undefined);

  // If page not found but section exists, show Section Hub
  if (!activePage && activeSection) {
    return (
      <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-[#002147] transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#002147] font-bold">{activeSection.title}</span>
        </div>

        {/* Section Hub Header */}
        <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-[#002147] p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                COUNCIL DIRECTORY
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002147] tracking-tight mt-1.5">
                {activeSection.title}
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                {activeSection.description}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 bg-[#002147] hover:bg-[#003870] text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition cursor-pointer self-start md:self-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal Home</span>
            </button>
          </div>

          {/* Sub-pages Grid */}
          <div className="pt-6">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-4">
              Explore Available Sub-Sections &amp; Dedicated Pages:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSection.subPages.map((sub) => (
                <Link
                  key={sub.slug}
                  to={sub.path}
                  className="p-4 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-white text-[#002147] border border-slate-200 px-2 py-0.5 rounded">
                        {sub.badge}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#002147] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#002147] transition">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {sub.subtitle}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{sub.statutoryRef.split('•')[0]}</span>
                    <span className="text-blue-900 font-bold group-hover:underline">Open Page →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // If neither page nor section found
  if (!activePage) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-sm text-slate-600">The requested regulatory page or directory could not be located.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#002147] text-white rounded-lg text-xs font-bold"
        >
          Return to Portal Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB NAVIGATION                                              */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-[#002147] transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {activeSection ? (
          <Link to={activeSection.path} className="hover:text-[#002147] transition">
            {activeSection.title}
          </Link>
        ) : (
          <span>Directory</span>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#002147] font-bold truncate max-w-xs sm:max-w-md">
          {activePage.title}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. OFFICIAL STATUTORY HERO BANNER                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-[#002147] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="bg-[#002147] text-amber-400 p-1.5 rounded font-bold text-xs flex items-center gap-1 font-mono">
                <Building2 className="w-3.5 h-3.5" />
                <span>AICTE VIDYAKOSH</span>
              </span>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                {activePage.badge}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                • {activePage.statutoryRef}
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#002147] tracking-tight">
              {activePage.title}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
              {activePage.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold border border-slate-300 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1.5 bg-[#002147] hover:bg-[#003870] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <span>Portal Home</span>
            </button>
          </div>
        </div>

        {/* Live Status Strip */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Regulatory Revision: <strong>{activePage.updatedDate}</strong></span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OFFICIAL GAZETTE CONCORDANT</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO-COLUMN LAYOUT: SIBLING DIRECTORY SIDEBAR + MAIN PAGE CONTENT       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Sibling Dropdown Pages in this Section */}
        {activeSection && activeSection.subPages.length > 0 && (
          <aside className="lg:col-span-3 bg-[#0F2547] text-white rounded-xl shadow-md border border-slate-800 p-4 space-y-3">
            <div className="border-b border-slate-700 pb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
                {activeSection.title} Directory
              </span>
              <h3 className="text-xs font-extrabold text-white">Select Sub-Section</h3>
            </div>

            <nav className="space-y-1.5">
              {activeSection.subPages.map((sub) => {
                const isCurrent = sub.path === activePage.path;
                return (
                  <Link
                    key={sub.slug}
                    to={sub.path}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between group ${
                      isCurrent 
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{sub.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-slate-950' : 'text-slate-500 group-hover:text-amber-300'}`} />
                  </Link>
                );
              })}
            </nav>

            {/* Quick Related Shortcuts */}
            <div className="pt-3 border-t border-slate-700/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Shortcuts:
              </span>
              <Link
                to="/deposit-norms"
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 text-[11px] font-medium text-amber-300 flex items-center space-x-1.5 transition"
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">APH Chapter IV Deposit Norms</span>
              </Link>
              <Link
                to="/circulars"
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 text-[11px] font-medium text-blue-200 flex items-center space-x-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Official Circulars &amp; SOPs</span>
              </Link>
              <Link
                to="/dashboard"
                className="w-full text-left p-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center space-x-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Regulatory Workbench Desk</span>
              </Link>
            </div>
          </aside>
        )}

        {/* Right Main Content Pane */}
        <main className={`${activeSection ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6`}>
          
          {/* Overview Callout Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#002147] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Overview &amp; Mandate</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border-l-4 border-l-[#002147] p-4 rounded-r-lg">
              {activePage.overview}
            </p>

            {/* Key Principles Grid */}
            {activePage.keyPrinciples && activePage.keyPrinciples.length > 0 && (
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Core Regulatory Directives &amp; Operational Benchmarks:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activePage.keyPrinciples.map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-xs font-bold text-slate-900 block">
                        {idx + 1}. {p.title}
                      </strong>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metrics Strip (if provided) */}
          {activePage.metrics && activePage.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activePage.metrics.map((m, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm space-y-1 text-center">
                  <span className="text-xs text-slate-500 font-medium block">{m.label}</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#002147] font-mono block">{m.value}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">{m.detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Sub-Sections */}
          {activePage.sections && activePage.sections.map((sec, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3.5">
              <h3 className="text-base font-bold text-[#002147] flex items-center space-x-2">
                <span className="p-1 rounded bg-blue-50 text-[#002147] text-xs">§</span>
                <span>{sec.title}</span>
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {sec.content}
              </p>

              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul className="space-y-1.5 pl-2 text-xs text-slate-700">
                  {sec.bulletPoints.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start space-x-2">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.highlightBox && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs font-medium text-amber-950">
                  <strong>Regulatory Advisory:</strong> {sec.highlightBox}
                </div>
              )}
            </div>
          ))}

          {/* Table Data (if present) */}
          {activePage.tableData && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Statutory Regulatory Classification &amp; Norms Table
                </h3>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                  APH 2026-31
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded">
                  <thead className="bg-[#002147] text-white">
                    <tr>
                      {activePage.tableData.headers.map((h, idx) => (
                        <th key={idx} className="p-2.5 font-bold uppercase tracking-wider text-[11px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activePage.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 font-medium text-slate-800">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ Accordion / Listing (if present) */}
          {activePage.faq && activePage.faq.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#002147] uppercase tracking-wider border-b border-slate-200 pb-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Frequently Asked Statutory Questions (FAQs)</span>
              </div>
              
              <div className="space-y-3">
                {activePage.faq.map((item, fIdx) => (
                  <div key={fIdx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-bold text-xs text-slate-900">
                      Q: {item.q}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Action Bar at Bottom of Page */}
          <div className="bg-[#002147] text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-wider">
                VidyaKosh Electronic Depository
              </span>
              <h4 className="font-bold text-sm text-white">
                Need to file or verify an institutional security deposit?
              </h4>
              <p className="text-xs text-slate-300">
                Access the national e-FDR submission desk or view full Approval Process Handbook provisions.
              </p>
            </div>
            <div className="flex items-center space-x-2.5 shrink-0">
              <Link
                to="/deposit-norms"
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition shadow-xs"
              >
                APH Deposit Norms →
              </Link>
              <Link
                to="/dashboard"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-xs transition border border-white/20"
              >
                Access Desk
              </Link>
            </div>
          </div>

        </main>

      </div>

    </div>
  );
};
