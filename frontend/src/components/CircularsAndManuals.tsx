import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Printer, 
  Search, 
  Calendar, 
  ShieldCheck, 
  BookOpen, 
  X,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

export interface CircularItem {
  id: string;
  circular_no: string;
  title: string;
  date: string;
  category: 'CIRCULAR' | 'USER_MANUAL' | 'SOP' | 'APH_NORM' | 'RBI_ADVISORY';
  category_label: string;
  file_size: string;
  issued_by: string;
  is_new?: boolean;
  summary: string;
  content: {
    ministry: string;
    bureau: string;
    ref_no: string;
    date: string;
    subject: string;
    addressee: string;
    background: string;
    statutory_directives: string[];
    penal_consequences?: string;
    signatory_name: string;
    signatory_designation: string;
    copy_to: string[];
  };
}

export const CIRCULARS_DATA: CircularItem[] = [
  {
    id: 'circ-2026-04',
    circular_no: 'AICTE/RB/FDR/2026/04',
    title: 'Mandatory CBS Lien Marking Guidelines & Core Banking Attestation Protocols',
    date: '15 Oct 2026',
    category: 'CIRCULAR',
    category_label: 'Regulation Circular',
    file_size: '482 KB PDF',
    issued_by: 'Regulation Bureau, AICTE New Delhi',
    is_new: true,
    summary: 'Directs all Scheduled Commercial Banks and AICTE-approved technical institutions to ensure strict joint lien endorsement in Core Banking Systems (CBS) and mandates zero-login OTP digital attestation.',
    content: {
      ministry: 'GOVERNMENT OF INDIA • MINISTRY OF EDUCATION',
      bureau: 'ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (REGULATION BUREAU)',
      ref_no: 'AICTE/RB/FDR/2026/04',
      date: '15th October 2026',
      subject: 'MANDATORY CBS LIEN MARKING & ZERO-LOGIN ATTRIBUTABLE ATTESTATION ON ALL SECURITY DEPOSIT FIXED DEPOSIT RECEIPTS (FDRs)',
      addressee: 'To: The Chief Executive Officers / Chairmen / Managing Directors of all Scheduled Commercial Banks, Regional Rural Banks, and Heads of AICTE Approved Institutions.',
      background: 'In recent scrutiny cycles, instances of doctored Fixed Deposit Receipts and unauthorized loan sanctions/credit facilities against AICTE joint security deposits without Council approval have been reported. This poses severe systemic risk to statutory corpus funds reserved for student fee refunds and faculty liabilities.',
      statutory_directives: [
        'Mandatory CBS Lien Entry: Banks must explicitly record AICTE\'s first charge lien in the Core Banking System under Joint Lien Flag ACTIVE_JOINT_AICTE. No premature closure or overdraft facility shall be permissible without official AICTE discharge NOC.',
        'Zero-Login Attestation Handshake: Branch Managers are obligated to authenticate institutional deposit claims within 72 hours of magic-link dispatch using two-factor OTP credentials on the AICTE portal.',
        'Immediate Fraud Reporting: In case an institution presents an FDR with doctored principal values or missing joint mandate clauses, the depository bank must flag MISMATCH_FLAGGED directly into the AICTE FDR Verification Registry.'
      ],
      penal_consequences: 'Failure by an institution to comply with CBS lien confirmation shall result in immediate withholding of Extension of Approval (EoA) under Regulation 8.4 of AICTE Regulations 2026.',
      signatory_name: 'Prof. Rajive Kumar',
      signatory_designation: 'Member Secretary, AICTE',
      copy_to: [
        'Chief Vigilance Officer (CVO), Ministry of Education, New Delhi',
        'Chief General Manager, Department of Banking Regulation, Reserve Bank of India, Mumbai',
        'All Regional Officers, AICTE (North, South, East, West, Central & South-West)',
        'Guard File / AICTE Official Notification Portal'
      ]
    }
  },
  {
    id: 'circ-2026-02',
    circular_no: 'AICTE/RB/SOP/2026/02',
    title: 'Standard Operating Procedure (SOP) for 4-Gate Statutory Release & NOC Issuance',
    date: '02 Sep 2026',
    category: 'SOP',
    category_label: 'Statutory SOP',
    file_size: '620 KB PDF',
    issued_by: 'Office of the Member Secretary, AICTE',
    is_new: true,
    summary: 'Prescribes the sequential 4-Gate automated workflow for the return of institutional security deposits upon completion of the mandatory 8/10-year lock-in tenure.',
    content: {
      ministry: 'GOVERNMENT OF INDIA • MINISTRY OF EDUCATION',
      bureau: 'ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (APPROVAL & REGULATION BUREAUS)',
      ref_no: 'AICTE/RB/SOP/2026/02',
      date: '2nd September 2026',
      subject: 'STANDARD OPERATING PROCEDURE (SOP) GOVERNING 4-GATE CLEARANCE AND DIGITAL QR-NOC ISSUANCE FOR FIXED DEPOSIT RELEASE',
      addressee: 'To: All Regional Officers, Scrutiny Committees, and Institutional Registrars.',
      background: 'To streamline the final discharge of security deposits deposited at the inception of technical institutes and eliminate regulatory delays, AICTE institutes an automated 4-Gate Clearance Pipeline.',
      statutory_directives: [
        'Gate 1 (Tenure & Encumbrance Check): Verification of 8 or 10 continuous years of lock-in lineage from the genesis root node, with zero unauthorized bank lien encumbrance.',
        'Gate 2 (Cross-Bureau ERP Sync): Automated querying of pending PGRC student refund penalties, faculty salary complaints, High Court stays, and EVC deficiencies. Release is automatically halted if any cell records dues.',
        'Gate 3 (Regional Scrutiny Recommendation): Regional Scrutiny Officer verification of physical certificate originals and bank verification confirmation.',
        'Gate 4 (Competent Authority DSC Issuance): Digital signature by the Member Secretary / Competent Authority generating an immutable SHA-256 certificate hash and verifiable public QR code.'
      ],
      penal_consequences: 'Any bypass of Gate 2 compliance holds without formal Council resolution constitutes a statutory violation.',
      signatory_name: 'Dr. Ramesh Unnikrishnan',
      signatory_designation: 'Advisor-I (Approval Bureau), AICTE',
      copy_to: [
        'Secretary, Higher Education, Ministry of Education, New Delhi',
        'All Directors/Principals of AICTE Approved Colleges',
        'AICTE IT & NeGD Portal Technical Cell'
      ]
    }
  },
  {
    id: 'circ-2026-aph',
    circular_no: 'AICTE/APH/2026-31/NORM-08',
    title: 'Approval Process Handbook (APH 2026-31) — Chapter 1: Security Deposit Norms',
    date: '10 Jan 2026',
    category: 'APH_NORM',
    category_label: 'Handbook Norms',
    file_size: '1.4 MB PDF',
    issued_by: 'Policy & Academic Planning Bureau, AICTE',
    summary: 'Statutory tables detailing required security deposit quantum across Technical, Pharmacy, Architecture, and Management programmes, joint pledging mandate, and 10-year provenance rules.',
    content: {
      ministry: 'GOVERNMENT OF INDIA • MINISTRY OF EDUCATION',
      bureau: 'ALL INDIA COUNCIL FOR TECHNICAL EDUCATION',
      ref_no: 'AICTE/APH/2026-31/NORM-08',
      date: '10th January 2026',
      subject: 'SECURITY DEPOSIT ESCROW REQUIREMENTS FOR ESTABLISHMENT OF NEW TECHNICAL INSTITUTIONS AND PROGRAMME ADDITIONS (2026-2031)',
      addressee: 'To: All Sponsoring Trusts, Societies, Section 8 Companies, and State Directorate of Technical Education.',
      background: 'The Approval Process Handbook lays down the statutory norms under Section 10 of the AICTE Act 1987. A joint security deposit in the name of the Trust/Society and Member Secretary, AICTE is mandatory to safeguard academic commitments.',
      statutory_directives: [
        'Security Deposit Quantum: Engineering/Technology (₹35 Lakhs), Management/MCA (₹15 Lakhs), Diploma/Polytechnic (₹15 Lakhs), Integrated Multi-Campus (₹50 Lakhs).',
        'Tenure Duration: Minimum 10 years continuous lock-in for Degree programmes and 8 years for Diploma programmes, with mandatory interest rollover or compound reinvestment.',
        'Lineage Tracking: In case of bank mergers, branch migrations, or 5-year renewal rollovers, the Child FDR must cryptographically reference the Genesis Root Parent node.'
      ],
      penal_consequences: 'Submitting tampered or collusive FDRs constitutes fraud under IPC Section 468/471 and entails immediate revocation of Letter of Approval (LoA).',
      signatory_name: 'Prof. T. G. Sitharam',
      signatory_designation: 'Chairman, AICTE',
      copy_to: [
        'Registrars of all Affiliating Technical Universities',
        'State Principal Secretaries (Higher & Technical Education)'
      ]
    }
  },
  {
    id: 'circ-2026-rbi',
    circular_no: 'RBI/2026-27/102 • AICTE/CO-ORD/03',
    title: 'RBI Advisory: Prohibition of Credit Facilities Against Joint Regulatory Deposits',
    date: '28 Jul 2026',
    category: 'RBI_ADVISORY',
    category_label: 'RBI Joint Advisory',
    file_size: '340 KB PDF',
    issued_by: 'Department of Banking Regulation, RBI & AICTE',
    summary: 'Joint Reserve Bank of India notification instructing commercial banks that fixed deposits pledged jointly with AICTE cannot be encumbered for overdraft, working capital, or trust loans.',
    content: {
      ministry: 'RESERVE BANK OF INDIA & MINISTRY OF EDUCATION',
      bureau: 'DEPARTMENT OF BANKING REGULATION, CENTRAL OFFICE, MUMBAI',
      ref_no: 'RBI/2026-27/102 • AICTE/CO-ORD/03',
      date: '28th July 2026',
      subject: 'RESTRICTION ON EXTENSION OF CREDIT / OVERDRAFT FACILITIES AGAINST THIRD-PARTY REGULATORY FIXED DEPOSITS PLEDGED TO STATUTORY BODIES',
      addressee: 'To: All Commercial Banks, Co-operative Banks, and Small Finance Banks.',
      background: 'Audits by the Comptroller and Auditor General (CAG) revealed instances where branch managers allowed educational trusts to avail overdraft limits against Fixed Deposit Receipts held under joint lien with the All India Council for Technical Education.',
      statutory_directives: [
        'Strict Prohibition: No bank shall grant any loan, advance, overdraft facility, or bank guarantee against the security of deposits pledged to statutory regulators without prior written consent (NOC).',
        'Automated CBS Flagging: Core Banking Systems must block the collateral attachment module for all accounts bearing customer classification "AICTE Joint Pledge".',
        'Periodic Re-conciliation: Depository branches must quarterly confirm unencumbered status directly via the AICTE 3-Tier Bank Gateway webhook API.'
      ],
      penal_consequences: 'Non-compliance shall attract supervisory action against the errant depository bank under Section 47A of the Banking Regulation Act, 1949.',
      signatory_name: 'Shri R. Subramanian',
      signatory_designation: 'Executive Director, Reserve Bank of India',
      copy_to: [
        'Member Secretary, AICTE, New Delhi',
        'Indian Banks\' Association (IBA), Mumbai'
      ]
    }
  },
  {
    id: 'circ-2026-um-inst',
    circular_no: 'UM-AICTE-FDR-2026-v2',
    title: 'User Manual: Institution Nodal Officer Portal & E-Filing Walkthrough',
    date: '18 May 2026',
    category: 'USER_MANUAL',
    category_label: 'User Manual',
    file_size: '2.1 MB PDF',
    issued_by: 'Technical & E-Governance Cell, AICTE',
    summary: 'Comprehensive guide for colleges explaining document scanning specifications, Error Level Analysis (ELA) self-check, DAG renewal linking, and discharge NOC application.',
    content: {
      ministry: 'GOVERNMENT OF INDIA • MINISTRY OF EDUCATION',
      bureau: 'ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (E-GOVERNANCE DIVISION)',
      ref_no: 'UM-AICTE-FDR-2026-v2',
      date: '18th May 2026',
      subject: 'USER OPERATING MANUAL: INSTITUTION NODAL OFFICER WORKBENCH — DEPOSIT SUBMISSION, RENEWAL TRACKING, AND RELEASE, DISCHARGE, OR REFUND WORKFLOW',
      addressee: 'To: Registered Institutional Nodal Officers and System Administrators.',
      background: 'This manual outlines step-by-step operating procedures for technical institutions utilizing the AICTE FDR Regulatory Lifecycle Portal.',
      statutory_directives: [
        'Module 1 (Scan & Submission): Scan original bank receipts at 300+ DPI in RGB color. Ensure the AICTE joint holding clause and bank authorized sign-off stamp are clearly legible.',
        'Module 2 (Document Verification): Review the text extract, compound interest math check, and certificate verification results before final regulatory submission.',
        'Module 3 (Deposit History Linker): When an existing deposit completes 5 years, select the parent instrument and link the renewal child receipt to maintain unbroken 10-year tenure credit.',
        'Module 4 (Discharge & Public QR): Once Gate 1 to Gate 4 are approved, download and print the official No-Objection Certificate bearing the Member Secretary digital token.'
      ],
      signatory_name: 'Dr. Neeraj Saxena',
      signatory_designation: 'Advisor (Policy & Planning), AICTE',
      copy_to: [
        'AICTE Helpdesk & Nodal Officer Registry'
      ]
    }
  },
  {
    id: 'circ-2026-um-bank',
    circular_no: 'UM-AICTE-BANK-2026-v1',
    title: 'User Manual: Bank Branch Manager Zero-Login Attestation Guide',
    date: '22 Apr 2026',
    category: 'USER_MANUAL',
    category_label: 'User Manual',
    file_size: '1.8 MB PDF',
    issued_by: 'Banking Liaison Cell, AICTE',
    summary: 'Operational instructions for Bank Branch Managers explaining one-click cryptographic magic link access, 2FA OTP verification, CBS ledger balance attestation, and lien status entry.',
    content: {
      ministry: 'GOVERNMENT OF INDIA • MINISTRY OF EDUCATION',
      bureau: 'ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (BANKING LIAISON CELL)',
      ref_no: 'UM-AICTE-BANK-2026-v1',
      date: '22nd April 2026',
      subject: 'USER OPERATING MANUAL: ZERO-LOGIN CORE BANKING ATTESTATION MICRO-PORTAL FOR BRANCH MANAGERS',
      addressee: 'To: All Branch Managers and Operations Officers of Scheduled Commercial Banks.',
      background: 'Designed to eliminate traditional physical verification letters and postal delays, the Zero-Login Portal allows branch managers to verify deposits directly via authorized institutional domain email accounts.',
      statutory_directives: [
        'Magic Link Authentication: Click the single-use cryptographic token delivered to your official bank domain email address (e.g., @sbi.co.in, @canarabank.com).',
        'Two-Factor Verification: Enter the 6-digit SMS / Email OTP dispatched to the registered branch manager terminal.',
        'Core Banking Ledger Handshake: Review the claimed principal and compare with actual CBS balances. Mark lien status as ACTIVE_JOINT_AICTE or report LOAN_TAKEN_ENCUMBERED.',
        'Ledger Block Generation: Submitting the attestation automatically writes an unalterable SHA-256 block to the AICTE National Ledger.'
      ],
      signatory_name: 'Shri Balwinder Singh',
      signatory_designation: 'Director (Finance & Banking Liaison), AICTE',
      copy_to: [
        'Indian Banks\' Association (IBA) Secretariat',
        'State Level Bankers\' Committee (SLBC) Convenors'
      ]
    }
  }
];

