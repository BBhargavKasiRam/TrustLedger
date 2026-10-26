import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitMerge, 
  GitCommit, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Landmark, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Hash, 
  FileText, 
  RefreshCw,
  ChevronRight,
  Zap,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import type { 
  Institution, 
  LineageGraphResponse, 
  LineageGraphNode, 
  LinkRenewalRequest 
} from '../types';
import { api } from '../services/api';

interface DAGLineageWorkbenchProps {
  institutions: Institution[];
  selectedInstitutionId: number | null;
  onSelectInstitution: (id: number) => void;
  onRefreshAll: () => void;
}

export const DAGLineageWorkbench: React.FC<DAGLineageWorkbenchProps> = ({
  institutions,
  selectedInstitutionId,
  onSelectInstitution,
  onRefreshAll
}) => {
  // Graph state
  const [graphData, setGraphData] = useState<LineageGraphResponse | null>(null);
  const [loadingGraph, setLoadingGraph] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<LineageGraphNode | null>(null);

  // Linker Form state
  const [parentFdrUid, setParentFdrUid] = useState<string>('FDR-2020-205');
  const [relationType, setRelationType] = useState<string>('MATURITY_RENEWAL');
  const [newFdrNumber, setNewFdrNumber] = useState<string>('FDR-2026-710');
  const [newBankName, setNewBankName] = useState<string>('Canara Bank');
  const [newIfsc, setNewIfsc] = useState<string>('CNRB0001234');
  const [newPrincipal, setNewPrincipal] = useState<number>(3500000);
  const [newRate, setNewRate] = useState<number>(7.40);
  const [newMaturityDate, setNewMaturityDate] = useState<string>('2031-10-24');
  const [newIssueDate, setNewIssueDate] = useState<string>('2026-10-24');
  const [renewalReason, setRenewalReason] = useState<string>(
    'Statutory 5-year lock-in renewal under AICTE Approval Process Handbook (APH 2026-31).'
  );
  const [submittingRenewal, setSubmittingRenewal] = useState<boolean>(false);
  const [commitSuccessHash, setCommitSuccessHash] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  // Countdown Matrix state
  const [countdownList, setCountdownList] = useState<any[]>([]);
  const [loadingCountdown, setLoadingCountdown] = useState<boolean>(false);

  // Load Graph for selected institution
  const loadGraph = async (instId?: number) => {
    setLoadingGraph(true);
    try {
      const activeInstId = instId || selectedInstitutionId || institutions[0]?.id || 1;
      const res = await api.getInstitutionLineage(activeInstId);
      setGraphData(res);
      if (res.nodes.length > 0) {
        // Select the active/leaf node by default or root
        const activeNode = res.nodes.find(n => n.lifecycle_status !== 'RENEWED_SUPERSEDED') || res.nodes[res.nodes.length - 1];
        setSelectedNode(activeNode || res.nodes[0]);
        if (activeNode) {
          setParentFdrUid(activeNode.fdr_uid);
        }
      }
    } catch (err) {
      console.error('Failed to load lineage graph:', err);
    } finally {
      setLoadingGraph(false);
    }
  };

  // Load Countdown Matrix from Watchdog
  const loadCountdown = async () => {
    setLoadingCountdown(true);
    try {
      const res = await api.triggerTimeTravel(0);
      setCountdownList(res.countdown_matrix || []);
    } catch (err) {
      console.error('Failed to load countdown matrix:', err);
    } finally {
      setLoadingCountdown(false);
    }
  };

  useEffect(() => {
    loadGraph();
    loadCountdown();
  }, [selectedInstitutionId]);

  // Preset 1: Auto-Fill Canara Renewal 2026->2031
  const handleAutoFillRenewal = () => {
    const parent = selectedNode || (graphData?.nodes && graphData.nodes[graphData.nodes.length - 1]);
    const parentUid = parent?.fdr_uid || 'FDR-2020-205';
    const parentBank = parent?.bank_name || 'Canara Bank';
    const parentIfsc = parent?.ifsc || 'CNRB0001234';
    const parentAmt = parent?.principal_amount || 3500000;
    const parentMat = parent?.maturity_date || '2026-10-24';
    const matYear = parseInt(parentMat.slice(0, 4), 10) || 2026;
    const nextMat = `${matYear + 5}${parentMat.slice(4)}`;

    setParentFdrUid(parentUid);
    setRelationType('MATURITY_RENEWAL');
    setNewFdrNumber(`FDR-${matYear}-RNW`);
    setNewBankName(parentBank);
    setNewIfsc(parentIfsc);
    setNewPrincipal(parentAmt);
    setNewRate(7.40);
    setNewIssueDate(parentMat);
    setNewMaturityDate(nextMat);
    setRenewalReason('Statutory 5-year lock-in renewal under AICTE Approval Process Handbook (APH 2026-31).');
  };

  // Preset 2: Auto-Fill Bank Merger Migration
  const handleAutoFillMerger = () => {
    const rootNode = graphData?.nodes?.find(n => n.depth === 0 || n.is_root) || graphData?.nodes?.[0];
    const parentUid = rootNode?.fdr_uid || 'FDR-2016-101';
    const parentAmt = rootNode?.principal_amount || 3500000;

    setParentFdrUid(parentUid);
    setRelationType('BANK_MERGER_REPLACEMENT');
    setNewFdrNumber('FDR-2020-205');
    setNewBankName('Canara Bank');
    setNewIfsc('CNRB0001234');
    setNewPrincipal(parentAmt);
    setNewRate(7.20);
    setNewIssueDate('2020-04-15');
    setNewMaturityDate('2026-04-14');
    setRenewalReason('Bank amalgamation transition: Syndicate Bank merged into Canara Bank per Govt of India Gazette.');
  };

  // Submit Child Link to DAG
  const handleCommitRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentFdrUid) return;

    setSubmittingRenewal(true);
    setCommitSuccessHash(null);
    setCommitMessage(null);

    try {
      const payload: LinkRenewalRequest = {
        parent_fdr_uid: parentFdrUid,
        relation_type: relationType,
        new_fdr_number: newFdrNumber,
        new_bank_name: newBankName,
        new_ifsc: newIfsc,
        new_principal_amount: newPrincipal,
        new_interest_rate: newRate,
        new_issue_date: newIssueDate,
        new_maturity_date: newMaturityDate,
        renewal_reason: renewalReason,
      };

      const res = await api.linkRenewalChildFDR(payload);
      setCommitSuccessHash(res.audit_entry_hash);
      setCommitMessage(res.message);

      // Reload local graph & notify parent to refresh global stats
      await loadGraph();
      await loadCountdown();
      onRefreshAll();
    } catch (err: any) {
      console.error('Failed to commit renewal:', err);
      alert(`Commit Error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setSubmittingRenewal(false);
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'RENEWED_SUPERSEDED':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-600',
          tag: 'bg-gray-200 text-gray-700 border-gray-300',
          indicator: 'bg-gray-400'
        };
      case 'MATURED_ACTION_PENDING':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-400',
          text: 'text-amber-900',
          tag: 'bg-amber-100 text-amber-800 border-amber-300',
          indicator: 'bg-amber-500'
        };
      case 'APPROACHING_MATURITY_T30':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-400',
          text: 'text-orange-900',
          tag: 'bg-orange-100 text-orange-800 border-orange-300',
          indicator: 'bg-orange-500'
        };
      case 'DISCREPANCY_FLAGGED':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-900',
          tag: 'bg-red-100 text-red-800 border-red-300',
          indicator: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-300',
          text: 'text-gray-900',
          tag: 'bg-green-100 text-green-800 border-green-300',
          indicator: 'bg-green-600'
        };
    }
  };

  const getSlaBadge = (days: number) => {
    if (days <= 0) {
      return { text: `OVERDUE (${Math.abs(days)}d)`, style: 'bg-red-100 text-red-800 border-red-300' };
    } else if (days <= 30) {
      return { text: `T-30 WARNING (${days}d)`, style: 'bg-orange-100 text-orange-800 border-orange-300' };
    } else if (days <= 60) {
      return { text: `T-60 REMINDER (${days}d)`, style: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    } else if (days <= 90) {
      return { text: `T-90 WATCHDOG (${days}d)`, style: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else {
      return { text: `ACTIVE (${days}d)`, style: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  return (
    <div id="dag-lineage-workbench" className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-gray-300 rounded p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 mt-0.5">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  STATUTORY RECORDS
                </span>
                <span className="text-xs font-bold text-gray-600">
                  Deposit History &amp; Provenance
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight mt-0.5">
                Deposit History &amp; Maturity Surveillance
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-3xl">
                Maintains an unbroken chronological deposit history across institutional mergers, bank amalgamations, and statutory 5-year renewals to verify 8/10-year lock-in compliance.
              </p>
            </div>
          </div>

          {/* Institution Selector */}
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 p-2 rounded min-w-max">
            <Building2 className="w-4 h-4 text-blue-900" />
            <span className="text-xs text-gray-600 font-medium">Institution Record:</span>
            <select
              aria-label="Institution Lineage Filter"
              value={selectedInstitutionId || institutions[0]?.id || 1}
              onChange={(e) => {
                const newId = Number(e.target.value);
                onSelectInstitution(newId);
                loadGraph(newId);
              }}
              className="bg-transparent text-xs text-blue-950 font-bold focus:outline-none cursor-pointer pr-2"
            >
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-white text-gray-900">
                  {inst.pid} — {inst.name.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Section: Visual DAG Canvas (Left) & Renewal Linker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / TOP CANVAS: Visual DAG Graph (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <GitMerge className="w-5 h-5 text-blue-900" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Chronological Deposit Record
              </h3>
              <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-300 font-mono font-medium">
                {graphData?.nodes.length || 0} Instruments Recorded
              </span>
            </div>

            <button
              onClick={() => loadGraph()}
              disabled={loadingGraph}
              className="flex items-center space-x-1 text-xs text-gray-700 hover:text-gray-900 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loadingGraph ? 'animate-spin' : ''}`} />
              <span>Refresh DAG</span>
            </button>
          </div>

          {/* Interactive Node Graph Viewport */}
          <div className="relative min-h-[380px] bg-gray-50 rounded border border-gray-300 p-6 flex flex-col justify-center overflow-x-auto">
            {loadingGraph ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-16">
                <RefreshCw className="w-8 h-8 text-blue-900 animate-spin" />
                <span className="text-xs text-gray-600">Traversing parent_fdr_id pointers...</span>
              </div>
            ) : !graphData || graphData.nodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                No instruments found for this institution.
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                
                {/* Horizontal Chronological Git Flow */}
                <div className="flex items-center space-x-4 min-w-max py-4">
                  {graphData.nodes.map((node, index) => {
                    const colors = getNodeColor(node.lifecycle_status);
                    const isSelected = selectedNode?.id === node.id;
                    const edgeToNext = graphData.edges.find(e => e.source === node.fdr_uid);

                    return (
                      <React.Fragment key={node.id}>
                        
                        {/* Node Card: Clean, White Official Government Document Card */}
                        <div
                          onClick={() => {
                            setSelectedNode(node);
                            setParentFdrUid(node.fdr_uid);
                          }}
                          className={`cursor-pointer w-72 rounded bg-white border-2 transition-all duration-200 relative group shadow-sm overflow-hidden ${
                            isSelected 
                              ? 'ring-2 ring-blue-900 border-[#1a365d] shadow-md scale-[1.02]' 
                              : 'border-gray-300 hover:border-blue-700 hover:shadow-md'
                          }`}
                        >
                          {/* Official Top Tricolor/Header Strip */}
                          <div className={`px-3 py-1.5 flex items-center justify-between text-[10px] font-bold border-b ${
                            node.is_root
                              ? 'bg-[#1a365d] text-white border-blue-950'
                              : node.lifecycle_status === 'RENEWED_SUPERSEDED'
                              ? 'bg-gray-100 text-gray-700 border-gray-300'
                              : 'bg-blue-50 text-blue-950 border-blue-200'
                          }`}>
                            <div className="flex items-center space-x-1.5">
                              <ShieldCheck className={`w-3.5 h-3.5 ${node.is_root ? 'text-orange-400' : 'text-blue-900'}`} />
                              <span className="uppercase tracking-wider font-mono">
                                Node #{index + 1} {node.is_root ? '• GENESIS ROOT' : '• RENEWAL CHILD'}
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${colors.tag}`}>
                              {node.lifecycle_status === 'RENEWED_SUPERSEDED' ? 'SUPERSEDED' : node.lifecycle_status}
                            </span>
                          </div>

                          <div className="p-3.5 space-y-2.5">
                            {/* Bank Name & UID */}
                            <div className="border-b border-gray-100 pb-2">
                              <div className="flex items-center space-x-1.5 font-bold text-gray-900 text-sm">
                                <Landmark className="w-4 h-4 text-blue-900 shrink-0" />
                                <span className="truncate">{node.bank_name}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-mono font-extrabold text-[#1a365d] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  {node.fdr_uid}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  IFSC: {node.ifsc || '—'}
                                </span>
                              </div>
                            </div>

                            {/* Financial Data Grid */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2 rounded border border-gray-200">
                              <div>
                                <span className="text-gray-500 block text-[9px] uppercase font-bold">Principal Deposit</span>
                                <span className="font-bold text-gray-900 text-xs">
                                  ₹{(node.principal_amount || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 block text-[9px] uppercase font-bold">Annual Rate</span>
                                <span className="font-bold text-gray-900 text-xs">{node.interest_rate}% p.a.</span>
                              </div>
                              <div className="col-span-2 pt-1 border-t border-gray-200">
                                <span className="text-gray-500 block text-[9px] uppercase font-bold">Lock-In Window</span>
                                <span className="font-mono text-[10px] text-gray-700 font-semibold">
                                  {node.issue_date} → {node.maturity_date}
                                </span>
                              </div>
                            </div>

                            {/* Provenance Record Indicator */}
                            <div className="pt-1 flex items-center justify-between text-[10px]">
                              <span className="text-gray-600 font-medium">
                                {node.parent_fdr_uid ? `Status: Re-issued (Bank Merger)` : 'Initial Deposit (Genesis Root)'}
                              </span>
                              <span className="text-blue-900 font-semibold group-hover:underline flex items-center">
                                {isSelected ? '● Inspected' : 'Inspect Details'}
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Directed Edge: Distinct Blue Arrow */}
                        {edgeToNext && (
                          <div className="flex flex-col items-center justify-center space-y-1.5 px-2">
                            <div className="text-[10px] font-bold px-2.5 py-1 rounded bg-white text-blue-900 border-2 border-blue-500 font-mono shadow-sm">
                              {edgeToNext.label}
                            </div>
                            <svg width="72" height="24" className="overflow-visible">
                              <defs>
                                <marker id={`arrow-${index}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#1d4ed8" />
                                </marker>
                              </defs>
                              <line
                                x1="0"
                                y1="12"
                                x2="62"
                                y2="12"
                                stroke="#1d4ed8"
                                strokeWidth="3"
                                markerEnd={`url(#arrow-${index})`}
                              />
                            </svg>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Next Deposit Instrument Entry Slot */}
                  <div className="border-2 border-dashed border-blue-500 rounded p-4 w-60 bg-blue-50/30 flex flex-col justify-center items-center text-center space-y-1.5">
                    <FileText className="w-5 h-5 text-blue-900" />
                    <span className="text-xs font-bold text-blue-900">
                      Record Renewal / Transfer
                    </span>
                    <p className="text-[10px] text-gray-600 leading-tight">
                      Register the next 5-year extension or bank merger record using the official form on the right.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Selected Node Detailed Inspector Card */}
          {selectedNode && (
            <div className="bg-gray-50 border border-gray-300 rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-900" />
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Node Provenance Certificate: {selectedNode.fdr_uid}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-300 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-green-700" /> Zero Historical Drift
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">Bank & Branch IFSC</span>
                  <span className="font-semibold text-gray-800">{selectedNode.bank_name}</span>
                  <span className="font-mono text-[11px] text-[#1a365d] block font-bold">{selectedNode.ifsc}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Locked Deposit</span>
                  <span className="font-bold text-gray-900 text-sm">
                    ₹{(selectedNode.principal_amount || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-gray-600 block">Maturity: ₹{(selectedNode.maturity_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Lifecycle State</span>
                  <span className="font-bold text-orange-700">{selectedNode.lifecycle_status}</span>
                  <span className="text-[11px] text-gray-600 block">Relation: {selectedNode.relation_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Parent Instrument</span>
                  <span className="font-mono text-gray-800 font-semibold">
                    {selectedNode.parent_fdr_uid || 'None (Genesis Root)'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">Cryptographic Block Hash:</span>
                  <span className="font-mono text-[10px] text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-300 font-medium">
                    {selectedNode.audit_hash}
                  </span>
                </div>
                <span className="text-gray-500 text-[10px]">
                  Preserved across 10-year statutory retention
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: 1-Click Renewal & Bank Merger Replacement Linker (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                1-Click Lineage Linker & Renewal Form
              </h3>
            </div>
            <span className="text-[10px] bg-orange-50 text-orange-800 px-2 py-0.5 rounded font-mono border border-orange-300 font-bold">
              RENEWAL WORKBENCH
            </span>
          </div>

          {/* Live 1-Click Auto-Fill Demo Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
              1-Click Demo Evaluation Presets:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleAutoFillRenewal}
                className="w-full text-left p-2.5 rounded bg-orange-50 hover:bg-orange-100 border border-orange-300 text-xs transition cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="font-bold text-orange-900">
                    ⚡ Auto-Fill 2026→2031 Canara Bank Renewal (FDR-2026-710)
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Supersedes expiring FDR-2020-205, extends lock-in by 5 years @ 7.40%
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleAutoFillMerger}
                className="w-full text-left p-2 rounded bg-gray-50 hover:bg-gray-100 border border-gray-300 text-xs transition cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    ⚡ Auto-Fill Bank Merger Migration (Syndicate → Canara)
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Links FDR-2016-101 (Syndicate) to FDR-2020-205 (Canara)
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCommitRenewal} className="space-y-3 text-xs">
            
            {/* Parent Selector */}
            <div>
              <label className="text-gray-700 block mb-1 font-semibold">
                Parent Instrument to Supersede:
              </label>
              <select
                aria-label="Parent Instrument"
                value={parentFdrUid}
                onChange={(e) => setParentFdrUid(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 font-mono focus:border-blue-900 focus:outline-none"
              >
                {graphData?.nodes.map((n) => (
                  <option key={n.id} value={n.fdr_uid}>
                    {n.fdr_uid} — {n.bank_name} (₹{(n.principal_amount || 0).toLocaleString('en-IN')}) [{n.lifecycle_status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Relation Type */}
            <div>
              <label className="text-gray-700 block mb-1 font-semibold">
                Record Re-issuance Type:
              </label>
              <select
                aria-label="Relation Type"
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-blue-950 font-bold focus:border-blue-900 focus:outline-none"
              >
                <option value="MATURITY_RENEWAL">Renewal (5-Year Statutory Extension)</option>
                <option value="BANK_MERGER_REPLACEMENT">Status: Re-issued (Bank Merger)</option>
              </select>
            </div>

            {/* Child FDR UID & Bank Name */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-700 block mb-1 font-medium">Re-issued / Renewal FDR UID:</label>
                <input
                  type="text"
                  value={newFdrNumber}
                  onChange={(e) => setNewFdrNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 font-mono focus:border-blue-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-medium">Bank Name:</label>
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* IFSC & Principal Amount */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-700 block mb-1 font-medium">IFSC Code:</label>
                <input
                  type="text"
                  value={newIfsc}
                  onChange={(e) => setNewIfsc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-[#1a365d] font-mono font-bold focus:border-blue-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-medium">Principal Amount (₹):</label>
                <input
                  type="number"
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 font-bold focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Interest Rate & New Maturity Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-700 block mb-1 font-medium">Interest Rate (%):</label>
                <input
                  type="number"
                  step="0.05"
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 font-mono focus:border-blue-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-medium">New Maturity Date:</label>
                <input
                  type="date"
                  value={newMaturityDate}
                  onChange={(e) => setNewMaturityDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 font-mono focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Renewal Reason */}
            <div>
              <label className="text-gray-700 block mb-1 font-medium">Statutory Renewal Reason:</label>
              <textarea
                rows={2}
                value={renewalReason}
                onChange={(e) => setRenewalReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 text-[11px] focus:border-blue-900 focus:outline-none resize-none"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submittingRenewal}
              className="w-full py-2.5 px-4 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submittingRenewal ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mining SHA-256 Block & Linking DAG Node...</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-4 h-4 text-orange-400" />
                  <span>Commit Child FDR to Lineage DAG & Supersede Parent</span>
                </>
              )}
            </button>
          </form>

          {/* Success Receipt */}
          {commitSuccessHash && (
            <div className="bg-green-50 border border-green-300 rounded p-3 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-green-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <span>Deposit Record Appended Successfully!</span>
              </div>
              <p className="text-[11px] text-gray-700">{commitMessage}</p>
              <div className="pt-1.5 border-t border-green-200 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-green-700" />
                <span className="text-[10px] text-gray-600">Minted Audit Block Hash:</span>
                <span className="font-mono text-[9px] text-green-900 bg-white px-1.5 py-0.5 rounded border border-green-300 truncate max-w-[200px]">
                  {commitSuccessHash}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: T-90 / T-60 / T-30 Maturity Countdown Matrix */}
      <div id="countdown-matrix-section" className="bg-white border border-gray-300 rounded p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-900" />
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              T-90 / T-60 / T-30 Maturity Countdown & Escalation Surveillance Matrix
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-600">Sorted by Days Remaining (Ascending)</span>
            <button
              onClick={loadCountdown}
              disabled={loadingCountdown}
              className="text-xs text-gray-700 hover:text-gray-900 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loadingCountdown ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-[11px] text-gray-700 font-bold uppercase tracking-wider bg-gray-100">
                <th className="py-2.5 px-3 border-b border-gray-300">FDR Instrument</th>
                <th className="py-2.5 px-3 border-b border-gray-300">Institution</th>
                <th className="py-2.5 px-3 border-b border-gray-300">Bank & Principal</th>
                <th className="py-2.5 px-3 border-b border-gray-300">Maturity Date</th>
                <th className="py-2.5 px-3 border-b border-gray-300">Days Remaining</th>
                <th className="py-2.5 px-3 border-b border-gray-300">SLA Alert Status</th>
                <th className="py-2.5 px-3 border-b border-gray-300">Automated Escalation Recipient</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans bg-white">
              {countdownList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    Loading countdown surveillance matrix...
                  </td>
                </tr>
              ) : (
                countdownList.map((item, idx) => {
                  const sla = getSlaBadge(item.days_remaining);
                  return (
                    <tr 
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* FDR UID */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                        {item.fdr_uid}
                      </td>

                      {/* Institution */}
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {item.institution_name}
                      </td>

                      {/* Bank & Principal */}
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-gray-800 block">{item.bank_name || 'Scheduled Bank'}</span>
                        <span className="font-mono text-[11px] text-green-700 font-bold">
                          ₹{(item.principal || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Maturity Date */}
                      <td className="py-2.5 px-3 font-mono text-gray-700">
                        {item.maturity_date}
                      </td>

                      {/* Days Remaining & Visual Progress Bar */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sla.style}`}>
                            {sla.text}
                          </span>
                        </div>
                        <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              item.days_remaining <= 0 
                                ? 'bg-red-600 w-full' 
                                : item.days_remaining <= 30 
                                ? 'bg-orange-500 w-3/4' 
                                : item.days_remaining <= 60 
                                ? 'bg-amber-500 w-1/2' 
                                : item.days_remaining <= 90 
                                ? 'bg-blue-600 w-1/3' 
                                : 'bg-green-600 w-1/4'
                            }`}
                          />
                        </div>
                      </td>

                      {/* SLA Alert Status */}
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-bold text-gray-900 block">
                          {item.status}
                        </span>

                        {/* Regulatory Escalation Action Badges (X-Factor #6) */}
                        {item.days_remaining <= 30 && item.days_remaining > 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
                              <MessageSquare className="w-3 h-3 text-green-700 shrink-0" />
                              <span>WhatsApp & SMS Alert Automatically Dispatched to College Principal</span>
                            </span>
                          </div>
                        )}

                        {item.days_remaining <= 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white border border-red-700 shadow-sm animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-white shrink-0" />
                              <span>⚠ COMPLIANCE AT RISK: Soft-Hold Applied to Annual Extension of Approval (EoA)</span>
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Automated Escalation Recipient */}
                      <td className="py-2.5 px-3 text-[11px] text-[#1a365d] font-semibold">
                        {item.recipient}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
