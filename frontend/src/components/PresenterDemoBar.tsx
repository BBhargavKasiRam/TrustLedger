import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  RefreshCw, 
  LogOut,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import type { UserSession, UserPreset, EvaluationScenario } from '../types';

interface PresenterDemoBarProps {
  currentSession: UserSession | null;
  onLoginAs: (session: UserSession) => void;
  onLogout: () => void;
  onResetSeed: () => Promise<void>;
  isResetting: boolean;
  onNavigateToScenario?: (scenarioId: number) => void;
  presets?: UserPreset[];
  scenarios?: EvaluationScenario[];
}

export const EVALUATION_SCENARIOS = [
  {
    id: 1,
    title: 'New FDR Submission',
    subtitle: 'Document Upload & Verification',
    badge: 'MANDATE 1'
  },
  {
    id: 2,
    title: 'Validity Tracking',
    subtitle: 'Centralized Repository / Bank Gateway',
    badge: 'MANDATE 2'
  },
  {
    id: 4,
    title: 'Renewal & Replacement',
    subtitle: 'Deposit History DAG Graph',
    badge: 'MANDATE 4'
  },
  {
    id: 5,
    title: 'Discrepancy Identification',
    subtitle: 'AI Forensics & Bank Mismatch View',
    badge: 'MANDATE 5'
  },
  {
    id: 6,
    title: 'Authorized Release Processing',
    subtitle: '4-Gate Refund Workflow',
    badge: 'MANDATE 6'
  }
];

export const DEMO_PRESETS: { label: string; icon: string; session: UserSession }[] = [
  {
    label: 'Apex Institute (Clean Matured ₹35L)',
    icon: '🏫',
    session: {
      role: 'INSTITUTION_NODAL_OFFICER',
      userId: '1-100200301',
      userName: 'Dr. Rameshwar Sharma',
      designation: 'Registrar & Nodal Officer',
      institutionId: 1,
      institutionPid: '1-100200301',
      institutionName: 'Apex Institute of Engineering & Technology, Jaipur'
    }
  },
  {
    label: 'Vanguard College (PGRC Dues ₹12.5L)',
    icon: '🏫',
    session: {
      role: 'INSTITUTION_NODAL_OFFICER',
      userId: '1-400500602',
      userName: 'Prof. Sneha Deshmukh',
      designation: 'Finance Officer',
      institutionId: 2,
      institutionPid: '1-400500602',
      institutionName: 'Vanguard Institute of Technology, Pune'
    }
  },
  {
    label: 'AICTE Scrutiny Officer (Regulation Desk)',
    icon: '🔍',
    session: {
      role: 'AICTE_SCRUTINY_OFFICER',
      userId: 'officer.rb@aicte-india.org',
      userName: 'Er. Amitav Sen',
      designation: 'Senior Scrutiny Officer, Regulation Bureau',
      department: 'Regulation & Approval Bureau, AICTE New Delhi'
    }
  },
  {
    label: 'Member Secretary / Competent Authority',
    icon: '🏛️',
    session: {
      role: 'COMPETENT_AUTHORITY',
      userId: 'ms@aicte-india.org',
      userName: 'Prof. Rajive Kumar',
      designation: 'Member Secretary & Competent Authority',
      department: 'Executive Council, AICTE Headquarters'
    }
  },
  {
    label: 'SBI Branch Manager (Bank Attestation Portal)',
    icon: '🏦',
    session: {
      role: 'BANK_BRANCH_MANAGER',
      userId: 'mgr.pune@sbi.co.in',
      userName: 'Mr. Rajesh Khurana',
      designation: 'Chief Branch Manager',
      bankName: 'State Bank of India (IFSC: SBIN0001234)',
      branchName: 'Shivaji Nagar Branch, Pune'
    }
  }
];

