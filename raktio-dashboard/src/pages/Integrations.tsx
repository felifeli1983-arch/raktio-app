import React from 'react';
import { Plug, Plus, Search, CheckCircle2, ArrowRight, Webhook, Slack, Github, Database } from 'lucide-react';
import { cn } from '../lib/utils';

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', desc: 'Receive notifications and alerts on your business channels.', icon: Slack, status: 'connected', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  { id: 'hubspot', name: 'HubSpot', desc: 'Sync customer data to create synthetic audiences.', icon: Database, status: 'available', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  { id: 'github', name: 'GitHub', desc: 'Connect repositories to analyze developer sentiment.', icon: Github, status: 'available', color: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'webhook', name: 'Webhooks', desc: 'Send real-time events to your internal systems.', icon: Webhook, status: 'connected', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
];

export default function Integrations() {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Plug className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Integrations
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Connect Raktio to your business tools to automate workflows.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Request Integration
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Available Apps</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search apps..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INTEGRATIONS.map(app => (
            <div key={app.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", app.bg, app.color)}>
                  <app.icon className="w-6 h-6" />
                </div>
                {app.status === 'connected' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                    Available
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{app.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1 mb-6">{app.desc}</p>
              
              <button className={cn(
                "w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2",
                app.status === 'connected' 
                  ? "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700" 
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              )}>
                {app.status === 'connected' ? 'Manage' : 'Connect'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
