import React, { useState } from 'react';
import {
  GitCompare, TrendingUp, TrendingDown, Activity, Users,
  CheckCircle2, ChevronDown, BarChart3, ArrowRight,
  ShieldAlert, Zap, Save, Copy, Download, FileText, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const MOCK_SIMULATIONS = [
  { id: 1, name: 'Feature X Launch (Standard)', agents: '10,000', date: '12 Oct 2026' },
  { id: 2, name: 'Feature X Launch (Aggressive Pricing)', agents: '10,000', date: '14 Oct 2026' },
  { id: 3, name: 'Rebranding Q4', agents: '25,000', date: '15 Oct 2026' },
  { id: 4, name: 'New Pricing Model', agents: '10,000', date: '13 Oct 2026' },
];

export default function CompareLab() {
  const navigate = useNavigate();
  const [baseId, setBaseId] = useState(1);
  const [targetId, setTargetId] = useState(2);
  const [showBaseSelect, setShowBaseSelect] = useState(false);
  const [showTargetSelect, setShowTargetSelect] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const base = MOCK_SIMULATIONS.find(s => s.id === baseId)!;
  const target = MOCK_SIMULATIONS.find(s => s.id === targetId)!;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="font-medium text-sm">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100/50 dark:border-slate-800/50 px-8 py-6 sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Compare Lab
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Compare simulation results side-by-side to optimize your strategy.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => showToast('Comparison saved')} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => showToast('Comparison cloned as new')} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
              <Copy className="w-4 h-4" /> Clone
            </button>
            <button onClick={() => showToast('Exporting A/B report...')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-8">

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-8">
          {/* Base Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowBaseSelect(!showBaseSelect); setShowTargetSelect(false); }}
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex items-center justify-between cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors text-left"
            >
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Base (A)</p>
                <h3 className="font-bold text-slate-900 dark:text-white">{base.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{base.agents} Agents • {base.date}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </button>
            {showBaseSelect && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95">
                {MOCK_SIMULATIONS.filter(s => s.id !== targetId).map(s => (
                  <button key={s.id} onClick={() => { setBaseId(s.id); setShowBaseSelect(false); }} className={cn("w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors", s.id === baseId && "bg-blue-50 dark:bg-blue-900/20")}>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.agents} Agents • {s.date}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Target Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowTargetSelect(!showTargetSelect); setShowBaseSelect(false); }}
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors text-left"
            >
              <div>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Target (B)</p>
                <h3 className="font-bold text-slate-900 dark:text-white">{target.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{target.agents} Agents • {target.date}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </button>
            {showTargetSelect && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95">
                {MOCK_SIMULATIONS.filter(s => s.id !== baseId).map(s => (
                  <button key={s.id} onClick={() => { setTargetId(s.id); setShowTargetSelect(false); }} className={cn("w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors", s.id === targetId && "bg-indigo-50 dark:bg-indigo-900/20")}>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.agents} Agents • {s.date}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evidence Quality */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Evidence Quality: High</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Both simulations completed with same audience size and platform. Comparison is statistically meaningful.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold">Comparable</span>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
            <Activity className="w-5 h-5 text-blue-400" /> Executive Summary
          </h2>

          <div className="grid grid-cols-4 gap-4 relative z-10">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Winner</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="font-bold text-blue-400">A</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Base (A)</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Lower risk</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delta Sentiment</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">+26%</span>
                <span className="text-sm text-slate-400 mb-1">favoring A</span>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Toxic Drift Risk</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-rose-400">3x</span>
                <span className="text-sm text-slate-400 mb-1">higher in B</span>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Belief Shift Gap</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-blue-400">20%</span>
                <span className="text-sm text-slate-400 mb-1">delta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delta Sections */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none overflow-hidden">
          <div className="p-6 border-b border-slate-100/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/80">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Key Metrics Delta
            </h2>
          </div>

          <div className="divide-y divide-slate-100/50 dark:divide-slate-700/50">
            {[
              { metric: 'Positive Sentiment', desc: 'Percentage of agents in favor.', a: 68, b: 42, unit: '%', better: 'higher' },
              { metric: 'Toxic Drift', desc: 'Speed of dissent spread.', a: 12, b: 38, unit: '%', better: 'lower' },
              { metric: 'Belief Shift', desc: 'Agents who changed from opposing to supporting.', a: 15, b: -5, unit: '%', better: 'higher' },
              { metric: 'Engagement Rate', desc: 'Average interactions per agent.', a: 4.2, b: 2.8, unit: 'x', better: 'higher' },
            ].map((row, i) => {
              const aWins = row.better === 'higher' ? row.a > row.b : row.a < row.b;
              const delta = row.a - row.b;
              return (
                <div key={i} className="p-6 grid grid-cols-[1fr_2fr_2fr] gap-8 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{row.metric}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-16 text-2xl font-bold", aWins ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>{row.a}{row.unit === '%' ? '%' : ''}</div>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: `${Math.abs(row.a)}%` }}></div>
                    </div>
                    {aWins && <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">Best</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-16 text-2xl font-bold", !aWins ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>{row.b}{row.unit === '%' ? '%' : ''}</div>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", !aWins ? "bg-indigo-500 dark:bg-indigo-400" : "bg-rose-500 dark:bg-rose-400")} style={{ width: `${Math.abs(row.b)}%` }}></div>
                    </div>
                    <div className={cn("flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md", delta > 0 ? "text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30" : "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30")}>
                      {delta > 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      {delta > 0 ? `-${delta}` : `+${Math.abs(delta)}`}{row.unit === '%' ? '%' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Segment Deltas */}
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Segment Impact Delta
            </h3>
            <div className="space-y-4">
              {[
                { segment: 'Indie Developers', deltaA: '+12%', deltaB: '-28%', direction: 'divergent' },
                { segment: 'Enterprise CTOs', deltaA: '+8%', deltaB: '+6%', direction: 'similar' },
                { segment: 'Marketing Managers', deltaA: '+4%', deltaB: '-18%', direction: 'divergent' },
              ].map((seg, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{seg.segment}</span>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-sm font-bold", seg.deltaA.startsWith('+') ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>A: {seg.deltaA}</span>
                    <span className={cn("text-sm font-bold", seg.deltaB.startsWith('+') ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>B: {seg.deltaB}</span>
                    {seg.direction === 'divergent' && <ShieldAlert className="w-4 h-4 text-amber-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 rounded-2xl p-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Insight: Base (A)
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200/80 leading-relaxed">
                Standard communication maintained stable core target. Analytic personality agents (INTJ, INTP) appreciated feature clarity without being distracted by aggressive pricing levers.
              </p>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100/50 dark:border-rose-800/30 rounded-2xl p-6">
              <h3 className="font-bold text-rose-900 dark:text-rose-300 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" /> Insight: Target (B)
              </h3>
              <p className="text-sm text-rose-800 dark:text-rose-200/80 leading-relaxed">
                Aggressive pricing triggered negative cascade in "Budget-conscious" clusters. Agent Marco R. (Patient Zero) created an echo chamber that collapsed overall sentiment within 2 simulated hours.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
