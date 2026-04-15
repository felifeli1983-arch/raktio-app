import React from 'react';
import { User, MapPin, Briefcase, ArrowLeft, BrainCircuit, MessageSquare, Activity, ShieldAlert, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AgentProfile() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-8 transition-colors duration-300">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 font-bold text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Torna ad Audience Studio
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none transition-colors duration-300">
        {/* Header Banner */}
        <div className="h-40 bg-slate-900 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          {/* Profile Header */}
          <div className="flex justify-between items-end mb-6">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Marco&backgroundColor=f8fafc" 
              alt="Agent Avatar" 
              className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-lg -mt-14 relative z-10"
            />
            <div className="flex gap-3">
              <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5" /> INTJ
              </span>
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 rounded-lg text-xs font-bold font-mono">
                ID: AGT-8001
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Marco Rossi</h1>
          <div className="flex flex-wrap gap-5 text-sm text-slate-600 dark:text-slate-400 mb-8 font-medium">
            <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Marketing Manager @ TechCorp</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Milano, IT</span>
            <span className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400 dark:text-slate-500" /> 34 anni</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Traits */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Behavioral Traits
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                      <span className="text-slate-500 dark:text-slate-400">Openness to Innovation (Early Adopter)</span>
                      <span className="text-slate-700 dark:text-slate-300">80%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[80%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                      <span className="text-slate-500 dark:text-slate-400">Price Sensitivity</span>
                      <span className="text-slate-700 dark:text-slate-300">45%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[45%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                      <span className="text-slate-500 dark:text-slate-400">Brand Loyalty</span>
                      <span className="text-slate-700 dark:text-slate-300">60%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[60%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Interessi & Tag
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['SaaS', 'Marketing Automation', 'AI', 'Growth Hacking', 'B2B'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column: Activity & History */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Recent Simulation History
                    </h3>
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">View all</button>
                 </div>
                 
                 <div className="space-y-4">
                    {/* History Item 1 */}
                    <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">Product "Alpha" Launch</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">2 giorni fa</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                          "Interessante l'approccio AI, ma il pricing mi sembra troppo aggressivo per le PMI. Vorrei vedere più casi d'uso concreti prima di adottarlo."
                        </p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          Stance: Supportive (Condizionato)
                        </span>
                      </div>
                    </div>

                    {/* History Item 2 */}
                    <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">Simulazione Crisi Data Breach</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">1 settimana fa</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                          "Inaccettabile che i dati non fossero criptati. La comunicazione dell'azienda è stata tardiva e poco trasparente. Sto valutando alternative."
                        </p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                          Stance: Opposing (Forte)
                        </span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