export const PresenterDemoBar: React.FC<PresenterDemoBarProps> = ({
  currentSession,
  onLoginAs,
  onLogout,
  onResetSeed,
  isResetting,
  onNavigateToScenario,
  presets,
  scenarios
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Dynamically map scenarios and presets from backend DB if provided
  const activeScenarios = (scenarios && scenarios.length > 0)
    ? scenarios.filter(s => s.id !== 3).map(s => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        badge: `MANDATE ${s.id}`
      }))
    : EVALUATION_SCENARIOS;

  const activePresets: { label: string; icon: string; session: UserSession }[] = (presets && presets.length > 0)
    ? presets.map(p => ({
        label: p.label || p.user_name,
        icon: p.icon || '👤',
        session: {
          role: p.role,
          userId: p.user_id,
          userName: p.user_name,
          designation: p.designation,
          department: p.department,
          institutionId: p.institution_id,
          institutionPid: p.institution_pid,
          institutionName: p.institution_name,
          bankName: p.bank_name,
          branchName: p.branch_name,
        }
      }))
    : DEMO_PRESETS;

  // SIH26265 Evaluation Checklist State (Scenarios verified by default)
  const [checkedScenarios, setCheckedScenarios] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    4: true,
    5: true,
    6: true,
  });

  const toggleScenario = (id: number) => {
    setCheckedScenarios(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden font-sans">
      {/* Floating Dark Pill Trigger */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          title="Demo & Presentation Controls (Role Switcher & Scenario Jumps)"
          className="flex items-center space-x-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl border border-gray-700 cursor-pointer text-xs font-semibold transition-all hover:scale-105 group backdrop-blur-xs"
        >
          <Settings className="w-4 h-4 text-orange-400 group-hover:rotate-90 transition-transform" />
          <span>⚙️ Demo Controls</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      ) : (
        /* Expanded Floating Presenter Panel */
        <div className="bg-white rounded-lg border-2 border-gray-900 shadow-2xl w-[420px] max-w-[95vw] max-h-[88vh] overflow-y-auto p-4 text-xs space-y-3.5 text-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-gray-900 text-orange-400">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Demo Controls &amp; Tools</h4>
                <p className="text-[10px] text-gray-500">Presentation &amp; evaluation utilities (isolated from portal)</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* JURY EVALUATION MATRIX: SIH26265 EVALUATION SCENARIOS CHECK              */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
              <div className="flex items-center space-x-1.5">
                <CheckSquare className="w-4 h-4 text-blue-900" />
                <h5 className="font-bold text-blue-950 text-xs tracking-tight">
                  SIH26265 Evaluation Scenarios Check
                </h5>
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#1a365d] text-white px-2 py-0.5 rounded">
                {Object.values(checkedScenarios).filter(Boolean).length}/6 VERIFIED
              </span>
            </div>

            <p className="text-[10px] text-gray-600 leading-tight">
              Official testing scenarios demanded in problem statement SIH26265. Click Jump to inspect each feature live:
            </p>

            <div className="space-y-1.5">
              {activeScenarios.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-white border border-blue-100 hover:border-blue-300 transition shadow-2xs"
                >
                  <label className="flex items-start space-x-2 cursor-pointer select-none min-w-0">
                    <input
                      type="checkbox"
                      checked={!!checkedScenarios[item.id]}
                      onChange={() => toggleScenario(item.id)}
                      className="mt-0.5 rounded text-blue-900 focus:ring-blue-600 accent-blue-900 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-[11px] truncate flex items-center gap-1">
                        <span>{item.id}. {item.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </label>
                  <button
                    onClick={() => {
                      onNavigateToScenario?.(item.id);
                      setIsOpen(false);
                    }}
                    title={`Jump to Mandate ${item.id}: ${item.title}`}
                    className="shrink-0 flex items-center space-x-1 px-2.5 py-1 bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-[10px] rounded border border-blue-900 cursor-pointer transition shadow-xs whitespace-nowrap"
                  >
                    <span>Jump</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Active Session Status */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-900 block">Active Session</span>
              <span className="font-semibold text-gray-900 truncate block max-w-[200px]">
                {currentSession ? currentSession.userName : 'Public Portal (Logged Out)'}
              </span>
              <span className="text-[10px] text-blue-700 font-mono">
                {currentSession ? currentSession.role : 'PUBLIC_GUEST'}
              </span>
            </div>
            {currentSession ? (
              <button
                onClick={() => {
                  onLogout();
                }}
                className="flex items-center space-x-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold cursor-pointer shadow-sm transition"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                SSO Ready
              </span>
            )}
          </div>

          {/* Quick Role Switcher Buttons */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block mb-1.5">
              1. Instant Session Switcher:
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {activePresets.map((preset, idx) => {
                const isActive = currentSession?.userId === preset.session.userId;
                return (
                  <button
                    key={idx}
                    onClick={() => onLoginAs(preset.session)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition border cursor-pointer ${
                      isActive
                        ? 'bg-[#1a365d] text-white border-[#1a365d] font-bold shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span>{preset.icon}</span>
                      <span className="truncate text-[11px]">{preset.label}</span>
                    </div>
                    {isActive && (
                      <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Database Button */}
          <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">Restore clean demo state:</span>
            <button
              onClick={onResetSeed}
              disabled={isResetting}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold border border-gray-300 text-[11px] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin text-orange-600' : ''}`} />
              <span>Reset Demo DB</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
