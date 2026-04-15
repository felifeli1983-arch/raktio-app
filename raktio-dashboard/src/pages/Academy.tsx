import React, { useState } from 'react';
import { 
  BookOpen, GraduationCap, HelpCircle, Search, 
  Terminal, BrainCircuit, Activity, ShieldAlert, 
  PlayCircle, FileText, Lightbulb, Video, 
  CheckCircle2, Clock, ArrowRight, BookMarked,
  TrendingUp, Users, Zap, Database, X
} from 'lucide-react';
import { cn } from '../lib/utils';

const GLOSSARY_TERMS = [
  { term: "MBTI (Myers-Briggs)", icon: BrainCircuit, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30", definition: "Un modello psicologico che classifica le personalità in 16 tipi (es. INTJ, ESFP). Raktio lo usa per determinare come un agente elabora le informazioni, se è impulsivo o analitico, e come reagisce emotivamente ai tuoi messaggi." },
  { term: "Toxic Drift", icon: ShieldAlert, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/30", definition: "La velocità e l'intensità con cui un'opinione negativa (o una crisi) si diffonde all'interno della rete di agenti. Un Toxic Drift alto indica un alto rischio di danno reputazionale." },
  { term: "Belief Shift", icon: Activity, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30", definition: "Il tasso di conversione delle opinioni. Misura quanti agenti sono passati da uno stato 'Opposing' (Contrario) o 'Neutral' a uno stato 'Supportive' (A favore) dopo aver ricevuto il tuo messaggio." },
  { term: "Patient Zero (Paziente Zero)", icon: Terminal, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", definition: "L'agente (o il piccolo gruppo di agenti) da cui parte un trend virale all'interno della simulazione. Identificare il Paziente Zero aiuta a capire chi sono i veri influencer della tua audience." },
  { term: "Echo Chamber", icon: HelpCircle, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30", definition: "Una situazione in cui un gruppo di agenti con idee simili si isola, amplificando a vicenda le proprie opinioni e ignorando i messaggi esterni. Molto comune nelle simulazioni politiche o di brand activism." },
  { term: "OASIS Engine", icon: Zap, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30", definition: "Il motore di simulazione sociale alla base di Raktio. Gestisce le interazioni tra gli agenti, la propagazione dei messaggi e le dinamiche di rete in tempo reale." },
  { term: "Stance", icon: Users, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-900/30", definition: "La posizione o l'atteggiamento di un agente rispetto a un determinato argomento. Può essere Supportive (A favore), Neutral (Neutrale) o Opposing (Contrario)." },
  { term: "Knowledge Base (Memoria Globale)", icon: Database, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", definition: "Il repository centrale dove carichi i documenti statici della tua azienda (Brand Guidelines, Tone of Voice, Policy). Forma l'identità di base degli agenti e viene applicata automaticamente a tutte le simulazioni." },
  { term: "Brief (Input di Test)", icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30", definition: "Il materiale specifico che vuoi testare in una singola simulazione (es. la bozza di un comunicato stampa di oggi, un nuovo post social). Viene valutato dagli agenti tenendo conto del contesto fornito dalla Knowledge Base." }
];

const COURSES = [
  { id: 1, title: "OASIS 101: Fondamenti", duration: "45 min", modules: 5, completed: 5, image: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { id: 5, title: "Setup: Knowledge Base vs Brief", duration: "20 min", modules: 3, completed: 0, image: "bg-gradient-to-br from-slate-600 to-slate-800" },
  { id: 2, title: "Mastering Belief Shift", duration: "1h 20m", modules: 8, completed: 3, image: "bg-gradient-to-br from-emerald-400 to-teal-600" },
  { id: 3, title: "Gestione Crisi & Toxic Drift", duration: "2h 15m", modules: 12, completed: 0, image: "bg-gradient-to-br from-rose-500 to-orange-500" },
  { id: 4, title: "Prompting per Agenti Sintetici", duration: "50 min", modules: 6, completed: 0, image: "bg-gradient-to-br from-purple-500 to-pink-500" }
];

const PLAYBOOKS = [
  { id: 'pr', title: "Gestione Crisi PR", desc: "Come simulare una fuga di notizie e preparare la risposta perfetta.", icon: ShieldAlert, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/30" },
  { id: 'pricing', title: "Lancio Nuovo Pricing", desc: "Testa l'elasticità del prezzo e previeni il backlash della community.", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { id: 'rebrand', title: "Rebranding Aziendale", desc: "Misura l'accettazione del nuovo logo e tone of voice.", icon: Lightbulb, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
];

export default function Academy() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'playbooks' | 'glossary'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredGlossary = GLOSSARY_TERMS.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden relative transition-colors duration-300">
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
      <div className="bg-slate-900 text-white px-8 py-10 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-400" /> Raktio Academy
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm">
              Il centro di eccellenza per padroneggiare le simulazioni di audience sintetiche. Impara, esplora i casi d'uso e diventa un esperto di intelligenza sociale.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm shadow-lg">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <span className="font-bold text-blue-400">LV. 3</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Il tuo progresso</p>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-sm font-bold text-white">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-8 flex gap-8 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
              activeTab === 'dashboard' ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            )}
          >
            <Activity className="w-5 h-5" /> Hub Principale
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
              activeTab === 'courses' ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            )}
          >
            <Video className="w-5 h-5" /> Corsi & Tutorial
          </button>
          <button 
            onClick={() => setActiveTab('playbooks')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
              activeTab === 'playbooks' ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            )}
          >
            <BookMarked className="w-5 h-5" /> Playbooks (Casi d'Uso)
          </button>
          <button 
            onClick={() => setActiveTab('glossary')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
              activeTab === 'glossary' ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            )}
          >
            <BookOpen className="w-5 h-5" /> Glossario Termini
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-12">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Continue Learning */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Riprendi da dove avevi lasciato</h2>
                <div className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex items-center gap-6 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-shadow cursor-pointer group">
                  <div className="w-32 h-24 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <PlayCircle className="w-10 h-10 text-white opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md uppercase tracking-wider">In Corso</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Modulo 4 di 8</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Mastering Belief Shift</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '37%' }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">37%</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => showToast('Ripresa del corso in corso...')}
                    className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0"
                  >
                    Continua
                  </button>
                </div>
              </div>

              {/* Recommended Playbooks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Playbooks Consigliati</h2>
                  <button onClick={() => setActiveTab('playbooks')} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                    Vedi tutti <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {PLAYBOOKS.slice(0, 2).map(pb => (
                    <div key={pb.id} className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer group">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", pb.bg, pb.color)}>
                        <pb.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{pb.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{pb.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Corsi & Tutorial</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Percorsi formativi completi per dominare la piattaforma.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {COURSES.map(course => (
                  <div key={course.id} className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-shadow cursor-pointer group">
                    <div className={cn("h-32 flex items-center justify-center relative", course.image)}>
                      <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform" />
                      {course.completed === course.modules && (
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-white text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Completato
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                        <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> {course.modules} Moduli</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <span>Progresso</span>
                          <span>{Math.round((course.completed / course.modules) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", course.completed === course.modules ? "bg-emerald-500" : "bg-blue-500")} 
                            style={{ width: `${(course.completed / course.modules) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAYBOOKS TAB */}
          {activeTab === 'playbooks' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Playbooks (Casi d'Uso)</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Guide pratiche e template pre-configurati per scenari specifici.</p>
              </div>

              <div className="space-y-4">
                {PLAYBOOKS.map(pb => (
                  <div key={pb.id} className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer group flex items-start gap-6">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", pb.bg, pb.color)}>
                      <pb.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{pb.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{pb.desc}</p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg">Template Pronto</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg">Guida Step-by-Step</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast(`Avvio playbook: ${pb.title}`)}
                      className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-2"
                    >
                      Usa Playbook <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GLOSSARY TAB */}
          {activeTab === 'glossary' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
              <div className="p-6 border-b border-slate-100/50 dark:border-slate-700/50 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Vocabolario di Raktio</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Comprendi i termini tecnici usati nei report e nelle simulazioni.</p>
                </div>
                <div className="relative w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cerca un termine..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                {filteredGlossary.map((item, idx) => (
                  <div key={idx} className="p-5 border border-slate-100/50 dark:border-slate-700/50 rounded-xl hover:border-blue-100 dark:hover:border-blue-500/50 hover:shadow-sm transition-all bg-slate-50/50 dark:bg-slate-800/50 flex items-start gap-4 group">
                    <div className={cn("p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110", item.bg, item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.term}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.definition}</p>
                    </div>
                  </div>
                ))}
                {filteredGlossary.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Nessun termine trovato per "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
