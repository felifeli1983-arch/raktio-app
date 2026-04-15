import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <div className={cn(
            "max-w-md w-full text-center p-8",
            "bg-white dark:bg-slate-800/50 rounded-2xl",
            "shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none",
            "border border-slate-100/50 dark:border-slate-700/50"
          )}>
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-rose-500 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
            </p>
            <button
              onClick={this.handleReset}
              className="bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors px-6 py-2.5"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
