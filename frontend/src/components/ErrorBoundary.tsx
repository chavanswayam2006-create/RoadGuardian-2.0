import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="hud-card hud-brackets p-4 bg-slate-900/90 border-amber-500/40 flex flex-col items-center justify-center min-h-[200px] text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mb-2 animate-bounce" />
          <h3 className="font-mono text-sm font-bold text-amber-300 uppercase tracking-wider mb-1">
            {this.props.fallbackTitle || 'SUBSYSTEM STANDBY'}
          </h3>
          <p className="text-xs font-mono text-slate-400 max-w-sm mb-3">
            {this.state.error?.message || 'A tactical component encountered a temporary state reset.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REARM SUBSYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
