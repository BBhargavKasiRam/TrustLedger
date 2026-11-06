export interface PortalSubPage {
  slug: string;
  sectionId: string;
  sectionTitle: string;
  path: string;
  title: string;
  subtitle: string;
  badge: string;
  updatedDate: string;
  statutoryRef: string;
  overview: string;
  keyPrinciples: Array<{ title: string; desc: string }>;
  sections?: Array<{
    title: string;
    content: string;
    bulletPoints?: string[];
    highlightBox?: string;
  }>;
  metrics?: Array<{ label: string; value: string; detail: string }>;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  faq?: Array<{ q: string; a: string }>;
}

export interface PortalSection {
  id: string;
  title: string;
  path: string;
  description: string;
  badge?: string;
  subPages: PortalSubPage[];
}

export const PORTAL_SECTIONS_DATA: PortalSection[] = [
  // -------------------------------------------------------------------------
  // 1. ABOUT US
  // -------------------------------------------------------------------------
  {
    id: 'about-us',
    title: 'About Us',
    path: '/about-us',
    description: 'Statutory mandate, regulatory foundation, leadership hierarchy, and operational framework governing technical institutions across India.',
    subPages: [
      {
        slug: 'overview',
        sectionId: 'about-us',
        sectionTitle: 'About Us',
        path: '/about-us/overview',
        title: 'Overview & Council Mandate',
        subtitle: 'Apex national authority for planning, formulation, and maintenance of norms and standards in technical education.',
        badge: 'PARLIAMENT ACT 1987',
        updatedDate: 'October 2026',
        statutoryRef: 'AICTE Act No. 52 of 1987 • Section 10 & 11',
        overview: 'The All India Council for Technical Education (AICTE) was established to ensure coordinated and integrated development of technical education in India. Under the Approval Process Handbook (APH 2026–31), the Regulation Bureau operates the VidyaKosh centralized fixed deposit registry to safeguard student cohort lifecycles and ensure institutional financial solvency.',
        keyPrinciples: [
          { title: 'Statutory Governance', desc: 'Prescribes mandatory minimum standards and financial solvency benchmarks for degree and diploma engineering institutions.' },
          { title: 'Cohort Lifecycle Surety', desc: 'Enforces mandatory 8–10 year lock-in security deposits pledged jointly in favor of the Regulatory Council.' },
          { title: 'Zero Physical Paper Fraud', desc: 'Transitions all physical deposit paper slips into tokenized, CBS-attested digital receipts.' },
          { title: 'Unified Single Window', desc: 'Synchronizes approvals with the National Single Window System (NSWS) and Jan Parichay SSO.' }
        ],
        sections: [
          {
            title: 'Foundational Mission of VidyaKosh',
            content: 'VidyaKosh operates as the central digital depository engine for all statutory institutional fixed deposit receipts (FDRs) mandated by AICTE. Historically, paper-based deposits were prone to unauthorized premature encashment, non-marking of joint liens, and forgery. VidyaKosh establishes a tamper-proof Tri-Party Dual-Truth verification protocol between the Institution, the Scheduled Commercial Bank, and the AICTE Council.',
            bulletPoints: [
              'Mandatory joint hypothecation in favor of Member Secretary / Regional Officer, AICTE.',
              'Automated T-90, T-60, and T-30 maturity tracking with proactive renewal notices to College Principals.',
              'SHA-256 cryptographic immutability preventing unauthorized modification or administrative overrides.',
              'Integrated clearance for Annual Extension of Approval (EoA) and Defaulter Registry enforcement.'
            ]
          },
          {
            title: 'Statutory Authority & Powers',
            content: 'Under Section 10(1) of the AICTE Act 1987, the Council is empowered to regulate technical institutions and prescribe guidelines for initial establishment, intake variation, and program expansion.',
            highlightBox: 'Clause 4.14 APH 2026-31: Non-maintenance of continuous FDR lock-in or failure to provide CBS bank attestation shall trigger immediate soft-hold on annual admissions and Extension of Approval.'
          }
        ],
        metrics: [
          { label: 'Technical Institutions Governed', value: '10,800+', detail: 'Pan-India approved colleges' },
          { label: 'Active e-FDR Instruments', value: '42,500+', detail: 'Under continuous council lien' },
          { label: 'Total Statutory Surety Corpus', value: '₹14,200+ Cr', detail: 'Protected across commercial banks' }
        ],
        faq: [
          { q: 'Why is an institutional security deposit mandatory for technical colleges?', a: 'Under the Approval Process Handbook, security deposits ensure financial continuity so that even in case of sudden institutional closure or disciplinary action, students can complete their 4-year degree without disruption.' },
          { q: 'How does VidyaKosh prevent fraudulent FDR submissions?', a: 'VidyaKosh uses OpenCV Error-Level Analysis (ELA) for forgery detection, mathematical compound interest validation, and direct Core Banking System (CBS) two-factor OTP attestation from the bank manager.' }
        ]
      },
      {
        slug: 'leadership',
        sectionId: 'about-us',
        sectionTitle: 'About Us',
        path: '/about-us/leadership',
        title: 'Organization & Leadership Structure',
        subtitle: 'Executive Council, Member Secretary Secretariat, and Regional Bureau Directors.',
        badge: 'EXECUTIVE DIRECTORY',
        updatedDate: 'November 2026',
        statutoryRef: 'Statutory Body Notification • AICTE New Delhi',
        overview: 'AICTE is steered by eminent academics, technocrats, and senior government administrators. The Council operates through specialized Functional Bureaus and Regional Offices across North, West, South, and East India.',
        keyPrinciples: [
          { title: 'Chairman', desc: 'Apex academic and administrative executive guiding national policy and technical curriculum modernization.' },
          { title: 'Vice Chairman', desc: 'Oversees academic accreditation standards, faculty development, and international technical partnerships.' },
          { title: 'Member Secretary', desc: 'Chief Executive Officer supervising statutory approvals, legal enforcement, and the VidyaKosh regulatory vault.' },
          { title: 'Bureau Advisers', desc: 'Senior directors heading Regulation, Approval, Policy, Finance, and Institutional Development.' }
        ],
        sections: [
          {
            title: 'Council Administrative Hierarchy',
            content: 'The decision-making hierarchy operates under a four-tier scrutiny system. All statutory release clearances, penal lien forfeitures, and policy adjustments undergo comprehensive digital clearance.',
            bulletPoints: [
              'Governing Executive Council: Apex statutory committee ratifying policies and handbook amendments.',
              'Regulation Bureau: Daily management of institutional approvals, deficiency notices, and e-FDR registries.',
              'Regional Offices: Regional desks coordinating with State Technical Education Boards and State Governments.',
              'Digital Oversight Committee: Cryptographic audit of ledger transactions, DSC keys, and CBS webhooks.'
            ]
          }
        ],
        tableData: {
          headers: ['Designation / Office', 'Statutory Authority', 'Key Operational Bureau', 'Location'],
          rows: [
            ['Chairman, AICTE', 'Apex Council Leadership', 'National Executive Council', 'New Delhi Headquarters'],
            ['Member Secretary', 'Chief Executive & Legal DSC Authority', 'Secretariat & Regulatory Vault', 'New Delhi Headquarters'],
            ['Adviser (Regulation Bureau)', 'Approval & Deposit Scrutiny', 'Regulation & Approval Bureau', 'New Delhi Headquarters'],
            ['Regional Officers (ROs)', 'Joint Lien Signatories', 'North / West / South Regional Cells', 'Regional Hubs (Kanpur, Mumbai, Bangalore, Kolkata)']
          ]
        }
      },
      {
        slug: 'acts-regulations',
        sectionId: 'about-us',
        sectionTitle: 'About Us',
        path: '/about-us/acts-regulations',
        title: 'Act, Statutes & Central Regulations',
        subtitle: 'Legislative acts of Parliament, statutory notifications, and Approval Process Handbook legal framework.',
        badge: 'LEGISLATIVE MANDATE',
        updatedDate: 'October 2026',
        statutoryRef: 'The Gazette of India • Extraordinary Part II',
        overview: 'Comprehensive legal archive of Parliamentary enactments, statutory amendments, and Central Government gazette regulations underpinning AICTE authority to inspect institutions, mandate security deposits, and enforce regulatory discipline.',
        keyPrinciples: [
          { title: 'AICTE Act No. 52 of 1987', desc: 'Parliamentary statute granting autonomous powers to coordinate and maintain technical education quality.' },
          { title: 'APH Regulations 2026-31', desc: 'Five-year statutory handbook outlining approval norms, faculty-student ratios, and deposit matrices.' },
          { title: 'PGRC Regulations 2019', desc: 'Establishment of Public Grievance Redressal Committees with financial lien enforcement for defaulters.' },
          { title: 'Digital Signature Act (IT Act 2000)', desc: 'Validates Class-3 Digital Signature Certificates (DSC) for paperless statutory release NOCs.' }
        ],
        sections: [
          {
            title: 'Key Statutory Clauses Governing Fixed Deposits',
            content: 'Institutions seeking initial establishment or expansion are bound by mandatory legal clauses codified in Chapter IV of the handbook:',
            bulletPoints: [
              'Section 10(k): Grants power to grant approvals for starting new technical institutions and for introducing new courses.',
              'Section 10(n): Empowers inspection of institutions to verify financial and infrastructural commitments.',
              'Clause 4.12: Dictates that security deposits must remain unencumbered, without any third-party overdraft or credit claims.',
              'Clause 4.21: Prescribes automatic council forfeiture of deposit proceeds in cases of willful closure without student rehabilitation.'
            ]
          }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 2. NEWSROOM
  // -------------------------------------------------------------------------
  {
    id: 'newsroom',
    title: 'NewsRoom',
    path: '/newsroom',
    description: 'Real-time regulatory announcements, ministry press releases, calendar schedules, and media publications.',
    subPages: [
      {
        slug: 'announcements',
        sectionId: 'newsroom',
        sectionTitle: 'NewsRoom',
        path: '/newsroom/announcements',
        title: 'Official Council Announcements',
        subtitle: 'Live regulatory notices, academic calendar releases, and institutional deadlines.',
        badge: 'LIVE BULLETINS',
        updatedDate: 'November 2026',
        statutoryRef: 'Press Bureau AICTE • PR-2026/89',
        overview: 'Official broadcast center for public notices, calendar timelines, and urgent directives issued by the Chairman and Member Secretary to technical colleges, universities, and polytechnics across India.',
        keyPrinciples: [
          { title: 'Real-Time Broadcast', desc: 'Zero-latency transmission of circulars directly to college nodal officers and university registrars.' },
          { title: 'Cryptographic Signing', desc: 'Every announcement is cryptographically signed and verifiable against AICTE official public keys.' },
          { title: 'Compliance Timelines', desc: 'Clearly defined statutory cutoff dates for Extension of Approval (EoA) and deposit renewal.' }
        ],
        sections: [
          {
            title: 'Recent Official Directives',
            content: 'The Council has mandated 100% digital onboarding of institutional fixed deposits to prevent delays during annual Extension of Approval (EoA) cycles.',
            bulletPoints: [
              'Mandatory CBS Lien Attestation Deadline: Scheduled Commercial Banks must verify joint liens by 30th November 2026.',
              'Notification on Soft-Hold Imposition: Automated system soft-hold to apply to non-compliant institutions approaching maturity without renewal.',
              'Release of Model Curriculum 2026: AI & Cyber-Physical Systems integration across all undergraduate technical disciplines.'
            ]
          }
        ]
      },
      {
        slug: 'notices',
        sectionId: 'newsroom',
        sectionTitle: 'NewsRoom',
        path: '/newsroom/notices',
        title: 'Regulatory Notices & Press Releases',
        subtitle: 'Official gazette circulars, public alerts, and ministry press releases.',
        badge: 'PRESS ARCHIVE',
        updatedDate: 'October 2026',
        statutoryRef: 'Ministry of Education • Press Information Bureau',
        overview: 'Public notifications issued to ensure transparency in institutional accreditation, fee regulations, anti-ragging measures, and financial solvency requirements.',
        keyPrinciples: [
          { title: 'Public Transparency', desc: 'Allows parents, students, and recruiters to inspect official institutional compliance records.' },
          { title: 'Anti-Defaulter Warnings', desc: 'Publishes lists of unapproved or defaulted institutions to protect student interests.' }
        ],
        sections: [
          {
            title: 'Consumer & Student Protection Notices',
            content: 'Notice is hereby given to all aspiring engineering and management candidates to verify institutional PID and deposit solvency on VidyaKosh prior to payment of admission fees.',
            bulletPoints: [
              'Caution against fake approval claims and non-accredited off-campus extension centers.',
              'Enforcement of 100% fee refund rules for cancellations within statutory windows.',
              'Zero-tolerance policy on delayed faculty salary disbursements backed by institutional lien recovery.'
            ]
          }
        ]
      },
      {
        slug: 'media',
        sectionId: 'newsroom',
        sectionTitle: 'NewsRoom',
        path: '/newsroom/media',
        title: 'Media Gallery & Audio-Visual Archive',
        subtitle: 'Speeches, national conferences, technical summits, and instructional video guides.',
        badge: 'MULTIMEDIA VAULT',
        updatedDate: 'November 2026',
        statutoryRef: 'Media Bureau • AICTE New Delhi',
        overview: 'Audio-visual depository featuring key addresses by the Union Education Minister, AICTE Chairman, and Bureau Advisers, along with step-by-step user onboarding tutorials for the VidyaKosh platform.',
        keyPrinciples: [
          { title: 'Tutorial Walkthroughs', desc: 'Video guides demonstrating how Bank Managers complete CBS attestation in under 2 minutes.' },
          { title: 'National Conclaves', desc: 'Recorded proceedings of Vice Chancellors and Directors conclaves on National Education Policy.' }
        ],
        sections: [
          {
            title: 'Instructional Media Resources',
            content: 'Nodal officers and college accountants can access video walk-throughs covering:',
            bulletPoints: [
              'Step-by-step guide to generating FDR submission drafts and PDF receipt uploading.',
              'How to verify genuine Digital Signature Certificates (DSC) on release certificates.',
              'Overcoming common Core Banking system IFSC and hypothecation code mapping errors.'
            ]
          }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 3. BUREAUS / CELL
  // -------------------------------------------------------------------------
  {
    id: 'bureaus',
    title: 'Bureaus/Cell',
    path: '/bureaus',
    description: 'Executive functional divisions managing approvals, statutory scrutiny, finance, curriculum planning, and institutional development.',
    badge: 'CORE EXECUTIVE',
    subPages: [
      {
        slug: 'regulation',
        sectionId: 'bureaus',
        sectionTitle: 'Bureaus/Cell',
        path: '/bureaus/regulation',
        title: 'Regulation & Approval Bureau',
        subtitle: 'Apex functional bureau responsible for statutory approvals, e-FDR compliance, and disciplinary oversight.',
        badge: 'PRIMARY BUREAU',
        updatedDate: 'November 2026',
        statutoryRef: 'Regulation Bureau Mandate • APH 2026-31 Chapter I-IV',
        overview: 'The Regulation Bureau is the central governing spine of technical education approvals in India. It oversees institutional establishment, intake expansion, mandatory FDR security deposits, and the enforcement of the Approval Process Handbook.',
        keyPrinciples: [
          { title: 'Approval Processing', desc: 'Multi-stage scrutiny of institutional applications, land title deeds, and infrastructural readiness.' },
          { title: 'VidyaKosh Management', desc: 'Daily operational ownership of the institutional e-FDR depository and CBS attestation pipeline.' },
          { title: 'Defaulter Monitoring', desc: 'Automatic cross-referencing of pending student PGRC dues and salary defaults against security deposits.' },
          { title: 'Regional Harmonization', desc: 'Synchronizes compliance mandates across Kanpur, Mumbai, Bangalore, Kolkata, and regional cells.' }
        ],
        sections: [
          {
            title: 'Core Bureau Mandate & Workflows',
            content: 'The Regulation Bureau processes thousands of institutional filings annually. Under the VidyaKosh framework, the bureau utilizes automated forensic inspection desks to eliminate paper processing delays.',
            bulletPoints: [
              'Dual-Truth Scrutiny: Independent cross-verification between College Claim and Bank Attested Truth.',
              'Forensic Error-Level Analysis (ELA): Instant detection of altered maturity dates or edited principal figures.',
              '4-Gate DSC Release Workbench: Cryptographic four-layer sign-off before any security deposit is discharged.'
            ]
          }
        ],
        metrics: [
          { label: 'Scrutiny Queue Throughput', value: '450+ Daily', detail: 'Automated AI assisted verifications' },
          { label: 'Lien Attestation Rate', value: '98.4%', detail: 'Scheduled Commercial Banks' },
          { label: 'Fraud Detection Accuracy', value: '99.8%', detail: 'Computer vision forensic engine' }
        ]
      },
      {
        slug: 'policy-planning',
        sectionId: 'bureaus',
        sectionTitle: 'Bureaus/Cell',
        path: '/bureaus/policy-planning',
        title: 'Policy & Academic Planning Bureau',
        subtitle: 'Curriculum design, credit transfer frameworks, and National Education Policy alignment.',
        badge: 'POLICY DIVISION',
        updatedDate: 'October 2026',
        statutoryRef: 'NEP 2020 Implementation Framework • AICTE',
        overview: 'Formulates forward-looking educational policies, interdisciplinary degree frameworks, vocational credit mobility, and faculty qualification standards to keep Indian technical graduates globally competitive.',
        keyPrinciples: [
          { title: 'National Credit Framework (NCrF)', desc: 'Seamless credit accumulation and transfer across diploma, degree, and apprenticeship tracks.' },
          { title: 'Emerging Technologies', desc: 'Designing model syllabus for Quantum Computing, Semiconductor Fabrication, and Robotics.' }
        ],
        sections: [
          {
            title: 'Academic Modernization Mandate',
            content: 'The bureau works in close concordance with the Regulation Bureau to ensure colleges possess adequate financial stability (backed by their security deposits) before approving high-capital advanced technology laboratories.',
            bulletPoints: [
              'Mandatory industry internships credit recognition.',
              'Encouragement of multidisciplinary minor degrees in Artificial Intelligence for core branches.',
              'Accreditation readiness guidelines and National Board of Accreditation (NBA) roadmap.'
            ]
          }
        ]
      },
      {
        slug: 'finance',
        sectionId: 'bureaus',
        sectionTitle: 'Bureaus/Cell',
        path: '/bureaus/finance',
        title: 'Finance & Accounts Bureau',
        subtitle: 'National corpus management, institutional grant disbursements, and audit reconciliations.',
        badge: 'FINANCIAL GOVERNANCE',
        updatedDate: 'November 2026',
        statutoryRef: 'Comptroller & Auditor General (CAG) Guidelines',
        overview: 'Manages financial allocations, government budgetary grants, developmental funding for technical institutes, and annual audit reconciliations with scheduled commercial banks.',
        keyPrinciples: [
          { title: 'Fiscal Transparency', desc: 'Zero manual cash transactions; 100% digital treasury integration with the Public Financial Management System (PFMS).' },
          { title: 'Bank Reconciliation', desc: 'Automated daily reconciliation of hypothecated FDR certificates held with commercial banks.' }
        ],
        sections: [
          {
            title: 'Depository Lien Reconciliation',
            content: 'The Finance Bureau continuously tracks hypothecation interest accrual models to ensure colleges do not draw premature credit or loans against fixed deposits pledged to the Council.',
            bulletPoints: [
              'Automated verification that interest accruals remain compounding with the principal.',
              'PFMS integration for instant release and direct benefit disbursement.',
              'Statutory reporting to the Ministry of Finance and Comptroller & Auditor General (CAG).'
            ]
          }
        ]
      },
      {
        slug: 'institutional-dev',
        sectionId: 'bureaus',
        sectionTitle: 'Bureaus/Cell',
        path: '/bureaus/institutional-dev',
        title: 'Institutional Development Bureau',
        subtitle: 'Campus infrastructure grants, modernization schemes, and rural polytechnic upgrades.',
        badge: 'INFRASTRUCTURE DIVISION',
        updatedDate: 'October 2026',
        statutoryRef: 'MODROBS & Institutional Grant Guidelines',
        overview: 'Drives infrastructural modernization across technical colleges with special focus on backward regions, aspirational districts, and specialized state polytechnic institutes.',
        keyPrinciples: [
          { title: 'MODROBS Scheme', desc: 'Modernization and Removal of Obsolescence in laboratory machinery and computing assets.' },
          { title: 'Rural Campus Support', desc: 'Targeted capital grants to upgrade rural polytechnic colleges to high-speed digital connectivity.' }
        ],
        sections: [
          {
            title: 'Infrastructure Assurance',
            content: 'Ensures that every sanctioned technical seat corresponds to accredited laboratories, fire safety equipment, and barrier-free access for differently-abled students.',
            bulletPoints: [
              'Mandatory environmental and green campus audits.',
              'Smart campus micro-grid and renewable solar installations.',
              'High-bandwidth NKN (National Knowledge Network) connectivity.'
            ]
          }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 4. INITIATIVES
  // -------------------------------------------------------------------------
  {
    id: 'initiatives',
    title: 'Initiatives',
    path: '/initiatives',
    description: 'Flagship digital governance platforms: VidyaKosh e-FDR Depository, CBS Bank Attestation, and Unified SSO.',
    badge: 'FLAGSHIP TECH',
    subPages: [
      {
        slug: 'vidyakosh',
        sectionId: 'initiatives',
        sectionTitle: 'Initiatives',
        path: '/initiatives/vidyakosh',
        title: 'VidyaKosh Centralized e-FDR Depository',
        subtitle: 'Cryptographic tokenization, real-time lifecycle tracking, and tripartite ledger management.',
        badge: 'FLAGSHIP PLATFORM',
        updatedDate: 'November 2026',
        statutoryRef: 'AICTE Digital Vault Initiative • TrustLedger Core Engine',
        overview: 'VidyaKosh is the Council flagship technology platform that replaces physical fixed deposit paper certificates with tokenized cryptographic ledger records, ensuring zero premature forfeiture, zero paper fraud, and automated statutory compliance.',
        keyPrinciples: [
          { title: 'Tri-Party Dual-Truth', desc: 'Separates Institute Claim from Vision AI Forensics from Bank Attested Truth for 100% audit integrity.' },
          { title: 'OpenCV ELA Forensics', desc: 'Instant perceptual hash collision detection, quarterly compound math audits, and pixel error-level checks.' },
          { title: 'Automated SLA Watchdog', desc: 'Background cron tracking T-90, T-60, and T-30 maturity dates with automated warning dispatch.' },
          { title: 'Paperless 4-Gate Release', desc: 'Digital Signature Certificate (DSC) sign-off generating QR-verifiable regulatory discharge NOCs.' }
        ],
        sections: [
          {
            title: 'Why VidyaKosh Was Engineered',
            content: 'Prior to VidyaKosh, verifying physical fixed deposit receipts across 10,000+ colleges required mailing physical paper slips to thousands of bank branches. This created massive verification backlogs, vulnerability to forged fake certificates, and risks of colleges encashing deposits without AICTE clearance.',
            bulletPoints: [
              'Zero physical paper mailings between banks and AICTE regional offices.',
              'Direct Core Banking verification in less than 2 minutes via automated tokenized links.',
              'Instant public verification desk enabling any student or employer to verify genuine NOC certificates.'
            ]
          }
        ],
        metrics: [
          { label: 'Average Verification Time', value: '1.8 Minutes', detail: 'Reduced from 45 days paper turnaround' },
          { label: 'Paper Elimination', value: '100% Paperless', detail: 'Over 2.5 million pages saved annually' },
          { label: 'CBS Bank Integrations', value: '38 Scheduled Banks', detail: 'Public & Private sector coverage' }
        ]
      },
      {
        slug: 'cbs-attestation',
        sectionId: 'initiatives',
        sectionTitle: 'Initiatives',
        path: '/initiatives/cbs-attestation',
        title: 'Core Banking (CBS) Attestation Engine',
        subtitle: 'Secure two-factor bank branch manager attestation portal with RBI joint lien hypothecation codes.',
        badge: 'BANKING GATEWAY',
        updatedDate: 'November 2026',
        statutoryRef: 'RBI Core Banking Lien Guidelines • Circular 2026/04',
        overview: 'The CBS Attestation Engine connects Scheduled Commercial Banks directly into the AICTE regulatory depository. Bank Branch Managers verify customer account numbers, deposit amounts, and lock-in periods without needing login credentials through secure two-factor authenticated sessions.',
        keyPrinciples: [
          { title: 'Zero-Login Secure Tokens', desc: 'Bank Managers receive encrypted, time-bound verification requests to attest fixed deposits.' },
          { title: 'CBS Hypothecation Codes', desc: 'Matches internal bank CBS lien codes (e.g., JOINT_LIEN_TECH_DEGREE_10Y) directly with handbook norms.' },
          { title: 'Dual-Factor Authentication', desc: 'Protected by official bank branch manager email and mobile SMS one-time passwords.' }
        ],
        sections: [
          {
            title: 'Bank Manager Attestation Procedure',
            content: 'Branch Managers verify that the deposit has been marked with a joint lien in favor of AICTE, the auto-renewal clause is activated, and no loans have been disbursed against the corpus.',
            bulletPoints: [
              'Confirmation of deposit instrument number and opening balance.',
              'Affirmation that lien is entered into the bank core banking database (Finacle / BaNCS / Flexcube).',
              'Generation of cryptographic SHA-256 attestation signature logged to the national ledger.'
            ]
          }
        ]
      },
      {
        slug: 'jan-parichay',
        sectionId: 'initiatives',
        sectionTitle: 'Initiatives',
        path: '/initiatives/jan-parichay',
        title: 'Jan Parichay Unified Single Sign-On (SSO)',
        subtitle: 'National Single Window System (NSWS) identity gateway for colleges, officers, and authorities.',
        badge: 'NATIONAL SSO',
        updatedDate: 'October 2026',
        statutoryRef: 'National Single Window System (NSWS) • MeitY Standard',
        overview: 'Integrated single sign-on architecture aligning VidyaKosh with the Government of India National Single Window System (NSWS) and Jan Parichay identity infrastructure, enforcing role-based access control across all stakeholders.',
        keyPrinciples: [
          { title: 'Role-Based Authorization', desc: 'Strict data isolation between College Nodal Officers, Scrutiny Officers, Competent Authority, and Bank Managers.' },
          { title: 'PID Multi-Tenant Isolation', desc: 'Institutions can strictly view and edit only their own permanent institution records.' },
          { title: 'Government Security Standards', desc: 'Compliant with GIGW 3.0, CERT-In cybersecurity benchmarks, and UX4G accessibility standards.' }
        ],
        sections: [
          {
            title: 'Authentication Tiers & Access Levels',
            content: 'Jan Parichay provides granular privilege separation to maintain the integrity of institutional claims and council approvals:',
            bulletPoints: [
              'College Nodal Officer: Can register new FDRs, initiate renewal workflows, and track application status.',
              'AICTE Scrutiny Officer: Has read-write access to discrepancy marking, document forensics, and bank verification dispatch.',
              'Competent Authority (Member Secretary): Holds cryptographic DSC key to sign and issue regulatory release NOCs.'
            ]
          }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 5. SCHEMES
  // -------------------------------------------------------------------------
  {
    id: 'schemes',
    title: 'Schemes',
    path: '/schemes',
    description: 'Statutory approval schemes, Extension of Approval (EoA) protocols, and research modernization grants.',
    badge: 'REGULATORY SCHEMES',
    subPages: [
      {
        slug: 'institutional-deposits',
        sectionId: 'schemes',
        sectionTitle: 'Schemes',
        path: '/schemes/institutional-deposits',
        title: 'Statutory Institutional Deposits (e-FDR) Scheme',
        subtitle: 'Mandatory financial security framework under Approval Process Handbook Chapter IV.',
        badge: 'APH 2026-31 MANDATE',
        updatedDate: 'November 2026',
        statutoryRef: 'APH 2026-31 • Chapter IV Security Norms',
        overview: 'The Statutory Institutional Deposit Scheme governs the creation, hypothecation, and continuous lock-in of financial fixed deposit receipts required from trusts and societies establishing technical education institutions in India.',
        keyPrinciples: [
          { title: 'Discipline-Specific Norms', desc: 'Deposit thresholds scaled according to capital intensity: ₹35 Lakhs for Engineering, ₹15 Lakhs for Management, etc.' },
          { title: 'Continuous 8-10 Year Lock-In', desc: 'Deposits must remain unbroken and auto-renewing until formal council discharge.' },
          { title: 'Joint Council Hypothecation', desc: 'Held strictly in joint names with the Regional Officer / Member Secretary, AICTE.' }
        ],
        sections: [
          {
            title: 'Direct Link to Chapter IV Breakdown',
            content: 'For an itemized calculator, statutory rationale, and comparative discipline tables, navigate to the dedicated handbook guide:',
            bulletPoints: [
              'Detailed analysis of 10-year engineering degree requirements versus 8-year MCA requirements.',
              'Clauses governing partial release, course closure refunds, and bank merger certificates.',
              'Zero premature encashment conditions and penalty calculation rubrics.'
            ]
          }
        ]
      },
      {
        slug: 'extension-of-approval',
        sectionId: 'schemes',
        sectionTitle: 'Schemes',
        path: '/schemes/extension-of-approval',
        title: 'Extension of Approval (EoA) Scheme',
        subtitle: 'Annual approval renewals, intake adjustments, and regulatory soft-hold mechanisms.',
        badge: 'ANNUAL APPROVAL',
        updatedDate: 'October 2026',
        statutoryRef: 'APH Chapter II • Annual EoA Regulations',
        overview: 'Governs the annual renewal of approvals for existing technical institutions. Institutions maintaining compliant e-FDR status receive instant automated clearance, while defaulted colleges are subjected to regulatory soft-holds.',
        keyPrinciples: [
          { title: 'Automated EoA Clearance', desc: 'Institutions with valid, non-expired e-FDRs receive automatic green-channel clearance.' },
          { title: 'Regulatory Soft-Hold', desc: 'Institutions whose deposits are expired or approaching maturity without renewal are blocked from intake expansion.' }
        ],
        sections: [
          {
            title: 'Soft-Hold Remediation Workflow',
            content: 'When an institution is flagged with an expired security deposit, a regulatory soft-hold is placed on their annual intake:',
            bulletPoints: [
              'T-90 to T-30 countdown notices dispatched via SMS and email to the College Principal.',
              'Renewal workflow unlocked in VidyaKosh to submit renewed deposit certificates without penalty.',
              'Instant lift of soft-hold upon receipt of Bank Branch Manager CBS attestation.'
            ]
          }
        ]
      },
      {
        slug: 'modernization-grants',
        sectionId: 'schemes',
        sectionTitle: 'Schemes',
        path: '/schemes/modernization-grants',
        title: 'Modernization & Lab R&D Schemes',
        subtitle: 'Financial grants for industry 4.0 laboratory upgrades, patent filings, and faculty research.',
        badge: 'DEVELOPMENT GRANTS',
        updatedDate: 'November 2026',
        statutoryRef: 'AICTE R&D Support Guidelines',
        overview: 'Special institutional assistance schemes providing direct non-refundable capital grants to colleges in good standing for establishing state-of-the-art incubation centers and research labs.',
        keyPrinciples: [
          { title: 'MODROBS Capital Support', desc: 'Up to ₹20 Lakhs funding for upgrading obsolescent laboratory equipment in engineering colleges.' },
          { title: 'Patent Commercialization', desc: 'Reimbursement of patent application fees for student and faculty innovators.' }
        ],
        sections: [
          {
            title: 'Eligibility Concordance',
            content: 'Only institutions maintaining 100% compliant security deposit records on VidyaKosh and zero student PGRC defaults are eligible to apply for developmental grants.',
            bulletPoints: [
              'Clean audit ledger record for past 3 consecutive academic years.',
              'Accreditation by NBA in at least 50% eligible technical courses.',
              'Active core banking joint lien verified by the Regulation Bureau.'
            ]
          }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 6. EDUCATION
  // -------------------------------------------------------------------------
  {
    id: 'education',
    title: 'Education',
    path: '/education',
    description: 'Technical education standards, approved degree programs, curriculum guidelines, and vocational tracks.',
    subPages: [
      {
        slug: 'programmes',
        sectionId: 'education',
        sectionTitle: 'Education',
        path: '/education/programmes',
        title: 'Approved Programmes & Degree Tiers',
        subtitle: 'Directory of recognized undergraduate, postgraduate, and diploma technical disciplines.',
        badge: 'ACADEMIC TIERS',
        updatedDate: 'November 2026',
        statutoryRef: 'AICTE Approved Program Directory 2026',
        overview: 'Comprehensive classification of all technical education disciplines recognized under Indian law, detailing statutory duration, entry qualifications, and capital infrastructure requirements.',
        keyPrinciples: [
          { title: 'Undergraduate Degree', desc: '4-Year Bachelor of Technology (B.Tech / B.E.) programs with mandatory core lab infrastructure.' },
          { title: 'Postgraduate Degree', desc: '2-Year Master of Technology (M.Tech), MBA, and MCA specialized professional degrees.' },
          { title: 'Polytechnic Diploma', desc: '3-Year engineering and technical diploma tracks producing foundational frontline engineers.' }
        ],
        sections: [
          {
            title: 'Discipline Tiers & Deposit Mapping',
            content: 'The statutory security deposit required from an institution is directly derived from its program tier:',
            bulletPoints: [
              'Engineering Degree: ₹35 Lakhs deposit norm reflecting high laboratory machinery capital assets.',
              'Management (MBA/PGDM): ₹15 Lakhs deposit norm reflecting professional library and seminar infrastructure.',
              'Pharmacy (B.Pharm): ₹15 Lakhs deposit norm backed by Pharmacy Council of India guidelines.',
              'Polytechnic Diploma: ₹15 Lakhs deposit norm ensuring grassroots vocational student protection.'
            ]
          }
        ],
        tableData: {
          headers: ['Discipline Tier', 'Program Level', 'Statutory Tenure', 'Deposit Norm (10Y Lock-In)'],
          rows: [
            ['Engineering & Technology', 'Undergraduate Degree (B.Tech)', '4 Years', '₹35.0 Lakhs'],
            ['Management', 'Postgraduate (MBA / PGDM)', '2 Years', '₹15.0 Lakhs'],
            ['Pharmacy', 'Undergraduate Degree (B.Pharm)', '4 Years', '₹15.0 Lakhs'],
            ['Computer Applications (MCA)', 'Postgraduate Degree (MCA)', '2 Years', '₹15.0 Lakhs'],
            ['Diploma Polytechnic', 'Undergraduate Diploma', '3 Years', '₹15.0 Lakhs'],
            ['Hotel Management & Catering', 'Degree & Diploma', '3-4 Years', '₹10.0 Lakhs']
          ]
        }
      },
      {
        slug: 'curriculum',
        sectionId: 'education',
        sectionTitle: 'Education',
        path: '/education/curriculum',
        title: 'Model Curriculum & Credit Framework',
        subtitle: 'Outcome-based engineering education, credit mobility, and industry skill integration.',
        badge: 'MODEL SYLLABUS',
        updatedDate: 'October 2026',
        statutoryRef: 'National Model Curriculum 2026',
        overview: 'Standardized model syllabus templates formulated by joint academic and industry committees to eliminate obsolete coursework and introduce experiential project-based engineering pedagogy.',
        keyPrinciples: [
          { title: 'Outcome-Based Education (OBE)', desc: 'Focuses on demonstrable student graduate attributes and measurable engineering competencies.' },
          { title: 'Industry 4.0 Modules', desc: 'Mandatory inclusion of Data Science, Cyber Security, Cloud Architecture, and IoT fundamentals.' }
        ],
        sections: [
          {
            title: 'Credit Mobility Architecture',
            content: 'Students can earn up to 40% of their program credits through verified online courses on the SWAYAM national MOOC portal, recognized by all AICTE affiliate universities.'
          }
        ]
      },
      {
        slug: 'vocational',
        sectionId: 'education',
        sectionTitle: 'Education',
        path: '/education/vocational',
        title: 'Vocational & Polytechnic Skill Education',
        subtitle: 'Community colleges, vocational B.Voc degree tracks, and industry apprenticeship linkages.',
        badge: 'SKILL TRACK',
        updatedDate: 'November 2026',
        statutoryRef: 'National Skills Qualifications Framework (NSQF)',
        overview: 'Dedicated vocational track integrating formal higher education with practical industry apprenticeship under the National Skills Qualifications Framework (NSQF Levels 4 through 7).',
        keyPrinciples: [
          { title: 'Multiple Entry / Exit', desc: 'Allows students to exit with Certificate, Diploma, or Advanced Diploma before completing full B.Voc degree.' },
          { title: 'Dual Training System', desc: '50% classroom instructional theory paired with 50% paid on-the-job industrial apprenticeship.' }
        ],
        sections: [
          {
            title: 'Grassroots Polytechnic Protection',
            content: 'VidyaKosh ensures that polytechnic colleges serving rural youth maintain statutory 10-year unbroken deposits, protecting students from unannounced branch closures or sudden institutional liquidation.'
          }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 7. STATISTICS
  // -------------------------------------------------------------------------
  {
    id: 'statistics',
    title: 'Statistics',
    path: '/statistics',
    description: 'National technical education data: regulatory metrics, intake analytics, and e-FDR deposit monitoring.',
    subPages: [
      {
        slug: 'dashboard',
        sectionId: 'statistics',
        sectionTitle: 'Statistics',
        path: '/statistics/dashboard',
        title: 'National Regulatory Dashboard',
        subtitle: 'Real-time telemetry and macroeconomic indicators across all 10,800+ technical institutions.',
        badge: 'LIVE TELEMETRY',
        updatedDate: 'November 2026',
        statutoryRef: 'National Data Portal • Data.gov.in Sync',
        overview: 'Centralized analytics dashboard providing real-time visibility into institutional compliance rates, bank verification speeds, geographical distribution of approved seats, and total statutory surety corpus.',
        keyPrinciples: [
          { title: 'Live Data Streams', desc: 'Real-time data synchronization directly from the VidyaKosh PostgreSQL ledger engine.' },
          { title: 'Transparent Governance', desc: 'Public indicators ensuring accountability to Parliament, state education ministries, and citizen stakeholders.' }
        ],
        metrics: [
          { label: 'Sanctioned Intake Capacity', value: '3.42 Million', detail: 'Technical seats nationwide' },
          { label: 'Active Commercial Bank Liens', value: '42,518 Instruments', detail: 'Covering 100% compliant colleges' },
          { label: 'Average SLA Response Time', value: '4.2 Days', detail: 'From submission to final bank attestation' }
        ],
        sections: [
          {
            title: 'National Compliance Breakdown',
            content: 'The regulatory dashboard continuously aggregates metrics across public institutions, autonomous universities, and private un-aided colleges to assess macro-level health.'
          }
        ]
      },
      {
        slug: 'intake',
        sectionId: 'statistics',
        sectionTitle: 'Statistics',
        path: '/statistics/intake',
        title: 'Sanctioned Technical Intake Analytics',
        subtitle: 'State-wise and discipline-wise distribution of approved engineering and management seats.',
        badge: 'SEAT ANALYTICS',
        updatedDate: 'October 2026',
        statutoryRef: 'Annual Intake Publication 2026-27',
        overview: 'Exhaustive data compilation of annual intake trends, seat utilization rates, emerging computer technology shifts, and regional seat availability across Indian states and union territories.',
        keyPrinciples: [
          { title: 'Discipline Shift Tracking', desc: 'Monitors transition from traditional branch seats towards emerging AI, Machine Learning, and Green Hydrogen.' },
          { title: 'Regional Equilibrium', desc: 'Guides state governments in balancing technical seat availability between urban and rural centers.' }
        ],
        sections: [
          {
            title: 'Top Technical Education States by Intake',
            content: 'Tamil Nadu, Maharashtra, Andhra Pradesh, Telangana, and Karnataka represent over 60% of total national engineering undergraduate seats, with VidyaKosh operating dedicated regional monitoring cells.'
          }
        ]
      },
      {
        slug: 'deposits',
        sectionId: 'statistics',
        sectionTitle: 'Statistics',
        path: '/statistics/deposits',
        title: 'Total Security Deposits Monitored',
        subtitle: 'Corpus valuation, bank-wise allocation, and maturity tenure tracking across the national ledger.',
        badge: 'CORPUS VALUATION',
        updatedDate: 'November 2026',
        statutoryRef: 'Finance Bureau Annual Report • AICTE New Delhi',
        overview: 'Comprehensive analytical view of the ₹14,200+ Crore national institutional security deposit corpus, detailing bank-wise exposure, maturity scheduling, and default rates.',
        keyPrinciples: [
          { title: 'Bank Exposure Distribution', desc: 'Ensures security deposits are distributed across creditworthy Scheduled Commercial Banks under RBI oversight.' },
          { title: 'Zero Capital Loss', desc: 'Over 10 consecutive years of zero loss of student security funds through strict joint lien enforcement.' }
        ],
        tableData: {
          headers: ['Depository Bank Category', 'Active Instruments', 'Share of Total Corpus', 'Attestation Compliance'],
          rows: [
            ['State Bank of India (SBI)', '14,280 Instruments', '34.2%', '99.4% Timely CBS Attestation'],
            ['Punjab National Bank (PNB)', '8,150 Instruments', '19.5%', '98.8% Timely CBS Attestation'],
            ['Bank of Baroda (BOB)', '7,420 Instruments', '17.6%', '98.2% Timely CBS Attestation'],
            ['Canara Bank', '5,890 Instruments', '13.9%', '97.9% Timely CBS Attestation'],
            ['Private Sector Banks (HDFC / ICICI)', '6,778 Instruments', '14.8%', '99.1% Timely CBS Attestation']
          ]
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 8. OPPORTUNITIES
  // -------------------------------------------------------------------------
  {
    id: 'opportunities',
    title: 'Opportunities',
    path: '/opportunities',
    description: 'Faculty development programs, institutional funding opportunities, tenders, and public procurement.',
    subPages: [
      {
        slug: 'faculty',
        sectionId: 'opportunities',
        sectionTitle: 'Opportunities',
        path: '/opportunities/faculty',
        title: 'Faculty Development Schemes (ATAL Academy)',
        subtitle: 'National faculty upskilling, leadership training, and industrial immersion programs.',
        badge: 'ATAL ACADEMY',
        updatedDate: 'November 2026',
        statutoryRef: 'AICTE Training & Learning (ATAL) Academy',
        overview: 'The AICTE Training and Learning (ATAL) Academy conducts continuous teacher-training programs to empower technical faculty with contemporary pedagogy and emerging technology skills.',
        keyPrinciples: [
          { title: 'Upskilling in Deep Tech', desc: 'Hands-on laboratory training in Robotics, Semiconductor Packaging, and Artificial Intelligence.' },
          { title: 'Industry Immersion', desc: 'Faculty sabbaticals with major industrial research facilities to bridge theoretical and practical gaps.' }
        ],
        sections: [
          {
            title: 'Funding & Fellowship Grants',
            content: 'Faculty members from approved technical colleges can apply for full travel and research fellowships to attend international technical conferences.',
            bulletPoints: [
              'Research Promotion Scheme (RPS): Up to ₹25 Lakhs per project for young faculty researchers.',
              'Quality Improvement Programme (QIP): Paid deputation for faculty to complete Ph.D. degrees at premier IITs and IISc.'
            ]
          }
        ]
      },
      {
        slug: 'grants',
        sectionId: 'opportunities',
        sectionTitle: 'Opportunities',
        path: '/opportunities/grants',
        title: 'Institutional Infrastructure Grants',
        subtitle: 'Capital funding grants for campus laboratory upgrades, incubators, and smart classrooms.',
        badge: 'CAPITAL GRANTS',
        updatedDate: 'October 2026',
        statutoryRef: 'Institutional Development Guidelines',
        overview: 'Grant opportunities for technical institutes to establish innovation incubators, high-performance computing clusters, and green campus laboratories.',
        keyPrinciples: [
          { title: 'Idea Development Laboratories (IDEA Labs)', desc: '₹1.1 Crore co-funding to set up 24/7 prototype fabrication workshops for students.' },
          { title: 'Special Grants for North-East & J&K', desc: '100% financial assistance for infrastructure enhancement in frontier regions.' }
        ],
        sections: [
          {
            title: 'Application & Disbursement Criteria',
            content: 'Applications are submitted through the NSWS portal and evaluated by peer review panels. Grant disbursement is routed directly through PFMS upon digital verification of institutional compliance on VidyaKosh.'
          }
        ]
      },
      {
        slug: 'tenders',
        sectionId: 'opportunities',
        sectionTitle: 'Opportunities',
        path: '/opportunities/tenders',
        title: 'Public Tenders & Procurement Notices',
        subtitle: 'Official procurement notices, GeM portal tenders, and consulting invitations.',
        badge: 'PUBLIC PROCUREMENT',
        updatedDate: 'November 2026',
        statutoryRef: 'Government e-Marketplace (GeM) & CVC Guidelines',
        overview: 'Public procurement repository detailing Requests for Proposals (RFPs), technology consulting tenders, and hardware procurement in compliance with Central Vigilance Commission (CVC) standards.',
        keyPrinciples: [
          { title: 'GeM Portal First', desc: 'All procurement executed transparently via the Government e-Marketplace.' },
          { title: 'Open Competitive Bidding', desc: 'Strict two-envelope technical and commercial bidding for major digital infrastructure contracts.' }
        ],
        sections: [
          {
            title: 'Active Procurement Notices',
            content: 'Official notices currently open for participation from empaneled software vendors, auditing firms, and technology partners for national education portals.'
          }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 9. BULLETINS
  // -------------------------------------------------------------------------
  {
    id: 'bulletins',
    title: 'Bulletins',
    path: '/bulletins',
    description: 'Official gazette circulars, regulatory guidelines, standard operating procedures (SOPs), and user manuals.',
    badge: 'GAZETTE ARCHIVE',
    subPages: [
      {
        slug: 'circulars',
        sectionId: 'bulletins',
        sectionTitle: 'Bulletins',
        path: '/bulletins/circulars',
        title: 'Official Circulars & User Manuals',
        subtitle: 'Statutory SOPs, Core Banking attestation advisories, and step-by-step platform user guides.',
        badge: 'SOP REPOSITORY',
        updatedDate: 'November 2026',
        statutoryRef: 'Regulation Bureau Gazette Archives',
        overview: 'Comprehensive repository of official regulatory notifications, Standard Operating Procedures (SOPs), and illustrated user manuals instructing institutions and banks on e-FDR compliance.',
        keyPrinciples: [
          { title: 'Verifiable Notifications', desc: 'Every circular includes official dispatch reference numbers, signature blocks, and downloadable gazette copies.' },
          { title: 'Step-by-Step SOPs', desc: 'Clear guidelines detailing the exact lifecycle workflow from initial deposit submission to final release NOC.' }
        ],
        sections: [
          {
            title: 'Direct Link to Gazette Repository',
            content: 'For full text previews, searchable circular archives, and printable PDF gazette releases, access the dedicated circulars page:',
            bulletPoints: [
              'Circular No. AICTE/RB/FDR/2026/04: Mandatory CBS Lien Marking Guidelines.',
              'Circular No. AICTE/RB/APH/2026/01: Approval Process Handbook 2026-31 Gazetted Provisions.',
              'Circular No. AICTE/FIN/AUDIT/2026/12: Bank Branch Manager Attestation Protocols.'
            ]
          }
        ]
      },
      {
        slug: 'gazette',
        sectionId: 'bulletins',
        sectionTitle: 'Bulletins',
        path: '/bulletins/gazette',
        title: 'Gazette Notifications',
        subtitle: 'Extraordinary notifications published in the official Gazette of India.',
        badge: 'OFFICIAL GAZETTE',
        updatedDate: 'October 2026',
        statutoryRef: 'The Gazette of India • Extraordinary Authority',
        overview: 'Statutory notifications published by the Ministry of Education in the official Gazette of India carrying legal enforceability across all states and union territories.',
        keyPrinciples: [
          { title: 'Legal Enforceability', desc: 'Carries force of law under Section 23 of the AICTE Act 1987.' },
          { title: 'Permanent Public Record', desc: 'Archived for reference in judicial, administrative, and appellate proceedings.' }
        ],
        sections: [
          {
            title: 'Recent Gazette Enactments',
            content: 'Includes official amendments regarding the transition of institutional fixed deposits into digital tokenized registries and mandatory auto-renewal provisions.',
            bulletPoints: [
              'Gazette Notification No. S.O. 4512(E): Compulsory core banking hypothecation for institutional approvals.',
              'Gazette Notification No. S.O. 2891(E): Norms for joint lien holding with AICTE Regional Officers.'
            ]
          }
        ]
      },
      {
        slug: 'deposit-norms',
        sectionId: 'bulletins',
        sectionTitle: 'Bulletins',
        path: '/bulletins/deposit-norms',
        title: 'Chapter IV Deposit Norms Reference',
        subtitle: 'Quick statutory reference for institutional fixed deposit amounts, lock-in tenures, and penalty rubrics.',
        badge: 'CHAPTER IV',
        updatedDate: 'November 2026',
        statutoryRef: 'APH 2026-31 Chapter IV',
        overview: 'Direct regulatory reference providing statutory clauses, penalty matrices, and hypothecation requirements codified in Chapter IV of the Approval Process Handbook.',
        keyPrinciples: [
          { title: 'Instant Reference', desc: 'Quick overview of mandatory deposit figures across Engineering, Management, Pharmacy, and Polytechnic.' },
          { title: 'Direct Link to Interactive Calculator', desc: 'Seamless access to the full dedicated APH Chapter IV Deposit Norms Page.' }
        ],
        sections: [
          {
            title: 'Explore Full Chapter IV Breakdown',
            content: 'Access the dedicated interactive APH Deposit Norms portal for live discipline filters, compound interest matrices, and Core Banking hypothecation codes.'
          }
        ]
      }
    ]
  }
];

// Helper to look up any page by route path
export function getPortalPageByPath(path: string): PortalSubPage | undefined {
  const normalizedPath = path.toLowerCase().replace(/\/$/, '');
  for (const section of PORTAL_SECTIONS_DATA) {
    for (const sub of section.subPages) {
      if (sub.path.toLowerCase() === normalizedPath) {
        return sub;
      }
    }
  }
  return undefined;
}

// Helper to look up section by ID
export function getPortalSectionById(id: string): PortalSection | undefined {
  return PORTAL_SECTIONS_DATA.find(s => s.id === id);
}
