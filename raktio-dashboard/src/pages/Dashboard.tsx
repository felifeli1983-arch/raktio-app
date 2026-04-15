import React, { useState, useEffect } from 'react';
import { PageLoading, PageError } from '../components/PageStates';
import {
  Activity, Zap, Users, BarChart3,
  ArrowRight, PlusCircle, Clock, CheckCircle2,
  TrendingUp, ShieldAlert, AlertTriangle, FileText,
  GitCompare, Fingerprint, Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const RECENT_SIMULATIONS = [
  { id: 1, name: 'Feature X Launch (Standard)', status: 'completed', date: 'Today, 14:30', agents: '10k', sentiment: '+26%', risk: 'Low' },
  { id: 2, name: 'Rebranding Q4', status: 'running', date: 'Running', agents: '25k', sentiment: '...', risk: 'High' },
  { id: 3, name: 'New Pricing Model', status: 'completed', date: 'Yesterday', agents: '10k', sentiment: '-15%', risk: 'Critical' },
];

const RECENT_REPORTS = [
  { id: 'REP-001', name: 'Q3 Reputation Crisis Analysis', risk: 'High', date: '12 Oct' },
  { id: 'REP-002', name: 'Product "Alpha" Launch', risk: 'Low', date: '05 Oct' },
];

const ALERTS = [
  { type: 'warning', message: 'Simulation "Rebranding Q4" exceeded Toxic Drift threshold (38%)', time: '2 min ago' },
  { type: 'info', message: 'Report "New Pricing Model" ready for review', time: '15 min ago' },
  { type: 'success', message: 'Audience "EU Tech Leaders" generated successfully (12k agents)', time: '1 hour ago' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 0); }} />;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto transition-colors duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Workspace Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Operational status of your simulation intelligence.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/knowledge')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Database className="w-4 h-4" /> Knowledge
            </button>
            <button
              onClick={() => navigate('/sim/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> New Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Top Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-shadow">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Simulations</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">24</span>
              <span className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> 1 Running
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-shadow">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Reports Ready</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">18</span>
              <span className="text-xs font-bold text-blue-500 mb-1">+3 this week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-shadow">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Synthetic Population</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">142k</span>
              <span className="text-xs font-bold text-blue-500 mb-1">+12k this month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-shadow">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Avg. Belief Shift</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">12.4%</span>
              <span className="text-xs font-bold text-emerald-500 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2.1%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Recent Simulations — 2 col */}
          <div className="col-span-2 bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Active & Recent Simulations
              </h2>
              <button
                onClick={() => navigate('/simulations')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {RECENT_SIMULATIONS.map(sim => (
                <div key={sim.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(sim.status === 'running' ? `/sim/${sim.id}/canvas` : `/reports/${sim.id}`)}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      sim.status === 'running' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}>
                      {sim.status === 'running' ? <Activity className="w-5 h-5 animate-pulse" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{sim.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sim.date} • {sim.agents} Agents</p>
                    </div>
                  </div>

                  {sim.status === 'completed' && (
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Sentiment</p>
                          <p className={cn("text-sm font-bold", sim.sentiment.startsWith('+') ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {sim.sentiment}
                          </p>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Risk</p>
                          <p className={cn("text-sm font-bold flex items-center gap-1", sim.risk === 'Low' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {sim.risk === 'Critical' && <ShieldAlert className="w-3 h-3" />}
                            {sim.risk}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  )}

                  {sim.status === 'running' && (
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
                        Running...
                      </span>
                      <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Alerts + Quick Actions */}
          <div className="space-y-6">

            {/* Alerts & Signals */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Alerts & Signals
                </h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {ALERTS.map((alert, i) => (
                  <div key={i} className="p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        alert.type === 'warning' ? "bg-amber-500" : alert.type === 'success' ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                      <div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/sim/new')} className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors text-left group shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
                <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">New Simulation</p>
              </button>
              <button onClick={() => navigate('/compare')} className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors text-left group shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
                <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Compare Lab</p>
              </button>
              <button onClick={() => navigate('/agents')} className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors text-left group shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
                <Fingerprint className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Agent Atlas</p>
              </button>
              <button onClick={() => navigate('/reports')} className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors text-left group shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">View Reports</p>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Recent Reports + Intelligence */}
        <div className="grid grid-cols-2 gap-6">

          {/* Recent Reports */}
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Recent Reports
              </h2>
              <button onClick={() => navigate('/reports')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">View all</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {RECENT_REPORTS.map(report => (
                <div key={report.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/reports/${report.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{report.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{report.id} • {report.date}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-lg border",
                    report.risk === 'High' ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/50" :
                    "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50"
                  )}>
                    {report.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10">
              <h3 className="text-sm font-bold text-blue-200 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-300 dark:text-blue-400" /> Intelligence Summary
              </h3>

              <div className="space-y-4">
                <div className="bg-white/10 dark:bg-slate-900/50 border border-white/10 dark:border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-200 dark:text-slate-400 uppercase tracking-wider mb-1">Top Finding</p>
                  <p className="text-sm text-white font-medium">Pricing changes trigger 3x higher toxic drift in the "Indie Dev" segment vs Enterprise.</p>
                </div>

                <div className="bg-white/10 dark:bg-slate-900/50 border border-white/10 dark:border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-200 dark:text-slate-400 uppercase tracking-wider mb-1">Trending Topic</p>
                  <p className="text-sm text-white font-medium">Agent cluster around "data privacy" growing — 14% of opposing stance agents now reference it.</p>
                </div>

                <div className="bg-white/10 dark:bg-slate-900/50 border border-white/10 dark:border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-200 dark:text-slate-400 uppercase tracking-wider mb-1">Population Health</p>
                  <p className="text-sm text-white font-medium">Memory freshness: 89% of agents have post-simulation memory updates within the last 7 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
