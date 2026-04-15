import React, { useState } from 'react';
import { User, Mail, Building, Shield, CheckCircle2, X, Camera, Key, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UserProfile() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto relative transition-colors duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="font-medium text-sm">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" /> User Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your personal information and access credentials.
            </p>
          </div>
          <button 
            onClick={() => showToast('Changes saved successfully.')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-slate-900 dark:bg-slate-950">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          </div>
          
          <div className="relative z-10 mt-12 flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
            <div className="relative group">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f8fafc" 
                alt="User Avatar" 
                className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-md"
              />
              <button 
                onClick={() => showToast('Opening image picker...')}
                className="absolute inset-0 bg-slate-900/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Alex Morgan</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Admin Workspace
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); showToast('Profilo aggiornato con successo'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Full Name</label>
                <input type="text" defaultValue="Alex Morgan" className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 font-medium shadow-sm dark:shadow-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> Email</label>
                <input type="email" defaultValue="alex@acmecorp.com" className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 font-medium shadow-sm dark:shadow-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /> Dipartimento</label>
                <input type="text" defaultValue="Marketing Strategy" className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 font-medium shadow-sm dark:shadow-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-slate-400" /> System Role</label>
                <input type="text" defaultValue="Administrator" disabled className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed" />
              </div>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-400" /> Sicurezza & Accesso
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-800/80">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Password</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: 3 months ago</p>
              </div>
              <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm dark:shadow-none">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-800/80">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Two-Factor Authentication (2FA)</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Proteggi il tuo account richiedendo un codice aggiuntivo all'accesso.</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm dark:shadow-none">
                Manage
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
