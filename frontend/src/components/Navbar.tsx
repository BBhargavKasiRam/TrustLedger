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
  Volume2
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
          
          {/* Left: State Emblem of India + Official AICTE TrustLedger Identity */}
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
                <span>TrustLedger — Centralized e-FDR &amp; Security Deposit Portal</span>
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
