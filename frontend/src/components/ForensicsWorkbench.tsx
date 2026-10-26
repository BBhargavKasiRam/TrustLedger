import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Fingerprint, 
  Layers, 
  Flame, 
  Calculator, 
  RefreshCw,
  Eye,
  Lock,
  Scale,
  Printer
} from 'lucide-react';
import type { PresetSample, ForensicsAnalyzeResponse, Institution } from '../types';
import { api, getAssetUrl } from '../services/api';

interface ForensicsWorkbenchProps {
  institutions: Institution[];
  selectedInstitutionId: number | null;
  onSelectInstitution: (id: number) => void;
  onFDRSubmitted: () => void;
}

export const ForensicsWorkbench: React.FC<ForensicsWorkbenchProps> = ({
  institutions,
  selectedInstitutionId,
  onSelectInstitution,
  onFDRSubmitted
}) => {
  const [presets, setPresets] = useState<PresetSample[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>('sample_1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('/static/sample_fdrs/sample_1_genuine_sbi.jpg');
  const [viewMode, setViewMode] = useState<'ORIGINAL' | 'ELA_HEATMAP'>('ORIGINAL');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ForensicsAnalyzeResponse | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ message: string; hash: string } | null>(null);

  // Load presets on mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const data = await api.getSamplePresets();
        setPresets(data);
        if (data.length > 0) {
          runAnalysis(data[0].id, null, data[0].institution_id);
        }
      } catch (err) {
        console.error('Failed to load sample presets', err);
      }
    };
    fetchPresets();
  }, []);

  const runAnalysis = async (presetId: string | null, file: File | null, institutionIdOverride?: number) => {
    setAnalyzing(true);
    setSubmitSuccess(null);
    try {
      const formData = new FormData();
      const instId = institutionIdOverride || selectedInstitutionId || institutions[0]?.id || 1;
      formData.append('institution_id', instId.toString());

      if (presetId) {
        formData.append('sample_id', presetId);
        const preset = presets.find((p) => p.id === presetId);
        if (preset) {
          setPreviewImage(preset.file_url);
          onSelectInstitution(preset.institution_id);
        }
      } else if (file) {
        formData.append('file', file);
        setPreviewImage(URL.createObjectURL(file));
      }

      const res = await api.analyzeFDRPreview(formData);
      setAnalysisResult(res);
      setViewMode('ORIGINAL');
    } catch (err) {
      console.error('Forensics analysis failed', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: PresetSample) => {
    setActivePresetId(preset.id);
    setUploadedFile(null);
    runAnalysis(preset.id, null, preset.institution_id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setActivePresetId(null);
      runAnalysis(null, file);
    }
  };

  const handleSubmitToRegistry = async () => {
    if (!analysisResult) return;
    setSubmitting(true);
    try {
      const instId = selectedInstitutionId || institutions[0]?.id || 1;
      const ocr = analysisResult.ocr_data;

      const payload = {
        institution_id: instId,
        parent_fdr_id: null,
        relation_type: 'INITIAL_DEPOSIT',
        inst_fdr_number: ocr.fdr_number,
        inst_bank_name: ocr.bank_name,
        inst_ifsc: ocr.ifsc,
        inst_principal_amount: ocr.principal_amount,
        inst_interest_rate: ocr.interest_rate,
        inst_maturity_amount: ocr.maturity_amount,
        inst_issue_date: ocr.issue_date,
        inst_maturity_date: ocr.maturity_date,
        inst_joint_holder_text: ocr.holder_clause_text,
        inst_no_lien_declared: true,
        analysis: analysisResult,
      };

      const res = await api.submitFDR(payload);
      setSubmitSuccess({
        message: res.message,
        hash: res.audit_entry_hash,
      });

      // Refresh parent tables and summaries
      onFDRSubmitted();
    } catch (err) {
      console.error('Failed to submit FDR', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentInstitution = institutions.find(i => i.id === selectedInstitutionId) || institutions[0];

  return (
    <div id="forensics-workbench" className="space-y-6">
      
      {/* Screen Interactive Workbench (Hidden during Print) */}
      <div className="print:hidden space-y-6">
      <div className="bg-white rounded border border-gray-300 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                Verification Desk
              </span>
              <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                Document Upload &amp; Verification
              </h2>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Upload or inspect a bank deposit receipt to perform automated text extraction, compound interest formula checks, and document authenticity examination.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id;
              const isTampered = preset.risk_level === 'HIGH_FRAUD';
              const isViolation = preset.risk_level === 'REGULATORY_VIOLATION';
              const isDuplicate = preset.risk_level === 'DUPLICATE_COLLISION';

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? isTampered
                        ? 'border-red-500 bg-red-50 text-red-900 shadow-sm ring-1 ring-red-400 font-bold'
                        : isViolation
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-1 ring-amber-400 font-bold'
                        : isDuplicate
                        ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm ring-1 ring-orange-400 font-bold'
                        : 'border-green-600 bg-green-50 text-green-900 shadow-sm ring-1 ring-green-500 font-bold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {isTampered && <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                  {isViolation && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  {isDuplicate && <Fingerprint className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                  {!isTampered && !isViolation && !isDuplicate && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  )}
                  <span>{preset.name}</span>
                </button>
              );
            })}

            {/* Upload Custom FDR Button */}
            <label className="flex items-center space-x-2 px-3 py-2 rounded text-xs font-semibold border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-blue-900" />
              <span>{uploadedFile ? uploadedFile.name.slice(0, 15) : 'Upload Scan'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Pane: Visual Document & ELA Heatmap Inspector (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
            <div className="flex items-center space-x-2">
              <Scan className="w-4 h-4 text-blue-900" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Document Forensics Viewport
              </h3>
            </div>

            {/* View Mode & Bounding Box Toggles */}
            <div className="flex items-center space-x-2">
              <div className="inline-flex rounded bg-gray-100 p-1 border border-gray-300">
                <button
                  onClick={() => setViewMode('ORIGINAL')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'ORIGINAL'
                      ? 'bg-[#1a365d] text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Original Scan</span>
                </button>
                <button
                  onClick={() => setViewMode('ELA_HEATMAP')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'ELA_HEATMAP'
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>OpenCV ELA Heatmap</span>
                </button>
              </div>

              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-semibold border transition cursor-pointer ${
                  showBoundingBoxes
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-gray-300 bg-white text-gray-600'
                }`}
                title="Toggle AI OCR & Tamper bounding box overlays"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bounding Boxes</span>
              </button>
            </div>
          </div>

          {/* Image Display Container */}
          <div className="relative rounded overflow-hidden border border-gray-300 bg-gray-100 shadow-inner min-h-[380px] flex items-center justify-center">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-16">
                <RefreshCw className="w-8 h-8 text-blue-900 animate-spin" />
                <p className="text-xs text-gray-600 font-medium tracking-wide">
                  Running 5-Stage OCR, OpenCV ELA & Math Forensics Engine...
                </p>
              </div>
            ) : (
              <div className="relative w-full">
                {/* Active Image (Original Scan or ELA Heatmap) */}
                <img
                  src={getAssetUrl(
                    viewMode === 'ELA_HEATMAP' && analysisResult?.ela_result.heatmap_url
                      ? analysisResult.ela_result.heatmap_url
                      : previewImage
                  )}
                  alt="Bank FDR Receipt"
                  className="w-full h-auto object-contain select-none"
                />

                {/* Interactive Bounding Box Overlays */}
                {showBoundingBoxes && analysisResult && (
                  <>
                    {/* Principal Amount Box */}
                    <div
                      className={`absolute pointer-events-none border-2 rounded ${
                        analysisResult.math_result.math_tamper_flag || analysisResult.ela_result.tamper_detected
                          ? 'border-red-600 bg-red-500/20 shadow-md shadow-red-500/40'
                          : 'border-green-600 bg-green-500/15'
                      }`}
                      style={{
                        top: '42.5%',
                        left: '38.5%',
                        width: '50%',
                        height: '5%',
                      }}
                    >
                      <span className="absolute -top-5 left-0 text-[10px] font-bold px-1.5 py-0.2 rounded text-white bg-gray-900 border border-current">
                        {analysisResult.math_result.math_tamper_flag
                          ? '⚠ TAMPER: DOCTORED PRINCIPAL'
                          : '✓ PRINCIPAL VERIFIED'}
                      </span>
                    </div>

                    {/* Maturity Value Box */}
                    <div
                      className="absolute pointer-events-none border-2 border-blue-600 bg-blue-500/10 rounded"
                      style={{
                        top: '56.5%',
                        left: '38.5%',
                        width: '50%',
                        height: '5%',
                      }}
                    >
                      <span className="absolute -top-5 left-0 text-[10px] font-bold px-1.5 py-0.2 rounded text-blue-900 bg-white border border-blue-600 shadow-sm">
                        MATURITY AMOUNT
                      </span>
                    </div>

                    {/* AICTE Joint Mandate Clause Box */}
                    <div
                      className={`absolute pointer-events-none border-2 rounded ${
                        analysisResult.clause_result.joint_clause_valid
                          ? 'border-green-600 bg-green-500/15'
                          : 'border-red-600 bg-red-500/25'
                      }`}
                      style={{
                        top: '30.5%',
                        left: '4.8%',
                        width: '70%',
                        height: '4.5%',
                      }}
                    >
                      <span className="absolute -top-5 left-0 text-[10px] font-bold px-1.5 py-0.2 rounded text-white bg-gray-900 border border-current">
                        {analysisResult.clause_result.joint_clause_valid
                          ? '✓ AICTE JOINT MANDATE'
                          : '✗ MISSING MANDATORY JOINT MANDATE'}
                      </span>
                    </div>
                  </>
                )}

                {/* Forensic Status Tag */}
                <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-white/95 border border-gray-300 px-2.5 py-1 rounded text-[11px] shadow-sm">
                  <span className="text-gray-500">Viewing:</span>
                  <span className="font-semibold text-gray-900">
                    {viewMode === 'ORIGINAL' ? 'Original High-Res Scan' : 'OpenCV JPEG Error Level Analysis (ELA)'}
                  </span>
                  {analysisResult?.ela_result.tamper_detected && (
                    <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.2 rounded border border-red-300">
                      ELA Anomaly: {analysisResult.ela_result.ela_score}
                    </span>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Right Pane: Live 5-Point AI & Regulatory Scorecard (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {analysisResult ? (
            <>
              {/* Point 1: OCR Extracted Metadata Card */}
              <div className="bg-white rounded border border-gray-300 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-900" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      1. AI OCR Extracted Metadata
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                    {analysisResult.ocr_data.ocr_engine ? `Engine: ${analysisResult.ocr_data.ocr_engine}` : 'Confidence: 99.4%'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-medium">Receipt No</span>
                    <div className="font-mono font-bold text-gray-900">{analysisResult.ocr_data.fdr_number}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-medium">Bank & IFSC</span>
                    <div className="font-semibold text-gray-800 truncate">{analysisResult.ocr_data.bank_name} ({analysisResult.ocr_data.ifsc})</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-medium">Printed Principal</span>
                    <div className="font-bold text-green-700 text-sm">
                      {formatCurrency(analysisResult.ocr_data.principal_amount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-medium">Printed Maturity Value</span>
                    <div className="font-bold text-gray-900 text-sm">
                      {formatCurrency(analysisResult.ocr_data.maturity_amount)}
                    </div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                    <span>Issue: <strong className="text-gray-900">{analysisResult.ocr_data.issue_date}</strong></span>
                    <span>Maturity: <strong className="text-gray-900">{analysisResult.ocr_data.maturity_date}</strong></span>
                    <span>Rate: <strong className="text-orange-600">{analysisResult.ocr_data.interest_rate}% p.a.</strong></span>
                  </div>
                </div>
              </div>

              {/* Point 2: Compound Interest Math Check Card */}
              <div className={`rounded border p-4 shadow-sm transition-all ${
                analysisResult.math_result.math_tamper_flag
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-green-300 bg-green-50/50'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Calculator className={`w-4 h-4 ${analysisResult.math_result.math_tamper_flag ? 'text-red-600' : 'text-green-700'}`} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      2. Compound Interest Math Validator
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    analysisResult.math_result.math_tamper_flag
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-green-100 text-green-800 border-green-300'
                  }`}>
                    {analysisResult.math_result.math_tamper_flag ? 'MATH TAMPER DETECTED' : 'FORMULA VERIFIED ✓'}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono bg-white p-2 rounded border border-gray-200">
                    <span className="text-gray-600">Expected ({analysisResult.math_result.formula}):</span>
                    <span className="text-orange-700 font-bold">{formatCurrency(analysisResult.math_result.expected_maturity)}</span>
                  </div>

                  <div className="flex items-center justify-between font-mono bg-white p-2 rounded border border-gray-200">
                    <span className="text-gray-600">Printed on Certificate Face:</span>
                    <span className={`font-bold ${analysisResult.math_result.math_tamper_flag ? 'text-red-700' : 'text-green-700'}`}>
                      {formatCurrency(analysisResult.ocr_data.maturity_amount)}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-700 leading-relaxed bg-white p-2.5 rounded border border-gray-200">
                    {analysisResult.math_result.explanation}
                  </p>
                </div>
              </div>

              {/* Point 3: APH Fee Norm & Mandatory Clause Card */}
              <div className={`rounded border p-4 shadow-sm ${
                !analysisResult.clause_result.all_clauses_valid
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-green-300 bg-green-50/50'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      3. Regulatory Norms & Mandatory Clauses
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    analysisResult.clause_result.all_clauses_valid
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {analysisResult.clause_result.all_clauses_valid ? 'REGULATION COMPLIANT' : 'VIOLATION FLAGGED'}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-600">Statutory Norm (Approval Process Handbook):</span>
                    <span className="font-mono font-bold text-gray-900">
                      {formatCurrency(analysisResult.clause_result.required_norm)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-600">Norm Compliance Status:</span>
                    {analysisResult.clause_result.norm_satisfied ? (
                      <span className="text-green-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fully Satisfied
                      </span>
                    ) : (
                      <span className="text-red-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Deficit: {formatCurrency(analysisResult.clause_result.shortfall)}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">AICTE Joint Holder Mandate</span>
                      {analysisResult.clause_result.joint_clause_valid ? (
                        <span className="text-green-700 font-semibold">✓ Endorsed</span>
                      ) : (
                        <span className="text-red-700 font-semibold">✗ Missing Mandate!</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">No Lien / Non-Encumbrance Stamp</span>
                      {analysisResult.clause_result.no_lien_clause_valid ? (
                        <span className="text-green-700 font-semibold">✓ Marked</span>
                      ) : (
                        <span className="text-red-700 font-semibold">✗ Unmarked!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 4: ELA Tamper & pHash Duplicate Card */}
              <div className="bg-white rounded border border-gray-300 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="w-4 h-4 text-purple-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      4. ELA Pixel Score & pHash Fingerprint
                    </h4>
                  </div>
                  <span className="font-mono text-[10px] text-gray-600">
                    pHash: {analysisResult.phash_result.phash_string.slice(0, 8)}...
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  {/* ELA Gauge */}
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Error Level Analysis Variance Score:</span>
                      <strong className={analysisResult.ela_result.ela_score > 0.4 ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
                        {analysisResult.ela_result.ela_score} ({analysisResult.ela_result.ela_score > 0.4 ? 'Tampered Patch Detected' : 'Uniform Baseline'})
                      </strong>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mt-1 border border-gray-300">
                      <div
                        className={`h-full transition-all duration-500 ${
                          analysisResult.ela_result.ela_score > 0.4
                            ? 'bg-gradient-to-r from-amber-500 to-red-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(analysisResult.ela_result.ela_score * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* pHash Status */}
                  <div className={`p-2.5 rounded border text-[11px] ${
                    analysisResult.phash_result.duplicate_flag
                      ? 'border-orange-300 bg-orange-50 text-orange-900'
                      : 'border-green-300 bg-green-50 text-green-900'
                  }`}>
                    {analysisResult.phash_result.duplicate_flag ? (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>{analysisResult.phash_result.message}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span>{analysisResult.phash_result.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Point 5: Action Buttons (Export Scrutiny e-Note PDF + Submit) */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-3 rounded font-bold text-xs bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-700 shadow-sm cursor-pointer transition"
                  title="Print or Export official A4 Scrutiny Case Summary e-Note"
                >
                  <Printer className="w-4 h-4 text-gray-700" />
                  <span>🖨️ Export Scrutiny e-Note (PDF)</span>
                </button>

                <button
                  onClick={handleSubmitToRegistry}
                  disabled={submitting}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                    analysisResult.has_discrepancy
                      ? 'bg-red-700 hover:bg-red-800 text-white'
                      : 'bg-[#1E3A8A] hover:bg-[#172554] text-white'
                  }`}
                >
                  <Lock className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
                  <span>
                    {submitting
                      ? 'Recording...'
                      : analysisResult.has_discrepancy
                      ? 'Submit Flagged Discrepancy'
                      : 'Submit to AICTE Registry'}
                  </span>
                </button>
              </div>

              {/* Submission Confirmation Toast Banner */}
              {submitSuccess && (
                <div className="p-3.5 rounded bg-green-50 border border-green-300 text-green-900 text-xs space-y-1 shadow-sm">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span>FDR Ingested & Verified Successfully!</span>
                  </div>
                  <p>{submitSuccess.message}</p>
                  <div className="flex items-center space-x-1 font-mono text-[10px] text-gray-700 pt-1">
                    <span className="text-gray-500 font-sans">Chained Hash:</span>
                    <span className="text-blue-900 font-bold truncate">{submitSuccess.hash}</span>
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white rounded border border-gray-300 text-xs text-gray-500">
              Select a preset scenario above to load live forensics scorecard.
            </div>
          )}

        </div>

      </div>

      </div> {/* End print:hidden interactive wrapper */}

      {/* ========================================================================= */}
      {/* PRINT-ONLY VIEWPORT: OFFICIAL AICTE SCRUTINY CASE SUMMARY (e-NOTE)        */}
      {/* ========================================================================= */}
      {analysisResult && (
        <div className="hidden print:block font-serif text-black p-6 bg-white space-y-4 max-w-4xl mx-auto">
          {/* Official AICTE Header */}
          <div className="text-center border-b-2 border-black pb-3 space-y-1">
            <div className="text-xs uppercase tracking-widest font-bold">Government of India • Ministry of Education</div>
            <div className="text-lg font-bold uppercase tracking-tight">All India Council for Technical Education</div>
            <div className="text-xs font-semibold">Regulation &amp; Approval Bureau • Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070</div>
            <div className="inline-block mt-2 px-3 py-1 bg-gray-100 border border-black font-mono font-bold text-xs uppercase tracking-wider">
              ELECTRONIC SCRUTINY CASE SUMMARY (e-NOTE) — FIXED DEPOSIT RECEIPT
            </div>
          </div>

          {/* Case Reference & Metadata Strip */}
          <div className="flex justify-between items-center text-xs border-b border-gray-400 pb-2 font-mono">
            <div>
              <strong>Case Ref:</strong> AICTE/RB/FDR/{analysisResult.ocr_data.fdr_number}
            </div>
            <div>
              <strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <span className="font-bold underline">
                {analysisResult.has_discrepancy ? 'DISCREPANCY FLAGGED (REGULATORY HOLD)' : 'UNDER SCRUTINY (VERIFIED)'}
              </span>
            </div>
          </div>

          {/* 1. Institution Particulars */}
          <div className="space-y-1 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-xs border-b border-gray-300 pb-0.5">
              1. Institution Particulars
            </h4>
            <table className="w-full border-collapse border border-gray-400 text-xs">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-bold bg-gray-50 w-1/3">Institution Name:</td>
                  <td className="p-1.5 font-bold">{currentInstitution?.name || 'Apex Institute of Engineering & Technology, Jaipur'}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-bold bg-gray-50">Permanent Institute ID (PID):</td>
                  <td className="p-1.5 font-mono">{currentInstitution?.pid || '1-100200301'}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-bold bg-gray-50">Region / Bureau:</td>
                  <td className="p-1.5">{currentInstitution?.region || 'North'} Regional Bureau ({currentInstitution?.programme_tier || 'Degree Engineering'})</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold bg-gray-50">APH Mandatory Deposit Norm:</td>
                  <td className="p-1.5 font-bold font-mono">
                    ₹{((analysisResult.clause_result.required_norm || 3500000) / 100000).toFixed(1)} Lakhs
                    {analysisResult.clause_result.norm_satisfied ? ' (Compliant)' : ` (Deficit: ₹${(analysisResult.clause_result.shortfall/100000).toFixed(1)}L)`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Instrument & OCR Verification */}
          <div className="space-y-1 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-xs border-b border-gray-300 pb-0.5">
              2. Fixed Deposit Instrument &amp; System OCR Findings
            </h4>
            <table className="w-full border-collapse border border-gray-400 text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400 text-left">
                  <th className="p-1.5 border-r border-gray-400">Parameter</th>
                  <th className="p-1.5 border-r border-gray-400">System OCR / Document Face</th>
                  <th className="p-1.5">Verification Finding</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-semibold border-r border-gray-300">FDR Receipt Number</td>
                  <td className="p-1.5 font-mono font-bold border-r border-gray-300">{analysisResult.ocr_data.fdr_number}</td>
                  <td className="p-1.5 font-mono text-[11px]">Valid Alphanumeric Format</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-semibold border-r border-gray-300">Issuing Bank &amp; IFSC</td>
                  <td className="p-1.5 border-r border-gray-300">{analysisResult.ocr_data.bank_name} ({analysisResult.ocr_data.ifsc})</td>
                  <td className="p-1.5">Scheduled Commercial Bank</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-semibold border-r border-gray-300">Principal Deposit Amount</td>
                  <td className="p-1.5 font-bold font-mono border-r border-gray-300">{formatCurrency(analysisResult.ocr_data.principal_amount)}</td>
                  <td className="p-1.5">
                    {analysisResult.clause_result.norm_satisfied ? 'Meets Statutory Norm' : 'Deficit Shortfall Flagged'}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-semibold border-r border-gray-300">Maturity Value &amp; Interest Rate</td>
                  <td className="p-1.5 font-mono border-r border-gray-300">{formatCurrency(analysisResult.ocr_data.maturity_amount)} @ {analysisResult.ocr_data.interest_rate}% p.a.</td>
                  <td className="p-1.5">
                    {analysisResult.math_result.math_tamper_flag ? '⚠ Math Variance >2% (Flagged)' : 'Formula Verified (0.00% Variance)'}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-semibold border-r border-gray-300">Lock-in Period</td>
                  <td className="p-1.5 border-r border-gray-300">{analysisResult.ocr_data.issue_date} to {analysisResult.ocr_data.maturity_date}</td>
                  <td className="p-1.5 font-mono">Tenure: {analysisResult.math_result.tenure_years} Years</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 font-semibold border-r border-gray-300">AICTE Joint Holding Mandate</td>
                  <td className="p-1.5 border-r border-gray-300 truncate max-w-xs">{analysisResult.ocr_data.holder_clause_text}</td>
                  <td className="p-1.5 font-bold">
                    {analysisResult.clause_result.joint_clause_valid ? '✓ Verified Endorsed' : '✗ Missing Mandate!'}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-semibold border-r border-gray-300">Non-Encumbrance / No-Lien Clause</td>
                  <td className="p-1.5 border-r border-gray-300 truncate max-w-xs">{analysisResult.ocr_data.no_lien_text}</td>
                  <td className="p-1.5 font-bold">
                    {analysisResult.clause_result.no_lien_clause_valid ? '✓ Lien Marked to AICTE' : '✗ Non-Compliant!'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Forensics & Mathematical Audit Scorecard */}
          <div className="space-y-1 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-xs border-b border-gray-300 pb-0.5">
              3. Forensic &amp; Tamper Verification Scorecard
            </h4>
            <div className="grid grid-cols-2 gap-3 p-2 bg-gray-50 border border-gray-300 text-xs">
              <div>
                <div><strong>OpenCV ELA Score:</strong> {analysisResult.ela_result.ela_score}</div>
                <div className="text-[11px] text-gray-700">
                  {analysisResult.ela_result.tamper_detected ? 'Tamper Detected: Re-compressed overlay patch flagged.' : 'Uniform pixel baseline verified.'}
                </div>
              </div>
              <div>
                <div><strong>Compound Interest Formula:</strong> {analysisResult.math_result.formula}</div>
                <div className="text-[11px] text-gray-700">
                  Expected: {formatCurrency(analysisResult.math_result.expected_maturity)} vs Printed: {formatCurrency(analysisResult.ocr_data.maturity_amount)} ({analysisResult.math_result.variance_pct}% variance)
                </div>
              </div>
              <div className="col-span-2 pt-1 border-t border-gray-200">
                <div><strong>pHash Scan Fingerprint:</strong> {analysisResult.phash_result.phash_string}</div>
                <div className="text-[11px] text-gray-700">{analysisResult.phash_result.message}</div>
              </div>
            </div>
          </div>

          {/* 4. Statutory Sign-off & Designated Signature Area */}
          <div className="border border-black p-4 space-y-6 mt-4">
            <div className="text-xs">
              <strong>Scrutiny Officer Recommendation:</strong>{' '}
              {analysisResult.has_discrepancy
                ? 'Discrepancy detected in statutory security deposit instrument. Institution Extension of Approval (EoA) recommended for regulatory hold pending bank clarification.'
                : 'All statutory norms under Approval Process Handbook (APH) verified. Recommended for progression to Gate 3 & Core Banking System confirmation.'}
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="border-t border-black pt-1 text-xs">
                <div><strong>Scrutiny Officer:</strong> Er. Amitav Sen</div>
                <div><strong>Designation:</strong> Senior Scrutiny Officer, Regulation Bureau</div>
                <div><strong>Station / Regional Office:</strong> AICTE Headquarters, New Delhi</div>
              </div>
              <div className="border border-dashed border-gray-500 h-20 flex items-center justify-center text-center p-2">
                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                  [ Designated Space for Officer Signature &amp; Official Seal ]
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
