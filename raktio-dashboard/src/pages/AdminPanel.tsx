import React from 'react';
import { ShieldAlert, Users, Activity, Database, Server, AlertTriangle, CheckCircle2, Search, Filter, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminPanel() {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-500" /> System Administration
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestione globale della piattaforma, monitoraggio risorse e utenti.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> System: Healthy
             </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Users className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Active Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">1,248</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">+12% vs mese scorso</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Activity className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Running Simulations</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">42</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">Server load: 45%</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Database className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Synthetic Agents</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">1.4M</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">Database size: 2.4 TB</p>
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-rose-100 dark:border-rose-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 text-rose-600 dark:text-rose-400"><AlertTriangle className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">System Alerts</p>
              <h3 className="text-3xl font-bold text-rose-700 dark:text-rose-400 mb-2">3</h3>
              <p className="text-xs text-rose-600 dark:text-rose-500 font-medium flex items-center gap-1">Need attention</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Users Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Management</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search user..." className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 text-slate-900 dark:text-slate-100 placeholder-slate-400" />
                </div>
                <button className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="p-4">User</th>
                    <th className="p-4">Workspace</th>
                    <th className="p-4">Piano</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">MR</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Mario Rossi</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">mario.rossi@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">Acme Corp</td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase">Free</span></td>
                    <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span></td>
                    <td className="p-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">LB</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Laura Bianchi</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">laura@techstartup.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">TechStartup</td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-md text-[10px] font-bold uppercase">Enterprise</span></td>
                    <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span></td>
                    <td className="p-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: System Status */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" /> Service Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">OASIS Engine</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Agent Database</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">API Gateway</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> Degraded</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Security Log
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">Failed login attempts</p>
                  <p className="text-[10px] text-rose-600 dark:text-rose-500">Detected 15 attempts from IP 192.168.1.1</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">System Update</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Security patch v2.4 applied successfully.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
