import React, { useState, useEffect } from 'react';
import { 
  UserCircle2, 
  Building2, 
  Landmark, 
  FileCheck2, 
  Crown, 
  BookOpen,
  LogOut,
  Sparkles,
  Volume2,
  Bell,
  AlertTriangle,
  Clock,
  ShieldAlert,
  X,
  Search,
  Menu,
  Info,
  Newspaper,
  Layers,
  GraduationCap,
  BarChart3,
  Briefcase,
  FileText
} from 'lucide-react';
import type { UserRole, UserSession } from '../types';

interface NavbarProps {
  currentSession: UserSession | null;
  onLogout: () => void;
  onOpenCirculars?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSession,
  onLogout,
  onOpenCirculars
}) => {
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [currentLang, setCurrentLang] = useState<'EN' | 'HI'>('EN');
  const [showNotificationMenu, setShowNotificationMenu] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live Real-Time Clock matching image1.png format: "Saturday , 11-07-2026 ,01:11 AM"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = days[now.getDay()];
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hh = String(hours).padStart(2, '0');
      setCurrentTime(`${day} , ${dd}-${mm}-${yyyy} ,${hh}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // AICTE Requirement 7: Role-Specific Notification Alerts
  const getRoleNotifications = (role?: UserRole) => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return [
          {
            id: 'n-1',
            type: 'URGENT',
            title: 'Statutory Maturity Notice (T-30)',
            message: 'Deposit FDR-2015-7731 matures in 29 days. 5-year renewal window is now open.',
            time: '10m ago',
            tag: 'RENEWAL_REQUIRED'
          },
          {
            id: 'n-2',
            type: 'INFO',
            title: 'Bank Verification Attested',
            message: 'SBI Branch Manager attested ₹35,00,000 principal with Joint AICTE lien.',
            time: '2h ago',
            tag: 'CBS_CONFIRMED'
          }
        ];
      case 'AICTE_SCRUTINY_OFFICER':
        return [
          {
            id: 'n-3',
            type: 'CRITICAL',
            title: 'SLA Breach: Unreviewed Discrepancy > 7 Days',
            message: 'State Institute of Tech (PID 1-2003): ₹35L claimed vs ₹15L bank confirmed.',
            time: '1h ago',
            tag: 'SLA_BREACH_ESCALATION'
          },
          {
            id: 'n-4',
            type: 'ACTION',
            title: 'Release Clearance Request',
            message: 'Shivalik Polytechnic (PID 1-4004) completed 10-year lock-in. Gate 3 review pending.',
            time: '3h ago',
            tag: 'GATE_3_REVIEW'
          }
        ];
      case 'COMPETENT_AUTHORITY':
        return [
          {
            id: 'n-5',
            type: 'CRITICAL',
            title: 'Executive DSC PIN Sign-Off Required',
            message: 'Gate 3 cleared for Shivalik Polytechnic (PID 1-4004). Authorize final Discharge NOC.',
            time: '30m ago',
            tag: 'GATE_4_PENDING'
          },
          {
            id: 'n-6',
            type: 'WARNING',
            title: 'Statutory Regulatory Hold Imposed',
            message: 'Soft-hold on Annual EoA placed on overdue institutions under APH Clause 2.14.',
            time: '1d ago',
            tag: 'SOFT_HOLD_EOA'
          }
        ];
      case 'BANK_BRANCH_MANAGER':
        return [
          {
            id: 'n-7',
            type: 'WARNING',
            title: 'Attestation SLA Reminder (72h)',
            message: 'Security deposit verification for Vanguard College pending Branch Manager CBS review.',
            time: '4h ago',
            tag: 'MAGIC_LINK_PENDING'
          }
        ];
      default:
        return [
          {
            id: 'n-8',
            type: 'INFO',
            title: 'AICTE VidyaKosh Operational',
            message: 'All cryptographic audit chains verified from Genesis block.',
            time: 'Just now',
            tag: 'SYSTEM_OK'
          }
        ];
    }
  };

  const notifications = getRoleNotifications(currentSession?.role);

  const handleFontSize = (delta: number) => {
    const newOffset = Math.max(-2, Math.min(2, fontSizeOffset + delta));
    setFontSizeOffset(newOffset);
    if (newOffset === 0) {
      document.documentElement.style.fontSize = '17px';
    } else {
      document.documentElement.style.fontSize = `${17 + newOffset * 1.5}px`;
    }
  };

  const handleSkipToContent = () => {
    const mainEl = document.querySelector('main') || document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToLogin = () => {
    const loginEl = document.getElementById('login-form-section') || document.querySelector('form') || document.getElementById('main-content');
    if (loginEl) {
      loginEl.scrollIntoView({ behavior: 'smooth' });
      loginEl.classList.add('ring-4', 'ring-amber-500', 'transition-all');
      setTimeout(() => loginEl.classList.remove('ring-4', 'ring-amber-500'), 2000);
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return <Building2 className="w-3.5 h-3.5 text-blue-700" />;
      case 'AICTE_SCRUTINY_OFFICER':
        return <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />;
      case 'COMPETENT_AUTHORITY':
        return <Crown className="w-3.5 h-3.5 text-amber-700" />;
      case 'BANK_BRANCH_MANAGER':
        return <Landmark className="w-3.5 h-3.5 text-purple-700" />;
      default:
        return <UserCircle2 className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  const getRoleBadgeStyle = (role?: UserRole) => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'COMPETENT_AUTHORITY':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'BANK_BRANCH_MANAGER':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-900 border-slate-200';
    }
  };

  const getRoleDisplayName = (role?: UserRole) => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'Institute Nodal Officer';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'AICTE Scrutiny Officer';
      case 'COMPETENT_AUTHORITY':
        return 'Competent Regulatory Authority';
      case 'BANK_BRANCH_MANAGER':
        return 'Bank Branch Manager';
      default:
        return 'Public SSO User';
    }
  };

  // Nav Links matching image.png exactly
  const navLinks = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'news', label: 'NewsRoom', icon: Newspaper },
    { id: 'bureaus', label: 'Bureaus/Cell', icon: Layers, badge: 'REGULATION' },
    { id: 'initiatives', label: 'Initiatives', icon: Sparkles },
    { id: 'schemes', label: 'Schemes', icon: BookOpen },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'bulletins', label: 'Bulletins', icon: FileText },
    { id: 'search', label: 'Search', icon: Search }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md font-sans print:hidden select-none">
      
      {/* ========================================================================= */}
      {/* TIER 1: TOP ACCESSIBILITY & SOCIAL UTILITY STRIP (image1.png)             */}
      {/* ========================================================================= */}
      <div className="bg-[#181818] text-white text-xs sm:text-[13px] py-2 px-3 sm:px-6 lg:px-8 border-b border-black">
        <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto flex items-center justify-between gap-2 flex-wrap">
          
          {/* Left: Dynamic Live Date-Time + Screen Reader Access */}
          <div className="flex items-center space-x-3 sm:space-x-5 text-xs sm:text-sm">
            <span className="font-mono text-slate-200 font-medium tracking-tight">
              {currentTime || 'Saturday , 11-07-2026 ,01:11 AM'}
            </span>

            <button 
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance("Welcome to the AICTE VidyaKosh Centralized Security Deposit and Fixed Deposit Receipt Management Portal.");
                window.speechSynthesis?.speak(utterance);
              }}
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer group"
              title="Click to activate voice screen reader speech"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-[11px] sm:text-xs">Screen Reader Access</span>
            </button>
          </div>

          {/* Right: Text Size, Language Pill, Web Portal Login, Social Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[11px] sm:text-xs ml-auto">
            
            {/* Text Size (A- A A+) */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 font-medium hidden sm:inline">Text Size</span>
              <button 
                onClick={() => handleFontSize(-1)} 
                title="Decrease font size"
                className="px-1 text-slate-300 hover:text-white cursor-pointer font-bold text-xs"
              >
                A<sup className="text-[10px]">-</sup>
              </button>
              <button 
                onClick={() => handleFontSize(0)} 
                title="Reset font size"
                className="px-1 text-slate-300 hover:text-white cursor-pointer font-bold text-xs"
              >
                A
              </button>
              <button 
                onClick={() => handleFontSize(1)} 
                title="Increase font size"
                className="px-1 text-slate-300 hover:text-white cursor-pointer font-bold text-xs"
              >
                A<sup className="text-[10px]">+</sup>
              </button>
            </div>

            {/* Language Toggle Pill: [A/文 | हिन्दी] matching image1.png */}
            <button
              onClick={() => setCurrentLang(currentLang === 'EN' ? 'HI' : 'EN')}
              className="flex items-center rounded-sm bg-[#FFA500] hover:bg-[#FF9100] text-black font-bold text-[11px] px-2 py-0.5 shadow-xs transition-colors cursor-pointer"
              title="Toggle between English and Hindi"
            >
              <span className="border-r border-black/30 pr-1 mr-1">A/文</span>
              <span>{currentLang === 'EN' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Web Portal Login Button (matching yellow/orange pill in image1.png) */}
            {!currentSession ? (
              <button
                onClick={scrollToLogin}
                className="flex items-center space-x-1.5 bg-[#FFA500] hover:bg-[#FF9100] text-black font-bold text-xs px-3 py-1 rounded-full shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <UserCircle2 className="w-3.5 h-3.5 text-black" />
                <span className="tracking-tight">Web Portal Login</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="bg-[#FFA500] text-black font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <UserCircle2 className="w-3 h-3 text-black" />
                  <span className="max-w-[120px] truncate">{currentSession.userName.split(' ')[0]}</span>
                </span>
                <button
                  onClick={onLogout}
                  title="Sign Out of Portal"
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: BRANDING BANNER WITH APPLICATION FAVICON AT FAR LEFT             */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 py-4 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Application Favicon at far left + Institutional Portal Title */}
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <img 
              src="/favicon.png" 
              alt="Application Favicon" 
              className="h-14 sm:h-16 w-auto object-contain shrink-0" 
            />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base lg:text-lg leading-tight tracking-tight">
                अखिल भारतीय तकनीकी शिक्षा परिषद्
              </span>
              <span className="font-bold text-slate-800 text-xs sm:text-sm lg:text-base tracking-tight leading-tight">
                All India Council for Technical Education
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                Regulation &amp; Approval Bureau • विद्याकोष (VidyaKosh e-FDR Portal)
              </span>
            </div>
          </div>

          {/* Right: Circulars, Notification Center, User Session Info */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            
            {/* Circulars & SOPs Modal Opener */}
            {onOpenCirculars && (
              <button
                onClick={onOpenCirculars}
                title="Official Government Circulars, Guidelines & User Manuals"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-[#002147] hover:bg-[#003870] text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Circulars &amp; SOPs</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                  APH
                </span>
              </button>
            )}

            {/* Notification Center Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                title="SLA Alerts & Regulatory Escalations"
                className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-2xl border border-slate-300 z-50 overflow-hidden text-xs animate-in fade-in duration-150">
                  <div className="bg-[#002147] text-white px-3.5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="font-bold tracking-tight">AICTE Statutory Escalations &amp; Notices</span>
                    </div>
                    <button
                      onClick={() => setShowNotificationMenu(false)}
                      className="text-white hover:text-amber-300 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        Zero pending statutory alerts.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="py-2.5 px-2 hover:bg-slate-50 rounded transition flex items-start space-x-2.5">
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'CRITICAL' ? (
                              <ShieldAlert className="w-4 h-4 text-red-600" />
                            ) : n.type === 'URGENT' || n.type === 'WARNING' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 truncate text-[11px]">{n.title}</span>
                              <span className="text-[9px] font-mono font-semibold text-slate-400 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                            <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {n.tag}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>Role: <strong className="text-slate-800">{getRoleDisplayName(currentSession?.role)}</strong></span>
                    <span className="font-mono text-emerald-700 font-bold">LIVE TELEMETRY ✓</span>
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Session Profile Chip */}
            {currentSession && (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs text-xs">
                <div className="p-1 rounded bg-white border border-slate-200">
                  {getRoleIcon(currentSession.role)}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 text-xs max-w-[130px] truncate">
                      {currentSession.userName}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(currentSession.role)}`}>
                      {getRoleDisplayName(currentSession.role)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[160px]">
                    {currentSession.designation} {currentSession.institutionPid ? `• PID: ${currentSession.institutionPid}` : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md bg-[#002147] text-white hover:bg-[#003870] cursor-pointer"
              title="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 3: DEEP NAVY BLUE OFFICIAL NAVIGATION BAR (image.png)                */}
      {/* ========================================================================= */}
      <nav className="bg-[#002147] text-white text-xs sm:text-sm font-medium border-t border-[#001733] shadow-inner">
        <div className="w-full max-w-[97%] 2xl:max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6">
          
          {/* Desktop Navigation Row: Spaced equally across the navbar */}
          <div className="hidden lg:flex items-stretch w-full border-x border-[#001833]/70">
            {navLinks.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') {
                    handleSkipToContent();
                  } else {
                    setActiveModal(item.id);
                  }
                }}
                className={`flex-1 min-w-0 px-2 py-3 hover:bg-[#003870] transition-colors cursor-pointer flex items-center justify-center space-x-1.5 text-center whitespace-nowrap group ${
                  idx < navLinks.length - 1 ? 'border-r border-[#001833]/70' : ''
                } ${
                  item.id === 'home' ? 'bg-[#003870] font-bold text-amber-300' : ''
                }`}
              >
                {item.icon && item.id === 'search' && (
                  <Search className="w-3.5 h-3.5 mr-1 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="hidden xl:inline-block bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.2 rounded ml-1 tracking-tighter shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-slate-700 space-y-1 animate-in slide-in-from-top-2 duration-150">
              <div className="grid grid-cols-2 gap-1 pb-2">
                {navLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (item.id === 'home') {
                        handleSkipToContent();
                      } else {
                        setActiveModal(item.id);
                      }
                    }}
                    className="p-2 text-left hover:bg-[#003870] rounded text-slate-100 font-medium text-xs flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-amber-500 text-black text-[8px] font-bold px-1 rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </nav>

      {/* ========================================================================= */}
      {/* INTERACTIVE OFFICIAL AICTE INFORMATION MODALS (FOR MENU LINKS)            */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border-2 border-[#002147] max-w-2xl w-full p-6 relative max-h-[85vh] overflow-y-auto text-slate-900 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#002147] text-white rounded">
                  <Info className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                    AICTE Official Information: {navLinks.find(l => l.id === activeModal)?.label}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Statutory Bureau Reference • Ministry of Education, Govt. of India
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content depending on clicked link */}
            {activeModal === 'about' && (
              <div className="space-y-3 leading-relaxed">
                <p>
                  The <strong>All India Council for Technical Education (AICTE)</strong> is the statutory body and national-level council for technical education, under the Department of Higher Education, Ministry of Education, Government of India.
                </p>
                <p>
                  Established in November 1945 first as an advisory body and later given statutory status by an Act of Parliament in 1987, AICTE is responsible for proper planning and coordinated development of the technical and management education system throughout India.
                </p>
                <div className="bg-blue-50 border-l-4 border-[#002147] p-3 rounded text-slate-800 font-medium">
                  <strong>VidyaKosh Mandate:</strong> Regulation &amp; Approval Bureau monitors statutory security deposits and Fixed Deposit Receipts (FDRs) under Chapter IV of the Approval Process Handbook (APH 2026-31) to safeguard educational continuity.
                </div>
              </div>
            )}

            {activeModal === 'bureaus' && (
              <div className="space-y-3">
                <p>AICTE operates through specialized administrative and regulatory bureaus:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-300">
                    <span className="font-bold text-[#002147] block text-xs">⭐ Regulation &amp; Approval Bureau (Active)</span>
                    <span className="text-[11px] text-slate-600">Oversees Extension of Approval (EoA), FDR Security Deposits, and VidyaKosh compliance.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block text-xs">Policy &amp; Academic Planning Bureau</span>
                    <span className="text-[11px] text-slate-600">Curriculum modernization, faculty development, and academic frameworks.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block text-xs">Finance &amp; Accounts Bureau</span>
                    <span className="text-[11px] text-slate-600">Statutory audits, grant disbursements, and financial governance.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block text-xs">Institutional Development Bureau</span>
                    <span className="text-[11px] text-slate-600">R&amp;D schemes, modern laboratory infrastructure grants, and PMSSS.</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'statistics' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-xl font-extrabold text-[#002147] block">10,480+</span>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Approved Institutes</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                    <span className="text-xl font-extrabold text-emerald-800 block">₹2,540 Cr</span>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Total Secured Corpus</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                    <span className="text-xl font-extrabold text-amber-800 block">99.8%</span>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Joint Lien Verified</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Live statutory telemetry synced across RBI Scheduled Commercial Banks and Core Banking Systems (CBS).
                </p>
              </div>
            )}

            {activeModal === 'search' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Search AICTE Regulation Bureau Records, Circulars &amp; FDRs:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Institution Name, AICTE PID (e.g. 1-2001), or FDR UID..."
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      const table = document.getElementById('centralized-fdr-repository') || document.querySelector('input[type="text"]');
                      if (table) table.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#002147] hover:bg-[#003870] text-white font-bold px-4 py-2 rounded text-xs cursor-pointer"
                  >
                    Search
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Quick filters available for: Permanent Institute IDs (PID), State Bank of India, Canara Bank, and Expired FDRs.
                </p>
              </div>
            )}

            {(activeModal === 'news' || activeModal === 'initiatives' || activeModal === 'schemes' || activeModal === 'education' || activeModal === 'opportunities' || activeModal === 'bulletins') && (
              <div className="space-y-3">
                <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-[#002147] block text-xs">
                    Latest Regulatory Circular (APH 2026-31 Gazette Release)
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Under AICTE Approval Process Handbook regulations, all institutional security deposits must maintain uninterrupted joint lien with AICTE Member Secretary. Renewals must be submitted within T-90 days of maturity.
                  </p>
                  <span className="text-[9px] font-mono text-slate-400 block">Published: Ministry of Education, Govt. of India</span>
                </div>
                {onOpenCirculars && (
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      onOpenCirculars();
                    }}
                    className="w-full py-2 bg-[#002147] hover:bg-[#003870] text-white font-bold rounded text-xs cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Full Circulars, SOPs &amp; User Manuals Repository</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </header>
  );
};

