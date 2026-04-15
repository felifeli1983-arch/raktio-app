import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Raktio</span>
          </Link>
          <Link to="/overview" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Go to Dashboard →
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Choose your plan</h1>

          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-medium", !isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <div className={cn(
                "absolute top-1 left-1 w-6 h-6 rounded-full bg-blue-600 transition-transform",
                isAnnual ? "translate-x-6" : "translate-x-0"
              )}></div>
            </button>
            <span className={cn("text-sm font-medium flex items-center gap-2", isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>
              Annual <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs font-bold">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Free */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">€0</span>
              <span className="text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">5 credits/month</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">Max 500 agents</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">1 sim at a time</span></li>
            </ul>
            <button className="w-full py-3 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-600 dark:hover:border-blue-500 transition-colors">
              Start free
            </button>
          </div>

          {/* Starter */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">€{isAnnual ? '23' : '29'}</span>
              <span className="text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">30 credits/month</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">Max 2,000 agents</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">PDF Export</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">Ask the Crowd</span></li>
            </ul>
            <button className="w-full py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Choose Starter
            </button>
          </div>

          {/* Growth */}
          <div className="bg-white dark:bg-slate-800/50 border-2 border-blue-600 rounded-3xl p-8 shadow-xl dark:shadow-[0_0_30px_rgba(37,99,235,0.15)] relative flex flex-col transform md:-translate-y-4 transition-colors duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Most popular
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Growth</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">€{isAnnual ? '79' : '99'}</span>
              <span className="text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">120 credits/month</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">Max 5,000 agents</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">A/B Compare</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">Team up to 3</span></li>
            </ul>
            <button className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20">
              Choose Growth
            </button>
          </div>

          {/* Business */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Business</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">€{isAnnual ? '239' : '299'}</span>
              <span className="text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">500 credits/month</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">Max 10,000 agents</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">API access</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">Unlimited team</span></li>
            </ul>
            <button className="w-full py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Choose Business
            </button>
          </div>
        </div>

        {/* Enterprise Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-slate-300 dark:text-slate-400">1M+ agents, multi-country, dedicated support and custom models.</p>
          </div>
          <button className="px-8 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
}
