import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Users, 
  Globe, 
  ArrowRight,
  MessageSquare,
  TrendingUp,
  ShieldAlert,
  Building2,
  Megaphone,
  Briefcase,
  PlayCircle,
  CheckCircle2,
  BarChart3,
  Network,
  ChevronDown,
  Activity,
  BrainCircuit
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How accurate are the synthetic agents?",
      answer: "Raktio agents are powered by advanced LLMs and grounded in real-world demographic and psychographic data. They maintain persistent memory and platform-specific behaviors to ensure highly realistic reaction patterns."
    },
    {
      question: "Can I simulate specific geographic regions?",
      answer: "Yes. You can target specific countries, regions, and even cities. The agents' cultural context and language will automatically adapt to the selected geography."
    },
    {
      question: "How long does a simulation take?",
      answer: "A typical simulation of 500-1,000 agents over a simulated 24-hour period takes about 3 to 10 minutes of real time to complete, including full report generation."
    },
    {
      question: "What platforms are supported?",
      answer: "Currently, Raktio simulates behavior patterns for X (Twitter), Reddit, Instagram, TikTok, and LinkedIn, adjusting agent communication styles and network effects accordingly."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/20">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Raktio</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#platform" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Platform</a>
            <a href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Use Cases</a>
            <a href="#reports" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Intelligence</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Simulation Intelligence Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
            Know how the world reacts. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Before you launch.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Test campaigns, products, and crisis responses on a persistent synthetic population. Raktio simulates real-world social dynamics to give you predictive intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <PlayCircle className="w-5 h-5" />
              Book a Demo
            </button>
          </div>
        </div>

        {/* UI Mockup / Proof */}
        <div className="max-w-6xl mx-auto relative z-10 mt-12">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-2 shadow-2xl dark:shadow-blue-900/20">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-[16/9] relative flex items-center justify-center">
              {/* Abstract representation of the canvas */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="absolute left-8 top-8 bottom-8 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-4 hidden md:block">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
                  <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
                  <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
                </div>
              </div>
              <div className="w-full max-w-[600px] h-[400px] relative flex items-center justify-center">
                {/* SVG Neural/Graph Connections */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Main connections to center */}
                  <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="url(#grad1)" strokeWidth="3" className="animate-pulse" />
                  <line x1="50%" y1="50%" x2="75%" y2="20%" stroke="url(#grad2)" strokeWidth="2" />
                  <line x1="50%" y1="50%" x2="85%" y2="65%" stroke="url(#grad1)" strokeWidth="3" className="animate-pulse" />
                  <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="url(#grad3)" strokeWidth="2" />
                  <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="50%" y1="50%" x2="80%" y2="40%" stroke="url(#grad2)" strokeWidth="1" strokeDasharray="4" />
                  
                  {/* Inter-node connections */}
                  <line x1="25%" y1="25%" x2="50%" y2="15%" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                  <line x1="75%" y1="20%" x2="80%" y2="40%" stroke="url(#grad2)" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                  <line x1="85%" y1="65%" x2="80%" y2="40%" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                  <line x1="20%" y1="75%" x2="25%" y2="25%" stroke="url(#grad3)" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
                </svg>

                {/* Central Neural Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-700 relative z-10">
                      <BrainCircuit className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Processing 10k Agents...</span>
                    </div>
                  </div>
                </div>

                {/* Agent Nodes */}
                {/* Node 1: Top Left */}
                <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-3 bg-emerald-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img src="https://i.pravatar.cc/150?img=32" alt="Agent" className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-xl relative z-10 object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full z-20"></div>
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                      Supportive • 88%
                    </div>
                  </div>
                </div>

                {/* Node 2: Top Right */}
                <div className="absolute top-[20%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-3 bg-blue-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img src="https://i.pravatar.cc/150?img=12" alt="Agent" className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-xl relative z-10 object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-white dark:border-slate-800 rounded-full z-20"></div>
                  </div>
                </div>

                {/* Node 3: Bottom Right (Active/Speaking) */}
                <div className="absolute top-[65%] left-[85%] -translate-x-1/2 -translate-y-1/2 z-30">
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-4 bg-indigo-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                    <img src="https://i.pravatar.cc/150?img=47" alt="Agent" className="w-16 h-16 rounded-full border-2 border-indigo-500 shadow-2xl relative z-10 object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute -top-3 -right-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Posting
                    </div>
                  </div>
                </div>

                {/* Node 4: Bottom Left */}
                <div className="absolute top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-3 bg-rose-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img src="https://i.pravatar.cc/150?img=68" alt="Agent" className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-xl relative z-10 object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full z-20"></div>
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                      Opposing • 92%
                    </div>
                  </div>
                </div>

                {/* Node 5: Top Center Small */}
                <div className="absolute top-[15%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative group cursor-pointer">
                    <img src="https://i.pravatar.cc/150?img=33" alt="Agent" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-md relative z-10 object-cover opacity-70 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  </div>
                </div>

                {/* Node 6: Mid Right Small */}
                <div className="absolute top-[40%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative group cursor-pointer">
                    <img src="https://i.pravatar.cc/150?img=24" alt="Agent" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md relative z-10 object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
              <div className="absolute right-8 top-8 bottom-8 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-4 hidden lg:block">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700/50"></div>
                  <div className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-700/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24">
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">100k+</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Persistent Agents</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">5</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform Models</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">14</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Report Sections</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">&lt; 10m</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time to Insight</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="platform" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How Raktio Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">From brief to deep analytical insight in three steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Define the Brief</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Input your campaign, product idea, or crisis scenario. Select your target geography, platform mix, and audience segments.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6">
                <Network className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Run Simulation</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Watch as thousands of persistent AI agents react, share, argue, and form factions in real-time on the Simulation Canvas.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Analyze Insights</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Receive a 14-section evidence-backed report detailing belief shifts, patient zero amplifiers, and actionable recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Built for Strategic Decisions</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Stop guessing. Start simulating.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-6 p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-blue-500/50 transition-colors">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Marketing & Brand</h3>
                <p className="text-slate-600 dark:text-slate-400">Test campaign messaging before spending media budget. Identify which segments resonate and which platforms amplify your message best.</p>
              </div>
            </div>
            <div className="flex gap-6 p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-rose-500/50 transition-colors">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">PR & Crisis Comms</h3>
                <p className="text-slate-600 dark:text-slate-400">Simulate crisis responses to see how the narrative spreads. Identify potential backlash and "patient zero" amplifiers before issuing a statement.</p>
              </div>
            </div>
            <div className="flex gap-6 p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/50 transition-colors">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Public Policy</h3>
                <p className="text-slate-600 dark:text-slate-400">Understand how different demographic and geographic segments will react to policy announcements. Measure polarization and belief shifts.</p>
              </div>
            </div>
            <div className="flex gap-6 p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/50 transition-colors">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <Briefcase className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Product Strategy</h3>
                <p className="text-slate-600 dark:text-slate-400">Validate product positioning and feature announcements. See what objections arise naturally in a simulated market environment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Proof Section */}
      <section id="reports" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Evidence-Backed Intelligence</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Raktio doesn't just give you a generic summary. Every simulation generates a comprehensive 14-section report grounded in actual agent interactions.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Belief Shift Analysis",
                "Patient Zero & Amplifier Tracking",
                "Segment & Geography Divergence",
                "Platform-Specific Dynamics",
                "Actionable Recommendations"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline">
              View a sample report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">Executive Summary</div>
                <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded">Completed</div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Risk Score</div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">High</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Resonance</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">78%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Simple, Usage-Based Pricing</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">Pay only for the simulations you run. No hidden fees.</p>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Start with Free Credits</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Sign up and complete your profile to unlock free credits for your first simulation.</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full access to Simulation Canvas</li>
                  <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-section analytical reports</li>
                  <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Global persistent agent pool</li>
                </ul>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <Link to="/signup" className="block w-full text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Create Free Account
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">No credit card required.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-900 dark:text-white focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.question}
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">Raktio</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The simulation intelligence platform for strategic decision making.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Simulation Canvas</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Intelligence Reports</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Agent Atlas</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Blog</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">© 2026 Raktio Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><Globe className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
