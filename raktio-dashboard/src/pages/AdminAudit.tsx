import React from 'react';
import { ScrollText, Search, Filter, Calendar, ChevronDown, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminAudit() {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-indigo-600 dark:text-indigo-500" /> Audit Logs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Registro completo delle attivita della piattaforma e azioni utente.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold">
              2,847 events today
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by user or action..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Last 7 days</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-medium">All Actions</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Audit Table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/80">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 09:42:11</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">MR</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Mario Rossi</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-md text-[10px] font-bold uppercase">Login</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">auth/session</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">192.168.1.45</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 09:38:05</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px]">LB</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Laura Bianchi</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-md text-[10px] font-bold uppercase">Simulation Created</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">sim/SIM-2847</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">10.0.0.12</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 09:25:33</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">GV</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Giulia Verdi</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50 rounded-md text-[10px] font-bold uppercase">Report Generated</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">report/RPT-1204</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">172.16.0.8</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 08:55:19</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]">AN</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Admin Neri</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 rounded-md text-[10px] font-bold uppercase">Plan Changed</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">tenant/TechStartup</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">192.168.1.10</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 08:30:47</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]">AN</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Admin Neri</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50 rounded-md text-[10px] font-bold uppercase">Pricing Updated</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">billing/plan-enterprise</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">192.168.1.10</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 08:12:03</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">MR</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Mario Rossi</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-md text-[10px] font-bold uppercase">Member Invited</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">team/paolo@acme.com</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">192.168.1.45</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 07:58:44</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[10px]">??</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Unknown</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 rounded-md text-[10px] font-bold uppercase">Login Failed</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">auth/session</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">85.214.132.7</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Denied</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">2026-04-15 07:45:22</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">GV</div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Giulia Verdi</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-md text-[10px] font-bold uppercase">Login</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">auth/session</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">172.16.0.8</td>
                  <td className="p-4 text-right"><span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
