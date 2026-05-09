'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Cadence] Critical Runtime Failure:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white uppercase tracking-tight">System Integrity Disrupted</h1>
              <p className="text-xs text-white/40 leading-relaxed">
                A critical runtime error has occurred. Your session data has been preserved, but the interface requires a refresh to restore stability.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-cyan-400 transition-all mx-auto shadow-xl"
            >
              <RefreshCcw size={14} /> Restore Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
