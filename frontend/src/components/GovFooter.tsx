import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Headphones, 
  Clock, 
  Shield, 
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export const GovFooter: React.FC = () => {
  const navigate = useNavigate();
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      setFormattedDate(now.toLocaleDateString('en-US', options).replace(' at ', ' '));
    };
    updateDate();
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <footer className="bg-[#002147] text-white text-xs print:hidden relative overflow-hidden border-t-2 border-[#FFA500]/70 mt-auto select-none">
        
        {/* Subtle Geometric Polygonal Background Accent matching the reference design */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 50%, rgba(30, 58, 138, 0.8) 0%, transparent 45%),
                              radial-gradient(circle at 85% 30%, rgba(14, 116, 144, 0.4) 0%, transparent 50%),
                              linear-gradient(135deg, rgba(0, 33, 71, 0.95) 0%, rgba(0, 19, 43, 0.98) 100%)`
          }}
        />

        <div className="relative w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
            
            {/* ================================================================= */}
            {/* COLUMN 1: PLATFORM SYMBOLS (Far Left - Matching Reference)        */}
            {/* ================================================================= */}
            <div className="lg:col-span-2 flex items-center lg:items-start lg:pt-2">
              <div className="flex items-center space-x-3.5 text-white">
                
                {/* Facebook Icon */}
                <span
                  title="Facebook"
                  aria-label="Facebook"
                  className="p-1 text-white select-none opacity-90 hover:opacity-100 transition-opacity cursor-default flex items-center justify-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                  </svg>
                </span>

                {/* Vertical Divider */}
                <span className="h-6 w-[1.5px] bg-white/70 inline-block select-none" aria-hidden="true" />

                {/* X Icon (formerly Twitter) */}
                <span
                  title="X"
                  aria-label="X"
                  className="p-1 text-white select-none opacity-90 hover:opacity-100 transition-opacity cursor-default flex items-center justify-center"
                >
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </span>

                {/* Vertical Divider */}
                <span className="h-6 w-[1.5px] bg-white/70 inline-block select-none" aria-hidden="true" />

                {/* Android Head Icon */}
                <span
                  title="Android"
                  aria-label="Android"
                  className="p-1 text-white select-none opacity-90 hover:opacity-100 transition-opacity cursor-default flex items-center justify-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9979-3.4606a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1374 1.0984L4.8403 5.4463a.416.416 0 0 0-.5676-.1521.416.416 0 0 0-.1521.5676l1.9979 3.4606C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                  </svg>
                </span>

              </div>
            </div>

            {/* ================================================================= */}
            {/* COLUMN 2: APPLICATION MODULES (Column 2)                          */}
            {/* ================================================================= */}
            <div className="lg:col-span-3 space-y-2.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Vault Capabilities
              </span>
              <ul className="space-y-2 text-slate-200">
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('vault')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    e-FDR Registry &amp; Vault
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('cbs')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    CBS Bank Attestation Engine
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('ledger')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Immutable Audit Ledger
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('sla')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Maturity Alerts &amp; SLA Engine
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('noc')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    DSC Discharge &amp; Release NOC
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('terms')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('privacy')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* ================================================================= */}
            {/* COLUMN 3: PLATFORM RESOURCES & VERIFICATION (Column 3)            */}
            {/* ================================================================= */}
            <div className="lg:col-span-3 space-y-2.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Governance &amp; Support
              </span>
              <ul className="space-y-2 text-slate-200">
                <li>
                  <button 
                    onClick={() => navigate('/circulars')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    APH 2026-31 User Manual &amp; SOP
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/deposit-norms')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Chapter IV Deposit Norms Guide
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('verify')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Verify Deposit Certificate
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('telemetry')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    System Telemetry &amp; Health
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('api')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Core Banking Integration APIs
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('helpdesk')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Centralized Support Helpdesk
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('sitemap')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Application Sitemap
                  </button>
                </li>
                <li>
                  <a 
                    href="https://github.com/BBhargavKasiRam/TrustLedger" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>TrustLedger Source Code</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>

            {/* ================================================================= */}
            {/* COLUMN 4: OUR APPLICATION IDENTITY & CONTACT (Column 4)           */}
            {/* ================================================================= */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Application Logo & Title */}
              <div className="flex items-center space-x-3.5">
                <img 
                  src="/favicon.png" 
                  alt="VidyaKosh Logo" 
                  className="h-14 sm:h-16 w-auto object-contain shrink-0 rounded" 
                />
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-white text-base sm:text-lg leading-tight tracking-tight">
                    विद्याकोष (VidyaKosh)
                  </span>
                  <span className="font-semibold text-slate-200 text-xs sm:text-sm tracking-tight leading-tight">
                    TrustLedger Digital Vault
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase mt-0.5">
                    Centralized Institutional e-FDR Corpus
                  </span>
                </div>
              </div>

              {/* Portal Contact & Assistance */}
              <div className="space-y-1.5 text-slate-300 text-xs sm:text-[13px] leading-relaxed pt-1">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>support@vidyakosh.gov.in</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Headphones className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Portal Helpline: 1800-11-FDRS (Toll Free)</span>
                </div>

                <div className="flex items-center space-x-2 text-slate-400 text-[11px] pt-1">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Last Synchronized: {formattedDate || 'Just now'}</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* SUB-FOOTER STRIP: APPLICATION BRAND & AUDIT COMPLIANCE            */}
        {/* ================================================================= */}
        <div className="border-t border-[#001733] bg-[#001833] py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
          <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-300">
                © 2026 VidyaKosh (TrustLedger). Centralized Institutional Security Deposit Management System.
              </span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400">
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[10px]">
                <ShieldCheck className="w-3 h-3" />
                <span>UX4G &amp; GIGW 3.0</span>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">SHA-256 Merkle Ledger</span>
            </div>
          </div>
        </div>

      </footer>

      {/* ================================================================= */}
      {/* INTERACTIVE APPLICATION MODALS                                    */}
      {/* ================================================================= */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border-2 border-[#002147] max-w-xl w-full p-6 relative max-h-[85vh] overflow-y-auto text-slate-900 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#002147] text-white rounded">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                    {activeInfoModal === 'vault' && 'Centralized e-FDR Registry & Vault'}
                    {activeInfoModal === 'cbs' && 'Core Banking System (CBS) Attestation'}
                    {activeInfoModal === 'ledger' && 'Immutable SHA-256 Audit Ledger'}
                    {activeInfoModal === 'sla' && 'Maturity Alerts & Regulatory Escalations'}
                    {activeInfoModal === 'noc' && 'DSC Digital Discharge & Release NOC'}
                    {activeInfoModal === 'terms' && 'Platform Terms of Use'}
                    {activeInfoModal === 'privacy' && 'Privacy & Information Policy'}
                    {activeInfoModal === 'sop' && 'Standard Operating Procedure (APH 2026-31)'}
                    {activeInfoModal === 'verify' && 'Deposit Certificate Verification'}
                    {activeInfoModal === 'telemetry' && 'Live Platform Telemetry & Status'}
                    {activeInfoModal === 'api' && 'Core Banking Webhook & REST APIs'}
                    {activeInfoModal === 'helpdesk' && 'Technical Support & Incident Desk'}
                    {activeInfoModal === 'sitemap' && 'VidyaKosh Application Sitemap'}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    VidyaKosh (TrustLedger) Security Deposit Governance
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            {activeInfoModal === 'vault' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>VidyaKosh</strong> acts as the central digital depository for all technical institute Fixed Deposit Receipts (FDRs). It eliminates paper-based physical receipt fraud through joint lien tokenization and real-time bank attestation.
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[11px] space-y-1">
                  <p>✔ Multi-tenant Institute FDR accounts</p>
                  <p>✔ Automatic tenure calculation (8-10 years mandatory lock-in)</p>
                  <p>✔ Real-time status pipeline from Initial Draft to Attested</p>
                </div>
              </div>
            )}

            {activeInfoModal === 'cbs' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  Branch Managers verify security deposits directly via cryptographic magic link authentication and Core Banking System (CBS) principal confirmation, enforcing joint lien hypothecation.
                </p>
              </div>
            )}

            {activeInfoModal === 'ledger' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  Every state transition (submission, attestation, scrutiny, maturity alert, discharge) creates an immutable SHA-256 cryptographic record linked to the previous transaction hash.
                </p>
              </div>
            )}

            {activeInfoModal === 'sla' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  Automated background cron monitors track upcoming maturity dates (T-90, T-60, T-30) and escalate unreviewed discrepancies exceeding 7 business days.
                </p>
              </div>
            )}

            {activeInfoModal === 'noc' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  End-of-term security deposit release requires four-eyes regulatory scrutiny, institution compliance clearance, and DSC cryptographic PIN sign-off by the Competent Authority.
                </p>
              </div>
            )}

            {activeInfoModal === 'terms' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  Access to VidyaKosh is governed by statutory institutional guidelines. All FDR data submitted is verified against bank Core Banking records.
                </p>
              </div>
            )}

            {activeInfoModal === 'privacy' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  Institutional financial deposits, account numbers, and branch identifiers are cryptographically hashed and safeguarded with strict role-based access controls.
                </p>
              </div>
            )}

            {activeInfoModal === 'sop' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  Institutions must submit FDR details within 30 days of initial Letter of Intent (LoI). Joint lien in favor of the Regulatory Council is mandatory.
                </p>
              </div>
            )}

            {activeInfoModal === 'verify' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  Institutions, banks, and auditors can verify the validity of any deposit token by entering the FDR number or Certificate Hash in the verification bar.
                </p>
              </div>
            )}

            {activeInfoModal === 'telemetry' && (
              <div className="space-y-3 leading-relaxed">
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded border border-emerald-200">
                  <p className="font-bold">● System Operational: All Services Active</p>
                  <p className="text-[11px] mt-1">FastAPI Backend: Online • SQLite / Database: Connected • Audit Chain: Valid</p>
                </div>
              </div>
            )}

            {activeInfoModal === 'api' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  VidyaKosh provides secure REST endpoints and webhook triggers for CBS bank integration:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[11px] space-y-1 overflow-x-auto">
                  <p>POST /api/v1/fdr/verify-cbs</p>
                  <p>GET  /api/v1/ledger/audit-trail/:fdrId</p>
                  <p>POST /api/v1/bank/attest-joint-lien</p>
                </div>
              </div>
            )}

            {activeInfoModal === 'helpdesk' && (
              <div className="space-y-3 leading-relaxed">
                <p>Need assistance with your institutional security deposit?</p>
                <p><strong>Email:</strong> support@vidyakosh.gov.in</p>
                <p><strong>Toll-Free Helpline:</strong> 1800-11-FDRS</p>
                <p><strong>Operating Hours:</strong> Monday – Saturday, 09:00 AM – 06:00 PM IST</p>
              </div>
            )}

            {activeInfoModal === 'sitemap' && (
              <div className="space-y-3 leading-relaxed">
                <p className="font-semibold text-slate-900">Official Portal Routes &amp; Structure:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => { setActiveInfoModal(null); navigate('/'); }}
                    className="w-full text-left p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <strong className="text-[#002147] block text-xs">/ (Home)</strong>
                      <span className="text-[11px] text-slate-600">National Portal Landing, Overview, Jan Parichay SSO, NOC Verification</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002147] group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => { setActiveInfoModal(null); navigate('/deposit-norms'); }}
                    className="w-full text-left p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <strong className="text-[#002147] block text-xs">/deposit-norms</strong>
                      <span className="text-[11px] text-slate-600">Approval Process Handbook (APH 2026-31) Chapter IV Deposit Norms Guide</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002147] group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => { setActiveInfoModal(null); navigate('/circulars'); }}
                    className="w-full text-left p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <strong className="text-[#002147] block text-xs">/circulars</strong>
                      <span className="text-[11px] text-slate-600">Official Ministry &amp; AICTE Circulars, Gazette SOPs &amp; User Manuals</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002147] group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => { setActiveInfoModal(null); navigate('/dashboard'); }}
                    className="w-full text-left p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <strong className="text-[#002147] block text-xs">/dashboard</strong>
                      <span className="text-[11px] text-slate-600">Authenticated Regulatory Workbench (Nodal Desk, Scrutiny, Authority, Bank Gateway)</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002147] group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-4 py-1.5 bg-[#002147] hover:bg-[#003870] text-white rounded font-medium cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};