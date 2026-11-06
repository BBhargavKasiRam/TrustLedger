import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  ArrowLeft, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Info,
  BookOpen,
  Landmark,
  Layers
} from 'lucide-react';

interface AphDepositNormsPageProps {
  onBack?: () => void;
}

export const AphDepositNormsPage: React.FC<AphDepositNormsPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('engineering');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const programmeNorms = [
    {
      id: 'engineering',
      name: 'Engineering & Technology (Degree)',
      level: 'Undergraduate & Postgraduate Degree',
      discipline: 'ENGINEERING',
      amount: '₹35.0 Lakhs',
      amountNumeric: 3500000,
      duration: '10 Years Continuous',
      durationYears: 10,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_TECH_DEGREE_10Y',
      studentLifecycleCovered: '2.5 Full Cohort Lifecycles (4-Year B.Tech)',
      rationale: 'Substantial laboratory capital assets, expensive heavy machinery, safety infrastructure, and long 4-year degree duration require maximum financial surety to guarantee student completion even in the event of institutional closure.',
      prerequisites: [
        'Mandatory non-encumbrance certificate signed by Bank Branch Manager',
        'Auto-renewal clause with Core Banking lien hypothecation in favour of Regulatory Council',
        'Valid for 10 continuous calendar years without premature closure or loan pledge'
      ],
      differences: 'Highest deposit norm due to long 4-year course tenure and extensive heavy lab machinery risks.'
    },
    {
      id: 'management',
      name: 'Management (MBA / PGDM)',
      level: 'Postgraduate Degree / PG Diploma',
      discipline: 'MANAGEMENT',
      amount: '₹15.0 Lakhs',
      amountNumeric: 1500000,
      duration: '8 Years Continuous',
      durationYears: 8,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_MGMT_PGDM_8Y',
      studentLifecycleCovered: '4 Full Cohort Lifecycles (2-Year MBA/PGDM)',
      rationale: 'Postgraduate management programs operate on intensive 2-year cycles. An 8-year lock-in period securely shields 4 consecutive graduating batches against sudden commercial default, placement disruptions, or faculty salary abandonments.',
      prerequisites: [
        'Mandatory AICTE placement surety buffer',
        'Zero-loan encumbrance affidavit on stamp paper',
        'Bi-annual interest credit permitted to institutional trust operational account'
      ],
      differences: 'Shallow lab requirement results in lower ₹15L norm compared to Engineering, but maintains strict 8-year timeline.'
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy (B.Pharm / M.Pharm / Pharm.D)',
      level: 'Undergraduate & Professional Degree',
      discipline: 'PHARMACY',
      amount: '₹15.0 Lakhs',
      amountNumeric: 1500000,
      duration: '8 Years Continuous',
      durationYears: 8,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_PHARMA_8Y',
      studentLifecycleCovered: '2 Full Cohort Lifecycles (4-Year B.Pharm)',
      rationale: 'Harmonized statutory compliance between AICTE and Pharmacy Council of India (PCI). Ensures continuous maintenance of bio-chemical wet laboratories, certified animal housing facilities, and medicinal chemistry safety protocols.',
      prerequisites: [
        'PCI inspection clearance reference along with AICTE LoI',
        'Hazardous chemicals disposal safety buffer fund',
        'Joint lien registered in Core Banking System'
      ],
      differences: 'Requires joint PCI-AICTE synchronization; funds cannot be released without cross-regulatory NOC.'
    },
    {
      id: 'architecture',
      name: 'Architecture & Town Planning (B.Arch / M.Arch)',
      level: 'Professional 5-Year Degree',
      discipline: 'ARCHITECTURE',
      amount: '₹15.0 Lakhs',
      amountNumeric: 1500000,
      duration: '8 Years Continuous',
      durationYears: 8,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_ARCH_8Y',
      studentLifecycleCovered: '1.6 Full Cohort Lifecycles (5-Year B.Arch)',
      rationale: 'Complies with Council of Architecture (CoA) standards. Shields design studio workstations, computer-aided architectural drawing labs, model-making workshops, and continuous jury evaluation processes.',
      prerequisites: [
        'Studio workshop space compliance certificate',
        'Council of Architecture inspectorate registration code',
        'Lien endorsed across National Single Window System (NSWS)'
      ],
      differences: '5-year professional program with specialized drafting studio overheads.'
    },
    {
      id: 'hmct',
      name: 'Hotel Management & Catering Technology (HMCT)',
      level: 'Degree & Diploma',
      discipline: 'HOSPITALITY',
      amount: '₹15.0 Lakhs',
      amountNumeric: 1500000,
      duration: '8 Years Continuous',
      durationYears: 8,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_HMCT_8Y',
      studentLifecycleCovered: '2 to 2.6 Cohort Lifecycles',
      rationale: 'Safeguards operational continuity of high-maintenance commercial industrial kitchens, guest training mock rooms, and food production hygiene facilities.',
      prerequisites: [
        'FSSAI and food safety audit compliance check',
        'Core Banking System Joint Lien Certificate with scheduled commercial bank'
      ],
      differences: 'Covers consumables and perishable training asset operational buffers.'
    },
    {
      id: 'polytechnic',
      name: 'Polytechnic / Technical Diploma',
      level: '3-Year State Board Technical Diploma',
      discipline: 'POLYTECHNIC',
      amount: '₹15.0 Lakhs',
      amountNumeric: 1500000,
      duration: '10 Years Continuous',
      durationYears: 10,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_POLY_10Y',
      studentLifecycleCovered: '3.3 Full Cohort Lifecycles (3-Year Diploma)',
      rationale: 'Diploma colleges serve critical foundational grassroots technician education. A 10-year timeline safeguards students against fly-by-night operators and regional industrial shifts.',
      prerequisites: [
        'State Directorate of Technical Education (DTE) approval concordance',
        '10-year uninterrupted bank lock-in deposit certificate'
      ],
      differences: '10-year term matching Engineering degree, but reduced ₹15L capital base.'
    },
    {
      id: 'mca',
      name: 'Computer Applications (MCA)',
      level: 'Postgraduate 2-Year Professional',
      discipline: 'COMPUTER',
      amount: '₹15.0 Lakhs',
      amountNumeric: 1500000,
      duration: '8 Years Continuous',
      durationYears: 8,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_MCA_8Y',
      studentLifecycleCovered: '4 Full Cohort Lifecycles (2-Year MCA)',
      rationale: 'Guarantees software licensing continuity, high-speed campus networking backbones, cloud laboratory subscriptions, and semester examinations.',
      prerequisites: [
        'Dedicated server infrastructure and licensed system software warranty',
        'Bank joint hypothecation confirmation via CBS API'
      ],
      differences: 'Zero physical plant hazard; focus on digital software lab continuity.'
    },
    {
      id: 'arts_design',
      name: 'Applied Arts, Crafts & Design',
      level: 'Degree & Diploma',
      discipline: 'ARTS',
      amount: '₹10.0 Lakhs',
      amountNumeric: 1000000,
      duration: '8 Years Continuous',
      durationYears: 8,
      lienHolder: 'Regional Officer / Member Secretary',
      cbsCode: 'JOINT_LIEN_ARTS_8Y',
      studentLifecycleCovered: '2 to 2.5 Cohort Lifecycles',
      rationale: 'Special incentive slab to encourage creative indigenous craftsmanship, textile technology, industrial design, and cultural heritage academies.',
      prerequisites: [
        'Creative design studio infrastructure certificate',
        'Joint lien pledge with scheduled commercial bank'
      ],
      differences: 'Concessional ₹10 Lakhs deposit norm to incentivize non-conventional design disciplines.'
    }
  ];

  const filteredNorms = selectedDiscipline === 'ALL'
    ? programmeNorms
    : programmeNorms.filter(n => n.discipline === selectedDiscipline);

  const activeNorm = programmeNorms.find(n => n.id === selectedCategory) || programmeNorms[0];

  return (
    <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER & BREADCRUMB NAVIGATION                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-[#002147] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-[#002147] text-amber-400 p-1.5 rounded-md font-bold text-xs flex items-center gap-1">
                <Scale className="w-4 h-4" />
                <span>APH 2026-31</span>
              </span>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono">
                CHAPTER IV STATUTORY PROVISIONS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#002147] tracking-tight">
              Mandatory Security Deposit Norms &amp; e-FDR Guidelines
            </h1>
            <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
              Comprehensive regulatory reference for technical and professional institutions in India. Explains statutory deposit amounts, mandatory continuous lock-in durations, joint lien hypothecations, and the programmatic rationale governing each discipline.
            </p>
          </div>

          <button
            onClick={handleBack}
            className="self-start md:self-center flex items-center space-x-2 bg-[#002147] hover:bg-[#003870] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </button>
        </div>

        {/* Quick Statutory Key Principles Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-5 text-xs text-slate-700">
          <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Lock className="w-4 h-4 text-[#002147] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">Continuous Lock-in</strong>
              <span>8 to 10 years unbroken deposit without premature encashment or loan pledge.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">Joint Lien Mandate</strong>
              <span>Held in the joint names of the Society/Trust and the Regulatory Council.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Landmark className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">Scheduled Commercial Banks</strong>
              <span>Must be created in banks under the Second Schedule of the RBI Act, 1934.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">4-Gate Release Clearance</strong>
              <span>NOC issued only after complete academic batch graduation and zero dues.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DISCIPLINE SELECTOR & INTERACTIVE NORMS BREAKDOWN VIEW                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 4 Cols: Discipline Picker List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Select Discipline
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">
                {filteredNorms.length} OF {programmeNorms.length}
              </span>
            </div>

            {/* Discipline Filter Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2.5">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'ENGINEERING', label: 'Engineering' },
                { id: 'MANAGEMENT', label: 'Management' },
                { id: 'PHARMACY', label: 'Pharmacy' },
                { id: 'POLYTECHNIC', label: 'Diploma' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedDiscipline(f.id)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition cursor-pointer ${
                    selectedDiscipline === f.id
                      ? 'bg-[#002147] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Discipline Category Buttons */}
            <div className="space-y-1.5">
              {filteredNorms.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => setSelectedCategory(prog.id)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-between border ${
                    selectedCategory === prog.id
                      ? 'bg-[#002147] text-white border-[#002147] shadow-sm font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <GraduationCap className={`w-4 h-4 ${selectedCategory === prog.id ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate max-w-[210px]">{prog.name}</span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                    selectedCategory === prog.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {prog.amount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Regulatory Citation Box */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>APH Clause 2.14 Regulatory Rule</span>
            </div>
            <p className="leading-relaxed">
              "The applicant Trust / Society / Company shall create a Fixed Deposit in any Scheduled Commercial Bank jointly in the name of the Applicant and the Regional Officer for the mandated period specified in Chapter IV."
            </p>
          </div>
        </div>

        {/* Right 8 Cols: Deep Breakdown Card for the Selected Discipline */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-[#002147] p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header of Active Programme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#002147] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {activeNorm.level}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {activeNorm.name}
                </h2>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                  Statutory Mandatory Principal
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002147] font-mono">
                  {activeNorm.amount}
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Clock className="w-5 h-5 text-blue-700 mx-auto mb-1.5" />
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                  Mandatory Lock-In
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {activeNorm.duration}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Continuous &amp; Unbroken</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                  Mandated Joint Lien
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  Regulatory Officer
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">Joint Pledge Mandatory</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <GraduationCap className="w-5 h-5 text-purple-700 mx-auto mb-1.5" />
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                  Student Cohorts Protected
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {activeNorm.studentLifecycleCovered.split('(')[0]}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Guaranteed Course Completion</span>
              </div>
            </div>

            {/* Detailed Rationale Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#002147]" />
                <span>Statutory Rationale &amp; Why This Amount Is Required</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                {activeNorm.rationale}
              </p>
            </div>

            {/* Why Is It Different? (Comparison Callout) */}
            <div className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>How Is It Different From Other Disciplines?</span>
              </h3>
              <div className="bg-amber-50/60 p-4 rounded-lg border border-amber-200 text-sm text-slate-800 leading-relaxed">
                {activeNorm.differences}
              </div>
            </div>

            {/* Core Statutory Prerequisites */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Statutory Prerequisites for Deposit Issuance</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {activeNorm.prerequisites.map((req, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CBS Integration Technical Identifier */}
            <div className="p-3.5 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Core Banking System Hypothecation Mapping Key:</span>
              <span className="text-amber-400 font-bold bg-slate-800 px-2.5 py-1 rounded">
                {activeNorm.cbsCode}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. COMPARATIVE BREAKDOWN TABLE ("How Is It Different for What All")       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Master Comparison Table: Programme vs. Programme
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Side-by-side comparison illustrating statutory lock-in durations, required security deposit amounts, and structural regulatory differences under Chapter IV of the APH handbook.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#002147] text-white font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Discipline / Programme</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Required FDR Amount</th>
                <th className="py-3.5 px-4">Lock-in Duration</th>
                <th className="py-3.5 px-4">Lien Authority</th>
                <th className="py-3.5 px-4">Primary Differentiator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {programmeNorms.map((prog, idx) => (
                <tr 
                  key={prog.id} 
                  className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                    selectedCategory === prog.id ? 'bg-amber-50/60 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                  onClick={() => setSelectedCategory(prog.id)}
                >
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                    <span>{prog.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-xs">{prog.level}</td>
                  <td className="py-3 px-4 font-black font-mono text-[#002147]">{prog.amount}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{prog.duration}</td>
                  <td className="py-3 px-4 text-emerald-800 text-xs font-semibold">{prog.lienHolder}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs max-w-xs leading-snug">{prog.differences}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FREQUENTLY ASKED REGULATORY QUESTIONS (FAQ / BREAKDOWN)                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Regulatory Questions on Chapter IV Norms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">
              1. Can an institution withdraw the interest earned on the e-FDR?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yes. As per Clause 2.14, the interest accrued on the fixed deposit may be credited periodically (quarterly or annually) to the operational bank account of the applicant Trust/Society for institutional development and faculty remuneration. However, the principal corpus cannot be touched.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">
              2. What happens when a public sector bank undergoes a merger?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When amalgamations occur (e.g., Syndicate Bank into Canara Bank), the institution must obtain an updated joint lien certificate with the successor bank. VidyaKosh automatically records the DAG lineage graph so continuous lock-in seniority is fully preserved without penalty.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">
              3. What is the procedure for releasing the deposit upon tenure maturity?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upon completion of the mandatory 8 or 10-year lock-in, the institution enters the 4-Gate statutory release workflow: Gate 1 verifies tenure completion, Gate 2 confirms zero cross-bureau dues, Gate 3 executes Scrutiny Sign-off, and Gate 4 issues the QR-signed Discharge NOC via DSC authentication.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">
              4. Why is a sole-name FDR rejected during scrutiny review?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A deposit in the sole name of the institution can be encashed, modified, or pledged against third-party credit lines without regulatory knowledge. Statutory hypothecation under Joint Lien guarantees that the bank cannot permit loans or withdrawals without explicit formal clearance.
            </p>
          </div>
        </div>

        {/* Back Button Bottom */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 bg-[#002147] hover:bg-[#003870] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Main Portal</span>
          </button>
        </div>
      </div>

    </div>
  );
};