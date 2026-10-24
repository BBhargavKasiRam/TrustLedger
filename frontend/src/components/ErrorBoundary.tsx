import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[AICTE ERROR BOUNDARY] Module "${this.props.moduleName || 'Portal'}" caught an unhandled error:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border-2 border-amber-300 rounded-lg p-6 shadow-sm my-4 text-center max-w-2xl mx-auto font-sans">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto mb-3 border border-amber-300">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300 font-mono inline-block">
            REGULATORY FAILSAFE ACTIVE
          </span>
          <h3 className="text-base font-bold text-gray-900 mt-2">
            Module Temporarily Unavailable
          </h3>
          <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
            {this.props.moduleName || 'The selected regulatory module'} encountered a runtime rendering exception. System failsafe protection prevented the application from terminating.
          </p>
          {this.state.error && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2 text-left font-mono text-[10px] text-gray-600 my-3 max-h-24 overflow-y-auto">
              {this.state.error.message}
            </div>
          )}
          <div className="mt-4 flex items-center justify-center space-x-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1a365d] hover:bg-blue-900 text-white rounded text-xs font-semibold cursor-pointer shadow-sm transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Module</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
