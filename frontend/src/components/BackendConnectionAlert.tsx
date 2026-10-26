import React, { useState } from 'react';
import { 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  Globe, 
  Check, 
  ChevronDown, 
  ChevronUp,
  X,
  Server
} from 'lucide-react';
import { 
  getResolvedBackendUrl, 
  getApiBase, 
  setRuntimeBackendUrl, 
  clearRuntimeBackendUrl 
} from '../services/api';

interface BackendConnectionAlertProps {
  error: string | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const BackendConnectionAlert: React.FC<BackendConnectionAlertProps> = ({
  error,
  onRetry,
  isRetrying = false
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [inputUrl, setInputUrl] = useState(() => getResolvedBackendUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!error || dismissed) return null;

  const currentBackend = getResolvedBackendUrl();
  const currentApiBase = getApiBase();
  const isCloudTarget = Boolean(currentBackend);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setRuntimeBackendUrl(inputUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRetry();
  };

  const handleReset = () => {
    clearRuntimeBackendUrl();
    setInputUrl('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRetry();
  };

  return (
    <div className="bg-red-50 border-b-2 border-red-500 shadow-md text-red-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main Error Message & Target Status */}
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-red-100 rounded-full mt-0.5 shrink-0 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-red-950">
                  Backend API Connection Notice
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-red-200/80 text-red-800">
                  Target: {currentApiBase}
                </span>
              </div>
              <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                {error}
              </p>
              {isCloudTarget ? (
                <p className="text-[11px] text-red-700 mt-1">
                  ⏳ <strong>Cloud Sleep Notice:</strong> If your backend is hosted on Render (free tier), it spins down after inactivity. Waking it up takes <strong>35–50 seconds</strong>. Please click "Retry Connection".
                </p>
              ) : (
                <p className="text-[11px] text-red-700 mt-1">
                  ⚠️ <strong>Vercel Env Notice:</strong> No cloud BACKEND_URL detected in current build. If you added <code className="bg-red-100 px-1 py-0.5 rounded font-mono font-bold">BACKEND_URL</code> in Vercel settings, you must <strong>Redeploy</strong> in Vercel for it to take effect, or enter it below for immediate connection.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Connecting...' : 'Retry Connection'}</span>
            </button>

            <button
              onClick={() => setShowConfig(prev => !prev)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-red-300 hover:bg-red-100 text-red-800 rounded text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-red-600" />
              <span>Configure Backend URL</span>
              {showConfig ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={() => setDismissed(true)}
              title="Dismiss Notice"
              className="p-1.5 text-red-500 hover:text-red-800 rounded hover:bg-red-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Configuration Drawer */}
        {showConfig && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <form onSubmit={handleSave} className="bg-white/90 p-4 rounded-lg border border-red-200 shadow-inner">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Direct Backend URL (e.g. Render / Cloud URL):
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://aicte-fdr-backend.onrender.com"
                      className="block w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded shadow-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1a365d] hover:bg-blue-900 text-white rounded text-xs font-semibold shadow-sm cursor-pointer transition-colors flex items-center space-x-1"
                  >
                    {savedSuccess ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Server className="w-3.5 h-3.5" />}
                    <span>{savedSuccess ? 'Saved & Reconnected!' : 'Save & Connect'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded text-xs font-medium shadow-xs cursor-pointer transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1">
                <p className="font-semibold text-gray-800">
                  💡 How to make this permanent on Vercel:
                </p>
                <ol className="list-decimal list-inside pl-1 space-y-0.5 text-gray-600">
                  <li>In Vercel Dashboard, go to your project $\rightarrow$ <strong>Settings</strong> $\rightarrow$ <strong>Environment Variables</strong>.</li>
                  <li>Add variable name: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-800">BACKEND_URL</code> with your backend link (e.g. <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-800">https://your-backend.onrender.com</code>).</li>
                  <li><strong>Important:</strong> Go to <strong>Deployments</strong> tab $\rightarrow$ click the three dots (<code className="font-mono">...</code>) on the latest commit $\rightarrow$ click <strong>Redeploy</strong>. Vite inlines environment variables during the build step!</li>
                </ol>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