interface CircularsAndManualsProps {
  onSelectCircular?: (circular: CircularItem) => void;
}

export const CircularsAndManuals: React.FC<CircularsAndManualsProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingCircular, setViewingCircular] = useState<CircularItem | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Filter circulars based on category & search query
  const filteredCirculars = CIRCULARS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = 
      item.circular_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.issued_by.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownloadSimulatedPdf = (circular: CircularItem) => {
    // Generate text/markdown downloadable representation of the official document
    const fileContent = `================================================================================
${circular.content.ministry}
${circular.content.bureau}
Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
================================================================================

REF NO: ${circular.content.ref_no}
DATE OF ISSUE: ${circular.content.date}

${circular.content.addressee}

SUBJECT: ${circular.content.subject}

1. BACKGROUND & STATUTORY CONTEXT:
${circular.content.background}

2. STATUTORY DIRECTIVES & MANDATES:
${circular.content.statutory_directives.map((dir, idx) => `   (${idx + 1}) ${dir}`).join('\n\n')}

${circular.content.penal_consequences ? `3. REGULATORY CONSEQUENCES & PENAL ACTIONS:\n${circular.content.penal_consequences}\n` : ''}

ISSUED WITH THE APPROVAL OF THE COMPETENT AUTHORITY.

(Digitally Signed)
${circular.content.signatory_name}
${circular.content.signatory_designation}
All India Council for Technical Education, New Delhi

COPY FORWARDED FOR FAVOR OF INFORMATION AND NECESSARY ACTION TO:
${circular.content.copy_to.map((c, i) => `   ${i + 1}. ${c}`).join('\n')}

================================================================================
AICTE Official Regulatory Archive Verification Key:
SHA-256: [e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855]
================================================================================`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${circular.circular_no.replace(/[/\\?%*:|"<>]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast(`Downloaded official publication: ${circular.circular_no}`);
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'CIRCULAR':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'SOP':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'APH_NORM':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'RBI_ADVISORY':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'USER_MANUAL':
        return 'bg-green-100 text-green-900 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div id="circulars-manuals-directory" className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-gray-300 rounded p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 mt-0.5 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  OFFICIAL REPOSITORY
                </span>
                <span className="text-xs font-bold text-gray-600">
                  Govt. of India • AICTE Regulatory Directives
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight mt-0.5">
                Official AICTE Circulars, Gazette Notifications & Operational Manuals
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-3xl">
                Authoritative repository of statutory regulations governing institutional fixed deposit receipts (FDRs), Core Banking System (CBS) lien obligations, 4-Gate release procedures, and portal user manuals.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>Official Publications:</span>
            <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {CIRCULARS_DATA.length} Available
            </span>
          </div>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccessToast && (
        <div className="p-3.5 rounded bg-green-50 border border-green-300 text-green-900 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>{downloadSuccessToast}</span>
          </div>
          <button onClick={() => setDownloadSuccessToast(null)} className="text-gray-500 hover:text-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Publications' },
            { id: 'CIRCULAR', label: 'Circulars' },
            { id: 'SOP', label: 'Statutory SOPs' },
            { id: 'APH_NORM', label: 'APH Norms' },
            { id: 'RBI_ADVISORY', label: 'RBI Joint Directives' },
            { id: 'USER_MANUAL', label: 'User Manuals' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search circulars, manual no., or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-900"
          />
        </div>
      </div>

      {/* Circulars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCirculars.map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded border border-gray-300 hover:border-gray-400 p-5 shadow-sm space-y-3 transition flex flex-col justify-between"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {item.circular_no}
                </span>
                <div className="flex items-center space-x-1.5">
                  {item.is_new && (
                    <span className="bg-orange-500 text-white font-bold text-[9px] uppercase px-1.5 py-0.5 rounded">
                      Latest
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadgeClass(item.category)}`}>
                    {item.category_label}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-gray-900 mt-2.5 leading-snug">
                {item.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Metadata & Actions */}
            <div className="pt-3 border-t border-gray-200 mt-2 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{item.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>{item.file_size}</span>
                </span>
                <span className="text-gray-700 font-medium truncate max-w-[150px]" title={item.issued_by}>
                  {item.issued_by}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => setViewingCircular(item)}
                  className="flex-1 py-1.5 px-3 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold border border-blue-200 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-900" />
                  <span>View Official Notification</span>
                </button>

                <button
                  onClick={() => handleDownloadSimulatedPdf(item)}
                  className="flex-1 py-1.5 px-3 rounded bg-[#1a365d] hover:bg-blue-900 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download Circular</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredCirculars.length === 0 && (
        <div className="p-8 text-center bg-white rounded border border-gray-300 text-xs text-gray-500">
          No circulars or manuals matching your search query.
        </div>
      )}

      {/* Official Government Publication Modal Viewer */}
      {viewingCircular && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-blue-900" />
                <span className="text-xs font-bold text-gray-900">
                  Official Gazette Publication Viewer: {viewingCircular.circular_no}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={() => handleDownloadSimulatedPdf(viewingCircular)}
                  className="px-2.5 py-1 bg-[#1a365d] hover:bg-blue-900 text-white text-xs rounded font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setViewingCircular(null)}
                  className="text-gray-500 hover:text-gray-800 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Parchment Body */}
            <div className="overflow-y-auto p-6 space-y-4 bg-[#fcfbf9] text-gray-900 font-serif select-text">
              
              {/* Official Letterhead */}
              <div className="text-center border-b-2 border-amber-900/30 pb-3 space-y-1">
                <div className="text-[10px] font-sans font-bold tracking-widest uppercase text-amber-900">
                  {viewingCircular.content.ministry}
                </div>
                <h3 className="text-base font-serif font-black uppercase text-gray-900 tracking-tight">
                  {viewingCircular.content.bureau}
                </h3>
                <div className="text-[10px] font-sans text-gray-700">
                  Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 • Website: www.aicte.gov.in
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-900 pt-2 border-t border-amber-900/20">
                  <span>REF NO: {viewingCircular.content.ref_no}</span>
                  <span>DATE: {viewingCircular.content.date}</span>
                </div>
              </div>

              {/* Addressee */}
              <div className="font-sans text-xs text-gray-800 font-medium">
                {viewingCircular.content.addressee}
              </div>

              {/* Subject */}
              <div className="font-sans font-bold text-xs bg-amber-50 border border-amber-200 p-2 rounded text-amber-950 uppercase leading-snug">
                SUB: {viewingCircular.content.subject}
              </div>

              {/* Background */}
              <div className="font-sans text-xs text-gray-800 space-y-2 leading-relaxed">
                <h4 className="font-bold text-gray-900 uppercase text-[11px] border-b border-gray-200 pb-1">
                  1. Background & Statutory Mandate
                </h4>
                <p>{viewingCircular.content.background}</p>
              </div>

              {/* Directives */}
              <div className="font-sans text-xs text-gray-800 space-y-2 leading-relaxed">
                <h4 className="font-bold text-gray-900 uppercase text-[11px] border-b border-gray-200 pb-1">
                  2. Regulatory Directives & Procedural Instructions
                </h4>
                <div className="space-y-1.5 pl-2">
                  {viewingCircular.content.statutory_directives.map((dir, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="font-bold text-blue-900">({idx + 1})</span>
                      <span>{dir}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Penalties if any */}
              {viewingCircular.content.penal_consequences && (
                <div className="font-sans text-xs text-red-950 bg-red-50 border border-red-200 p-2 rounded leading-relaxed">
                  <span className="font-bold block">3. Statutory Enforcement & Non-Compliance Actions:</span>
                  <span>{viewingCircular.content.penal_consequences}</span>
                </div>
              )}

              {/* Signatory */}
              <div className="pt-4 border-t border-gray-300 flex items-end justify-between font-sans text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Security Authentication</span>
                  <div className="flex items-center space-x-1.5 font-mono text-[10px] text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
                    <span>Cryptographically Authenticated Record</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-bold text-gray-900">{viewingCircular.content.signatory_name}</div>
                  <div className="text-[11px] text-gray-700">{viewingCircular.content.signatory_designation}</div>
                  <div className="text-[10px] text-gray-500">All India Council for Technical Education</div>
                </div>
              </div>

              {/* Copy To */}
              <div className="pt-2 border-t border-gray-200 font-sans text-[10px] text-gray-600 space-y-0.5">
                <span className="font-bold block uppercase text-gray-700">Copy to:</span>
                {viewingCircular.content.copy_to.map((item, idx) => (
                  <div key={idx}>{idx + 1}. {item}</div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};