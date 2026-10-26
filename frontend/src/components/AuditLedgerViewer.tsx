import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Link2, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Lock, 
  Copy, 
  Check 
} from 'lucide-react';
import type { AuditLog, AuditVerifyResponse } from '../types';
import { api } from '../services/api';

interface AuditLedgerViewerProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditLedgerViewer: React.FC<AuditLedgerViewerProps> = ({ logs, onRefresh }) => {
  const [verificationResult, setVerificationResult] = useState<AuditVerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="bg-white rounded border border-gray-300 shadow-sm p-6">
      
      {/* Header & Verification Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-900">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Regulatory System Audit Trail &amp; Ledger
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
                  System Verified
                </span>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Every administrative, banking, and system verification event is permanently recorded in an immutable sequential audit ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition cursor-pointer"
            title="Reload ledger from SQLite"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Records...' : 'Verify Audit Trail Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Live Verification Proof Alert Banner */}
      {verificationResult && (
        <div className={`mt-4 p-4 rounded border flex items-start space-x-3 text-xs transition-all ${
          verificationResult.integrity_verified 
            ? 'bg-green-50 border-green-300 text-green-900' 
            : 'bg-red-50 border-red-300 text-red-900'
        }`}>
          {verificationResult.integrity_verified ? (
            <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm flex items-center gap-2">
              <span>{verificationResult.integrity_verified ? 'Audit Trail Verified: Valid Official Ledger' : 'Ledger Integrity Failure Detected!'}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-current font-bold">
                {verificationResult.total_records} / {verificationResult.total_records} Records Intact
              </span>
            </div>
            <p className="text-gray-700">{verificationResult.message}</p>
            {verificationResult.latest_block_hash && (
              <div className="flex items-center space-x-1.5 pt-1 text-[11px] font-mono text-gray-700">
                <span className="text-gray-500 font-sans">Latest Head Hash:</span>
                <span className="text-blue-900 font-bold">{verificationResult.latest_block_hash}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="mt-5 overflow-x-auto rounded border border-gray-300">
        <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
          <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3.5 border-b border-gray-300">Block #</th>
              <th className="py-3 px-3.5 border-b border-gray-300">Timestamp</th>
              <th className="py-3 px-3.5 border-b border-gray-300">Actor & Authority</th>
              <th className="py-3 px-3.5 border-b border-gray-300">Action Event</th>
              <th className="py-3 px-3.5 border-b border-gray-300">Target FDR</th>
              <th className="py-3 px-3.5 border-b border-gray-300">Audit Payload Summary</th>
              <th className="py-3 px-3.5 border-b border-gray-300">Previous Block Hash</th>
              <th className="py-3 px-3.5 border-b border-gray-300">Computed Row Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {logs.map((log) => {
              const isGenesis = log.prev_hash === '0'.repeat(64);
              return (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  
                  {/* Block ID */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      #{log.id.toString().padStart(3, '0')}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'medium'
                    }) : '-'}
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{log.actor_name}</div>
                    <div className="text-[10px] text-gray-500 font-mono tracking-tight">{log.actor_role}</div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                      log.action_type.includes('TAMPER') || log.action_type.includes('ALERT')
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : log.action_type.includes('SLA')
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : log.action_type.includes('ATTESTATION') || log.action_type.includes('GENESIS')
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-blue-50 text-blue-900 border-blue-200'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>

                  {/* Target FDR */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {log.target_fdr_uid ? (
                      <span className="font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {log.target_fdr_uid}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">SYSTEM</span>
                    )}
                  </td>

                  {/* Payload Summary */}
                  <td className="py-3 px-3.5 max-w-xs text-gray-700 truncate" title={log.payload_summary}>
                    {log.payload_summary}
                  </td>

                  {/* Previous Hash */}
                  <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px]">
                    <div className="flex items-center space-x-1">
                      <span className={`${isGenesis ? 'text-gray-400 font-medium' : 'text-gray-600'}`}>
                        {isGenesis ? '00000000... (GENESIS)' : truncateHash(log.prev_hash)}
                      </span>
                      {!isGenesis && (
                        <button
                          onClick={() => copyToClipboard(log.prev_hash)}
                          className="text-gray-400 hover:text-gray-700 cursor-pointer"
                          title="Copy Prev Hash"
                        >
                          {copiedHash === log.prev_hash ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Computed Row Hash */}
                  <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px]">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-800 font-bold">
                        {truncateHash(log.row_hash)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(log.row_hash)}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        title="Copy Row Hash"
                      >
                        {copiedHash === log.row_hash ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cryptographic Linkage Footer Note */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-600 border-t border-gray-200 pt-3">
        <div className="flex items-center space-x-1.5">
          <Link2 className="w-3.5 h-3.5 text-blue-900" />
          <span>Each block's <code className="text-green-800 font-bold">row_hash</code> forms the exact <code className="text-gray-800 font-bold">prev_hash</code> of the subsequent block. Any retroactive byte tampering invalidates the chain downstream.</span>
        </div>
        <span className="text-gray-600">Total Audit Blocks: <strong className="text-gray-900 font-mono">{logs.length}</strong></span>
      </div>

    </div>
  );
};
