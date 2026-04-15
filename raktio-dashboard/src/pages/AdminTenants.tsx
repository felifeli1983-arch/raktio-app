import React from 'react';
import { Building, Users, TrendingUp, AlertTriangle, Search, Filter, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminTenants() {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-500" /> Tenant Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestione organizzazioni, piani e crediti della piattaforma.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors">
              + Add Tenant
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Building className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Tenants</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">48</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5 questo mese</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Users className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Active This Month</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">42</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">87.5% activation rate</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5"><Building className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Enterprise Tier</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">12</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">25% del totale</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-amber-100 dark:border-amber-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 text-amber-600 dark:text-amber-400"><AlertTriangle className="w-16 h-16" /></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">At Risk</p>
              <h3 className="text-3xl font-bold text-amber-700 dark:text-amber-400 mb-2">3</h3>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">Richiedono attenzione</p>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Organizations</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search organization..." className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 text-slate-900 dark:text-slate-100 placeholder-slate-400" />
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
                  <th className="p-4">Organization</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Credit Balance</th>
                  <th className="p-4">Simulations</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">AC</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Acme Corp</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">12 members</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-md text-[10px] font-bold uppercase">Enterprise</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€4,200</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">1,247</td>
                  <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span></td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">TS</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">TechStartup</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">5 members</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50 rounded-md text-[10px] font-bold uppercase">Pro</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€890</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">342</td>
                  <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span></td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">GM</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">GreenMedia</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">8 members</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-md text-[10px] font-bold uppercase">Enterprise</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€2,150</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">876</td>
                  <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span></td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">NL</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">NoveLab</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">3 members</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50 rounded-md text-[10px] font-bold uppercase">Pro</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€45</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">18</td>
                  <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> At Risk</span></td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">FD</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">FoodDev</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">2 members</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase">Free</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€0</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">5</td>
                  <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span></td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">OW</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">OldWave Media</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">1 member</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase">Free</span></td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">€0</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">0</td>
                  <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Churned</span></td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
