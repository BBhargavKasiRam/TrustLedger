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
  Code2,
  Lock,
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
            {/* COLUMN 1: PROJECT CHANNELS & CODEBASE (Far Left)                  */}
            {/* ================================================================= */}
            <div className="lg:col-span-2 flex items-center lg:items-start lg:pt-2">
              <div className="flex items-center space-x-3 text-slate-200">
                
                {/* GitHub Repository */}
                <a
                  href="https://github.com/BBhargavKasiRam/TrustLedger"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="TrustLedger GitHub Repository"
                  className="hover:text-[#FFA500] transition-colors p-1 group flex items-center space-x-1"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </a>

                <span className="text-slate-400 font-light text-base select-none">|</span>

                {/* API & Developer Docs */}
                <button
                  onClick={() => setActiveInfoModal('api')}
                  title="REST & Webhook API Documentation"
                  className="hover:text-[#FFA500] transition-colors p-1 cursor-pointer"
                >
                  <Code2 className="w-5 h-5" />
                </button>

                <span className="text-slate-400 font-light text-base select-none">|</span>

                {/* Security Architecture */}
                <button
                  onClick={() => setActiveInfoModal('security')}
                  title="Cryptographic Architecture & Ledger Security"
                  className="hover:text-[#FFA500] transition-colors p-1 cursor-pointer"
                >
                  <Lock className="w-5 h-5" />
                </button>

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