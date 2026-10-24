import React from 'react';
import { 
  ShieldCheck, 
  UserCircle2, 
  Building2, 
  Landmark, 
  FileCheck2, 
  Crown, 
  BookOpen,
  LogOut
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
  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return <Building2 className="w-4 h-4 text-sky-300" />;
      case 'AICTE_SCRUTINY_OFFICER':
        return <FileCheck2 className="w-4 h-4 text-emerald-300" />;
      case 'COMPETENT_AUTHORITY':
        return <Crown className="w-4 h-4 text-amber-300" />;
      case 'BANK_BRANCH_MANAGER':
        return <Landmark className="w-4 h-4 text-purple-300" />;
      default:
        return <UserCircle2 className="w-4 h-4 text-blue-200" />;
    }
  };

  const getRoleBadgeStyle = (role?: UserRole) => {
    switch (role) {
      case 'INSTITUTION_NODAL_OFFICER':
        return 'bg-sky-900/80 text-sky-200 border-sky-400/40';
      case 'AICTE_SCRUTINY_OFFICER':
        return 'bg-emerald-900/80 text-emerald-200 border-emerald-400/40';
      case 'COMPETENT_AUTHORITY':
        return 'bg-amber-900/80 text-amber-200 border-amber-400/40';
      case 'BANK_BRANCH_MANAGER':
        return 'bg-purple-900/80 text-purple-200 border-purple-400/40';
      default:
        return 'bg-blue-900/80 text-blue-200 border-blue-400/40';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1a365d] text-white border-b-4 border-orange-500 shadow-md">
      {/* Top Tiranga Micro-Strip */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 w-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Official AICTE / NIC Government Branding */}
          <div className="flex items-center space-x-3.5 min-w-max">
            <div className="flex items-center justify-center w-12 h-12 rounded bg-white text-[#1a365d] p-1 shadow border border-orange-400">
              <ShieldCheck className="w-8 h-8 text-[#1a365d]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold tracking-wide text-orange-400">
                  Regulation &amp; Approval Bureau
                </span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                AICTE — Security Deposit / FDR Management Portal
              </h1>
              <p className="text-[10px] text-blue-200/90 font-sans hidden sm:block">
                All India Council for Technical Education (Statutory Body under Ministry of Education, Govt. of India)
              </p>
            </div>
          </div>

          {/* Right Action Section: User Profile & Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Latest Circulars Quick Access Button */}
            <button
              onClick={onOpenCirculars}
              title="Official Government Circulars, Guidelines & User Manuals"
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-2.5 py-1.5 rounded text-xs font-semibold shadow-sm transition border border-orange-400/50 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline">Circulars &amp; Manuals</span>
              <span className="bg-white/20 text-white text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                NEW
              </span>
            </button>

            {/* Authenticated User Session Profile Chip */}
            {currentSession ? (
              <div className="flex items-center space-x-2.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded text-xs">
                <div className="p-1 rounded bg-black/20">
                  {getRoleIcon(currentSession.role)}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white text-xs max-w-[160px] truncate">
                      {currentSession.userName}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono ${getRoleBadgeStyle(currentSession.role)}`}>
                      {currentSession.institutionPid || currentSession.role.split('_')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-200 truncate max-w-[180px]">
                    {currentSession.designation}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out of Portal"
                  className="ml-2 flex items-center space-x-1 bg-red-700/80 hover:bg-red-700 text-white px-2 py-1 rounded text-[11px] font-semibold border border-red-500/50 cursor-pointer shadow-sm transition"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              /* Public / Logged Out Action */
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <span>Portal Login</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
