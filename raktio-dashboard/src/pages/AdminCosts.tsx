import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Cpu, Brain, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminCosts() {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-500" /> Model & Cost Control
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitoraggio spesa LLM, routing modelli e anomalie di costo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Budget: On Track
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><DollarSign className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total LLM Spend</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">€12,450</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><TrendingDown className="w-3 h-3" /> -8% vs mese scorso</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><TrendingUp className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Cost per Simulation</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">€0.85</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">Avg across all tenants</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Cpu className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">DeepSeek Usage</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">78%</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">Simulation & runtime tasks</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Brain className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Claude Sonnet Usage</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">22%</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">Reports & planning</p>
            </div>
          </div>
        </div>

        {/* Model Routing Policy Table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/80">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Model Routing Policy</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-4">Route</th>
                  <th className="p-4">Model</th>
                  <th className="p-4">Avg Cost / Call</th>
                  <th className="p-4">Usage %</th>
                  <th className="p-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Simulation</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50 rounded-md text-[10px] font-bold uppercase">deepseek-chat</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€0.003</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '52%' }}></div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">52%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Report</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50 rounded-md text-[10px] font-bold uppercase">claude-sonnet</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€0.018</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: '14%' }}></div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">14%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Understanding</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50 rounded-md text-[10px] font-bold uppercase">deepseek-chat</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€0.004</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '26%' }}></div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">26%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Planning</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50 rounded-md text-[10px] font-bold uppercase">claude-sonnet</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€0.022</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: '8%' }}></div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">8%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Anomaly Alerts */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Cost Anomaly Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Spike in Claude Sonnet calls</p>
                <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">2 ore fa</span>
              </div>
              <p className="text-[10px] text-amber-600 dark:text-amber-500">Tenant "Acme Corp" ha generato 340 chiamate report in 1h (media: 45). Spesa stimata: €6.12 extra.</p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Budget threshold exceeded</p>
                <span className="text-[10px] text-rose-600 dark:text-rose-500 font-medium">6 ore fa</span>
              </div>
              <p className="text-[10px] text-rose-600 dark:text-rose-500">Daily spend ha superato il 90% del budget giornaliero (€450/€500). Auto-throttling attivato.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Unusual DeepSeek latency</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">1 giorno fa</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Latenza media DeepSeek salita a 2.4s (baseline: 0.8s). Possibile retry storm, +€180 in costi aggiuntivi.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
