import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, SlidersHorizontal, BrainCircuit, 
  Briefcase, MapPin, Activity, ChevronDown, MoreHorizontal, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const MOCK_AGENTS = [
  { id: 'AGT-8001', name: 'Marco R.', role: 'Marketing Manager', mbti: 'ESFJ', age: 34, location: 'Milano, IT', traits: ['Analitico', 'Influencer'], avatar: 'Marco' },
  { id: 'AGT-8002', name: 'Sarah J.', role: 'Tech Lead', mbti: 'INTJ', age: 29, location: 'New York, US', traits: ['Logico', 'Early Adopter'], avatar: 'Sarah' },
  { id: 'AGT-8003', name: 'Elena B.', role: 'Indie Dev', mbti: 'INFP', age: 26, location: 'Roma, IT', traits: ['Creativo', 'Scettico'], avatar: 'Elena' },
  { id: 'AGT-8004', name: 'Alex T.', role: 'Designer', mbti: 'ENTP', age: 31, location: 'London, UK', traits: ['Innovatore', 'Vocale'], avatar: 'Alex' },
  { id: 'AGT-8005', name: 'Giulia M.', role: 'Founder', mbti: 'ENTJ', age: 38, location: 'Berlin, DE', traits: ['Leader', 'Pragmatico'], avatar: 'Giulia' },
  { id: 'AGT-8006', name: 'Luca P.', role: 'Backend Dev', mbti: 'ISTP', age: 27, location: 'Torino, IT', traits: ['Tecnico', 'Silenzioso'], avatar: 'Luca' },
];

export default function AgentsPool() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      
      {/* Left Sidebar: Audience Filters */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto shrink-0 transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Audience Builder</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Define parameters to generate or filter your synthetic audience.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Demographics */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Demographics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">Age (Range)</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all" defaultValue={18} />
                  <span className="text-slate-400 dark:text-slate-500">-</span>
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all" defaultValue={65} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">Location</label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 transition-all appearance-none cursor-pointer">
                  <option>Global</option>
                  <option>Europe</option>
                  <option>North America</option>
                  <option>Italy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Psychographics */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Psychographics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">Personality (MBTI)</label>
                <div className="flex flex-wrap gap-2">
                  {['INTJ', 'ENTP', 'ESFJ', 'INFP'].map(mbti => (
                    <label key={mbti} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500/20 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{mbti}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">Behavioral Traits</label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 transition-all appearance-none cursor-pointer">
                  <option>All traits</option>
                  <option>Early Adopters</option>
                  <option>Skeptics</option>
                  <option>Influencer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Profession
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">Industry</label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 transition-all appearance-none cursor-pointer">
                  <option>Tech & IT</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 mt-auto bg-slate-50/50 dark:bg-slate-900/50">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Generate Audience (10k)
          </button>
        </div>
      </aside>

      {/* Main Content: Agents Grid */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Audience Studio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Explore and manage the active synthetic agent pool.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Agents</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">124,500</p>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 transition-colors duration-300">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search agent by name, ID or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_AGENTS.map((agent) => (
              <div key={agent.id} className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 hover:shadow-md dark:hover:bg-slate-800 transition-all group relative">
                <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${agent.avatar}&backgroundColor=f8fafc`} alt={agent.name} className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 mb-4 shadow-sm" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{agent.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{agent.id}</p>
                </div>

                <div className="space-y-3 mb-6 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{agent.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{agent.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Activity className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{agent.age} anni</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  <span className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold rounded-lg border border-purple-100 dark:border-purple-800/50">
                    {agent.mbti}
                  </span>
                  {agent.traits.map(trait => (
                    <span key={trait} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">
                      {trait}
                    </span>
                  ))}
                </div>

                <button className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Interview
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
