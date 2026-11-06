import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Clock, 
  Shield, 
  X
} from 'lucide-react';

export const GovFooter: React.FC = () => {
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
        
        {/* Subtle Geometric Polygonal Background Accent matching image.png */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 50%, rgba(30, 58, 138, 0.8) 0%, transparent 45%),
                              radial-gradient(circle at 85% 30%, rgba(14, 116, 144, 0.4) 0%, transparent 50%),
                              linear-gradient(135deg, rgba(0, 33, 71, 0.95) 0%, rgba(0, 19, 43, 0.98) 100%)`
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
            
            {/* ================================================================= */}
            {/* COLUMN 1: SOCIAL ICONS (image.png far left)                      */}
            {/* ================================================================= */}
            <div className="lg:col-span-2 flex items-center lg:items-start lg:pt-2">
              <div className="flex items-center space-x-3 text-slate-200">
                
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/AICTEOfficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="AICTE Facebook"
                  className="hover:text-[#FFA500] transition-colors p-1"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>

                <span className="text-slate-400 font-light text-base select-none">|</span>

                {/* X / Twitter */}
                <a
                  href="https://twitter.com/AICTE_INDIA"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="AICTE Twitter / X"
                  className="hover:text-[#FFA500] transition-colors p-1"
                >
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                <span className="text-slate-400 font-light text-base select-none">|</span>

                {/* Android Robot */}
                <a
                  href="https://play.google.com/store/apps/developer?id=AICTE"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="AICTE Android Apps on Google Play"
                  className="hover:text-[#FFA500] transition-colors p-1"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.4111 13.8533 8.0805 12 8.0805c-1.8534 0-3.5903.3306-5.1367.8692L4.841 5.4467a.4161.4161 0 0 0-.5677-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3433-4.1021-2.689-7.5743-6.1185-9.4396"/>
                  </svg>
                </a>

              </div>
            </div>

            {/* ================================================================= */}
            {/* COLUMN 2: PORTAL LINKS (image.png column 2)                      */}
            {/* ================================================================= */}
            <div className="lg:col-span-3 space-y-2.5">
              <ul className="space-y-2 text-slate-200">
                <li>
                  <a 
                    href="https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>AICTE Dashboard</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.aicte-india.org/reports/overview" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>Reports</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.aicte-india.org/bureaus/directory" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>Directory</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('cyber')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Cyber Security
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('terms')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Term of use
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
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('rti')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Right to Information
                  </button>
                </li>
              </ul>
            </div>

            {/* ================================================================= */}
            {/* COLUMN 3: SERVICES & VERIFICATION (image.png column 3)           */}
            {/* ================================================================= */}
            <div className="lg:col-span-3 space-y-2.5">
              <ul className="space-y-2 text-slate-200">
                <li>
                  <a 
                    href="https://css.aicte-india.org/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>Centralized Support System</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php#!/approved" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>Verify Institute Approval</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.aicte-india.org/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>Deemed University Result</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://facilities.aicte-india.org/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>PGDM Student Verification</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.aicte-india.org/contact" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>Contact us</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveInfoModal('sitemap')}
                    className="hover:text-amber-300 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Sitemap
                  </button>
                </li>
                <li>
                  <a 
                    href="https://facilities.aicte-india.org/dashboard/pages/approvedinstitutes.php" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-amber-300 hover:underline transition-colors flex items-center space-x-1"
                  >
                    <span>AICTE Approved Universities/Institutions</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>

            {/* ================================================================= */}
            {/* COLUMN 4: AICTE BRAND & CONTACT DETAILS (image.png far right)     */}
            {/* ================================================================= */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Official AICTE Brand Logo & Title */}
              <div className="flex items-center space-x-3">
                <img 
                  src="/aicte-logo.png" 
                  alt="AICTE Logo" 
                  className="h-14 sm:h-16 w-auto object-contain shrink-0" 
                />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight">
                    अखिल भारतीय तकनीकी शिक्षा परिषद्
                  </span>
                  <span className="font-semibold text-slate-200 text-xs sm:text-sm tracking-tight leading-tight">
                    All India Council for Technical Education
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase mt-0.5">
                    Regulation &amp; Approval Bureau • VidyaKosh
                  </span>
                </div>
              </div>

              {/* Postal Address & Telephone matching image.png */}
              <div className="space-y-1.5 text-slate-300 text-xs sm:text-[13px] leading-relaxed pt-1">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Phone: 011-2958 1050 - 1000</span>
                </div>

                <div className="flex items-center space-x-2 text-slate-400 text-[11px] pt-1">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Last Updated: {formattedDate || 'December 12, 2023 3:24pm'}</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* SUB-FOOTER STRIP: LEGAL, GOV OF INDIA & AUDIT COMPLIANCE          */}
        {/* ================================================================= */}
        <div className="border-t border-[#001733] bg-[#001833] py-3.5 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <span>🇮🇳</span>
              <span>
                © All India Council for Technical Education (AICTE), Ministry of Education, Government of India. All Rights Reserved.
              </span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400">
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[10px]">
                <ShieldCheck className="w-3 h-3" />
                <span>UX4G &amp; GIGW 3.0</span>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">VidyaKosh SHA-256 Ledger</span>
              <span>•</span>
              <span className="font-mono text-amber-400 font-bold">SIH26265</span>
            </div>
          </div>
        </div>

      </footer>

      {/* ================================================================= */}
      {/* INTERACTIVE COMPLIANCE MODALS                                      */}
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
                    {activeInfoModal === 'cyber' && 'Cyber Security & Audit Compliance'}
                    {activeInfoModal === 'terms' && 'Terms of Use & Regulatory Framework'}
                    {activeInfoModal === 'privacy' && 'Privacy & Data Protection Policy'}
                    {activeInfoModal === 'rti' && 'Right to Information (RTI Act 2005)'}
                    {activeInfoModal === 'sitemap' && 'AICTE VidyaKosh Portal Sitemap'}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Statutory Bureau Reference • Ministry of Education, Govt. of India
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

            {activeInfoModal === 'cyber' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>AICTE VidyaKosh</strong> adheres to the Cyber Security Guidelines issued by the <strong>Indian Computer Emergency Response Team (CERT-In)</strong>, Ministry of Electronics and Information Technology (MeitY), Government of India.
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 font-mono text-[11px]">
                  <p>✔ SHA-256 Merkle-tree cryptographic hash chained audit records.</p>
                  <p>✔ TLS 1.3 Transport Layer Encryption with RSA 2048/4096-bit DSC sign-off.</p>
                  <p>✔ Role-Based Access Control (RBAC) enforced with strict session lifecycle.</p>
                </div>
              </div>
            )}

            {activeInfoModal === 'terms' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  This portal is owned and operated by the <strong>All India Council for Technical Education (AICTE)</strong>, under the Approval Process Handbook (APH 2026-31).
                </p>
                <p>
                  Unauthorized access, alteration of electronic Fixed Deposit Receipts (e-FDR), forgery of lien hypothecation certificates, or falsification of Core Banking System (CBS) confirmations constitutes a cognizable offense under the Information Technology Act, 2000 and Section 420/468 of the IPC.
                </p>
              </div>
            )}

            {activeInfoModal === 'privacy' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  AICTE does not collect personal information for any purpose other than statutory regulatory compliance, institution identity verification, and joint lien FDR administration.
                </p>
                <p>
                  All institutional financial tokens and attestation timestamps are retained in immutable cryptographically sealed audit blocks as mandated by central oversight authorities.
                </p>
              </div>
            )}

            {activeInfoModal === 'rti' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  In accordance with the <strong>Right to Information Act, 2005</strong>, citizens can seek information regarding the statutory policies, institutional approvals, and sanctioned intake of technical institutions.
                </p>
                <p>
                  RTI Applications may be filed online at the national RTI Portal (<a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">rtionline.gov.in</a>) or submitted to the Central Public Information Officer (CPIO), AICTE Headquarters, New Delhi.
                </p>
              </div>
            )}

            {activeInfoModal === 'sitemap' && (
              <div className="space-y-3 leading-relaxed">
                <p className="font-semibold">VidyaKosh Centralized Structure:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li><strong>Tier 1 Accessibility:</strong> Live Clock, Font Resizing, Bilingual Toggle, Web Portal SSO.</li>
                  <li><strong>Tier 2 Institutional Branding:</strong> Council Identity, Statutory Notices, Circulars &amp; SOPs.</li>
                  <li><strong>Tier 3 Navigation Hub:</strong> Bureaus/Cell, Schemes, Initiatives, Education, Bulletins.</li>
                  <li><strong>Core Vault Operations:</strong> Institution FDR Pipeline, Bank CBS Attestation, Scrutiny Review, DSC Release NOC.</li>
                </ul>
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