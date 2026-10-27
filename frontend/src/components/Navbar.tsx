import React, { useState } from 'react';
import { 
  UserCircle2, 
  Building2, 
  Landmark, 
  FileCheck2, 
  Crown, 
  BookOpen,
  LogOut,
  Sparkles,
  CheckCircle2,
  Volume2,
  Bell,
  AlertTriangle,
  Clock,
  ShieldAlert,
  X
} from 'lucide-react';
import type { UserRole, UserSession } from '../types';
import { EmblemOfIndia } from './EmblemOfIndia';

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
      document.documentElement.style.fontSize = '';
    } else {
      document.documentElement.style.fontSize = `${16 + newOffset * 1.5}px`;
    }
  };

  const handleSkipToContent = () => {
    const mainEl = document.querySelector('main') || document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm font-sans print:hidden">
      
      {/* 1. Indian Tricolor 3px Accent Line */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />

      {/* 2. Top GIGW 3.0 Utility Strip */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Official Government of India Header */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">🇮🇳</span>
            <span className="font-semibold tracking-wide text-slate-100">
              {currentLang === 'HI' ? 'भारत सरकार | शिक्षा मंत्रालय' : 'भारत सरकार | Government of India — Ministry of Education'}
            </span>
          </div>

          {/* Right: Accessibility & Internationalization Utility Links */}
          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-slate-300">
            <button 
              onClick={handleSkipToContent}
              className="hover:text-white transition-colors cursor-pointer underline underline-offset-2"
            >
              Skip to Main Content
            </button>
            <span className="text-slate-600">|</span>
            <span className="flex items-center space-x-1 cursor-default text-slate-400">
              <Volume2 className="w-3 h-3 text-slate-400" />
              <span>Screen Reader Access</span>
            </span>
            <span className="text-slate-600">|</span>
            {/* Font Size Adjusters */}
            <div className="inline-flex items-center space-x-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              <button 
                onClick={() => handleFontSize(-1)} 
                title="Decrease font size"
                className="px-1 text-slate-300 hover:text-white cursor-pointer font-bold"
              >
                A-
              </button>
              <button 
                onClick={() => handleFontSize(0)} 
                title="Reset font size"
                className="px-1 text-slate-300 hover:text-white cursor-pointer font-bold"
              >
                A
              </button>
              <button 
                onClick={() => handleFontSize(1)} 
                title="Increase font size"
                className="px-1 text-slate-300 hover:text-white cursor-pointer font-bold"
              >
                A+
              </button>
            </div>
            <span className="text-slate-600">|</span>
            {/* Language Switch */}
            <div className="inline-flex items-center space-x-1">
              <button
                onClick={() => setCurrentLang('EN')}
                className={`font-semibold cursor-pointer ${currentLang === 'EN' ? 'text-amber-400 underline font-bold' : 'hover:text-white'}`}
              >
                English
              </button>
              <span>/</span>
              <button
                onClick={() => setCurrentLang('HI')}
                className={`font-semibold cursor-pointer ${currentLang === 'HI' ? 'text-amber-400 underline font-bold' : 'hover:text-white'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Institutional Branding Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: State Emblem of India + Official AICTE VidyaKosh Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="shrink-0 flex items-center justify-center p-0.5 bg-slate-50 border border-slate-200 rounded">
              <EmblemOfIndia size={42} color="#1E3A8A" />
            </div>

            <div className="h-10 w-px bg-slate-300 hidden sm:block" />

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700">
                  All India Council for Technical Education (AICTE) • Regulation Bureau
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>VidyaKosh — Centralized e-FDR &amp; Security Deposit Portal</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-sans hidden md:block">
                Statutory Regulatory Corpus under Approval Process Handbook (APH 2026-31) • National Single Window System (NSWS)
              </p>
            </div>
          </div>

          {/* Right: Regulatory Badges, Profile & Action Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            
            {/* UX4G & GIGW 3.0 Verified Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>UX4G / GIGW 3.0 Compliant</span>
            </div>

            {/* Circulars & Manuals Button */}
            {onOpenCirculars && (
              <button
                onClick={onOpenCirculars}
                title="Official Government Circulars, Guidelines & User Manuals"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Circulars &amp; SOPs</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                  APH
                </span>
              </button>
            )}

            {/* AICTE Requirement 7: In-App Notification Center Bell */}
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

              {/* Notification Dropdown Drawer */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-xl border border-slate-300 z-50 overflow-hidden text-xs">
                  <div className="bg-[#1E3A8A] text-white px-3.5 py-2.5 flex items-center justify-between">
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
            {currentSession ? (
              <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs text-xs">
                <div className="p-1 rounded bg-white border border-slate-200">
                  {getRoleIcon(currentSession.role)}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 text-xs max-w-[150px] truncate">
                      {currentSession.userName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(currentSession.role)}`}>
                      {getRoleDisplayName(currentSession.role)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[170px]">
                    {currentSession.designation} {currentSession.institutionPid ? `• PID: ${currentSession.institutionPid}` : ''}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out of Portal"
                  className="ml-2 flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Single Sign-On (SSO) Portal
                </span>
                <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Jan Parichay Ready</span>
                </span>
              </div>
            )}

          </div>

        </div>
      </div>

    </header>
  );
};
