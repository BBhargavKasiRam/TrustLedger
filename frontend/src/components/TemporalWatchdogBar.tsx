import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FastForward, 
  RotateCcw, 
  Bell, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  X,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import type { TemporalTimeTravelResponse } from '../types';
import { api } from '../services/api';

interface TemporalWatchdogBarProps {
  currentSimulatedDate: string;
  onTimeTravelExecuted: (response: TemporalTimeTravelResponse) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const TemporalWatchdogBar: React.FC<TemporalWatchdogBarProps> = ({
  currentSimulatedDate,
  onTimeTravelExecuted,
  isOpen,
  onToggle
}) => {
  const [activeOffset, setActiveOffset] = useState<number>(0);
  const [customDays, setCustomDays] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [latestSweep, setLatestSweep] = useState<TemporalTimeTravelResponse | null>(null);
  const [showFeed, setShowFeed] = useState<boolean>(true);

  const handleTimeJump = async (days: number) => {
    setIsRunning(true);
    try {
      const res = await api.triggerTimeTravel(days);
      setActiveOffset(days);
      setLatestSweep(res);
      setShowFeed(true);
      onTimeTravelExecuted(res);
    } catch (err) {
      console.error('Time travel simulation failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL_OVERDUE':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH_URGENCY_T30':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM_REMINDER_T60':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'EARLY_NOTICE_T90':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HIGH_FRAUD_ALERT':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="w-full transition-all duration-200">
      {/* Collapsed Bar Trigger (if not open) */}
      {!isOpen && (
        <div 
          onClick={onToggle}
          className="cursor-pointer bg-white border border-gray-300 hover:border-orange-500 rounded p-3 shadow-sm flex items-center justify-between transition-all group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded bg-orange-50 border border-orange-200 text-orange-600 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                  Temporal SLA Watchdog Simulator
                </span>
                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-300 font-semibold">
                  Feature 3 Active
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Simulated Date: <span className="font-mono text-blue-900 font-bold">{currentSimulatedDate}</span> (Offset: {activeOffset > 0 ? `+${activeOffset}d` : 'Today'}) • Click to expand chronological sweep controls
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-blue-900 font-bold group-hover:underline transition-transform hidden sm:inline">
              Open Time-Travel Console
            </span>
            <ChevronDown className="w-4 h-4 text-blue-900" />
          </div>
        </div>
      )}

      {/* Expanded Interactive Watchdog Controller */}
      {isOpen && (
        <div className="bg-white border border-gray-300 rounded shadow-sm p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded bg-orange-50 border border-orange-200 text-orange-600">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-[#1a365d] tracking-tight">
                    AICTE Temporal SLA Watchdog & Automated Escalation Engine
                  </h3>
                  <span className="text-[10px] bg-blue-50 text-[#1a365d] font-bold px-2 py-0.5 rounded border border-blue-200">
                    CRON SIMULATOR
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Simulates daily chronological sweeps across all institutional deposits, recalculating <span className="font-mono text-gray-800 font-semibold">(maturity_date - simulated_date)</span> and triggering statutory T-90, T-60, T-30, and Lock-in Breach escalation notices.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span className="text-gray-600 font-medium">Active Date:</span>
                <span className="text-blue-900 font-mono font-bold text-sm">{currentSimulatedDate}</span>
                <span className="text-xs font-mono text-gray-500">({activeOffset === 0 ? 'Today' : `+${activeOffset}d`})</span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition border border-gray-300 cursor-pointer"
                title="Collapse Time-Travel Bar"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick-Jump Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider min-w-max">
              Quick Time-Jumps:
            </span>

            {/* Reset Today */}
            <button
              onClick={() => handleTimeJump(0)}
              disabled={isRunning || activeOffset === 0}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold border transition cursor-pointer ${
                activeOffset === 0
                  ? 'bg-green-50 text-green-800 border-green-300 font-bold'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
              } disabled:opacity-50`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Reset: Today (2026-10-24)</span>
            </button>

            {/* +30 Days */}
            <button
              onClick={() => handleTimeJump(30)}
              disabled={isRunning}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold border transition cursor-pointer ${
                activeOffset === 30
                  ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300'
              } disabled:opacity-50`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>⏩ +30 Days (T-60 / T-30 Shifts)</span>
            </button>

            {/* +60 Days */}
            <button
              onClick={() => handleTimeJump(60)}
              disabled={isRunning}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold border transition cursor-pointer ${
                activeOffset === 60
                  ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              } disabled:opacity-50`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>⏩ +60 Days (Simulates Maturity Breach)</span>
            </button>

            {/* +90 Days */}
            <button
              onClick={() => handleTimeJump(90)}
              disabled={isRunning}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold border transition cursor-pointer ${
                activeOffset === 90
                  ? 'bg-red-600 text-white border-red-700 shadow-sm'
                  : 'bg-red-50 hover:bg-red-100 text-red-900 border-red-300'
              } disabled:opacity-50`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>⏩ +90 Days (Full Escalation Wave)</span>
            </button>

            {/* Custom Input */}
            <div className="flex items-center space-x-1.5 bg-white border border-gray-300 rounded px-2 py-1 ml-auto">
              <span className="text-[11px] text-gray-600 font-medium">Custom Days:</span>
              <input
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                className="w-14 bg-gray-50 text-gray-900 text-xs px-1.5 py-0.5 rounded border border-gray-300 text-center font-mono focus:outline-none"
              />
              <button
                onClick={() => handleTimeJump(customDays)}
                disabled={isRunning}
                className="text-[11px] bg-[#1a365d] hover:bg-blue-900 text-white px-2.5 py-0.5 rounded font-semibold cursor-pointer shadow-sm"
              >
                Go
              </button>
            </div>
          </div>

          {/* Live Notification Feed / Alert Banner */}
          {latestSweep && showFeed && (
            <div className="bg-gray-50 border border-gray-300 rounded p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-gray-900 tracking-wide">
                    Watchdog Sweep Results ({latestSweep.simulated_date})
                  </span>
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded border border-green-300 font-mono">
                    {latestSweep.transitions_triggered} Transitions Triggered
                  </span>
                  <span className="text-[10px] text-gray-600">
                    ({latestSweep.total_instruments_scanned} total instruments evaluated)
                  </span>
                </div>
                <button
                  onClick={() => setShowFeed(false)}
                  className="text-gray-500 hover:text-gray-700 text-xs p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {latestSweep.escalation_notices.length === 0 ? (
                <div className="text-xs text-gray-600 flex items-center space-x-2 py-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>All instruments already in synchronized equilibrium for this simulated date. No new transition threshold crossed.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {latestSweep.escalation_notices.map((notice, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-2.5 space-y-1 text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-900">{notice.fdr_uid}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(notice.severity)}`}>
                          {notice.severity}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium text-[11px] leading-snug">
                        {notice.message}
                      </p>

                      {/* Regulatory Escalation Action Badges (X-Factor #6) */}
                      {(notice.severity === 'HIGH_URGENCY_T30' || (notice.days_remaining !== undefined && notice.days_remaining <= 30 && notice.days_remaining > 0) || notice.message.includes('T-30')) && (
                        <div className="pt-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
                            <MessageSquare className="w-3 h-3 text-green-700" />
                            <span>WhatsApp & SMS Alert Automatically Dispatched to College Principal</span>
                          </span>
                        </div>
                      )}

                      {(notice.severity === 'CRITICAL_OVERDUE' || (notice.days_remaining !== undefined && notice.days_remaining <= 0) || notice.message.includes('Maturity Exceeded')) && (
                        <div className="pt-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white border border-red-700 shadow-sm animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-white" />
                            <span>⚠ COMPLIANCE AT RISK: Soft-Hold Applied to Annual Extension of Approval (EoA)</span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                        <span className="text-gray-700 font-semibold">{notice.institution_name}</span>
                        <span className="text-[#1a365d] font-medium">To: {notice.recipient}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
