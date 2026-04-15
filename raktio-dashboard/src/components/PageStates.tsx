import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

/* ------------------------------------------------------------------ */
/*  PageLoading                                                       */
/* ------------------------------------------------------------------ */
export function PageLoading() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading...</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PageError                                                         */
/* ------------------------------------------------------------------ */
interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function PageError({ message, onRetry }: PageErrorProps) {
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
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors px-6 py-2.5"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PageEmpty                                                         */
/* ------------------------------------------------------------------ */
interface PageEmptyProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageEmpty({ icon: Icon, title, description, actionLabel, onAction }: PageEmptyProps) {
  return (
    <div className="h-full flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className={cn(
        "max-w-md w-full text-center p-8",
        "bg-white dark:bg-slate-800/50 rounded-2xl",
        "shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none",
        "border border-slate-100/50 dark:border-slate-700/50"
      )}>
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
          <Icon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {description}
        </p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors px-6 py-2.5"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
