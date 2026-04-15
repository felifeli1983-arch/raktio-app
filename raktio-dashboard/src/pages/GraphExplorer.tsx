import React, { useState } from 'react';
import {
  Share2, Search, Filter, Network, ChevronDown,
  Circle, Star, Activity, Users, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const LAYOUT_OPTIONS = ['Force', 'Radial', 'Hierarchical'] as const;

const FILTER_OPTIONS = ['By Simulation', 'By Stance', 'By Geography'] as const;

const MOCK_SIMULATIONS = [
  { id: 1, name: 'Rebranding Q4', status: 'running', agents: '25k' },
  { id: 2, name: 'Feature X Launch (Standard)', status: 'completed', agents: '10k' },
  { id: 3, name: 'New Pricing Model', status: 'completed', agents: '10k' },
  { id: 5, name: 'Product Launch Alpha', status: 'completed', agents: '15k' },
];

const FEATURED_AGENTS = [
  { id: 1, name: 'David C.', role: 'Startup Founder', connections: 34, stance: 'Supportive' as const, avatar: 'David' },
  { id: 2, name: 'Marco R.', role: 'Marketing Manager', connections: 28, stance: 'Opposing' as const, avatar: 'Marco' },
  { id: 3, name: 'Elena B.', role: 'Indie Dev', connections: 15, stance: 'Neutral' as const, avatar: 'Elena' },
];

export default function GraphExplorer() {
  const [layout, setLayout] = useState<typeof LAYOUT_OPTIONS[number]>('Force');
  const [activeFilter, setActiveFilter] = useState<typeof FILTER_OPTIONS[number] | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedSimId, setSelectedSimId] = useState<number | null>(null);
  const [showSimSelector, setShowSimSelector] = useState(false);

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-1">
            <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Graph Explorer</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Explore the relationship network across your synthetic population.
          </p>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Simulation Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSimSelector(!showSimSelector)}
                onBlur={() => setTimeout(() => setShowSimSelector(false), 200)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 min-w-[200px]"
              >
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="flex-1 text-left truncate">
                  {selectedSimId ? MOCK_SIMULATIONS.find(s => s.id === selectedSimId)?.name : 'Select simulation...'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
              {showSimSelector && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {MOCK_SIMULATIONS.map(sim => (
                    <button
                      key={sim.id}
                      onClick={() => { setSelectedSimId(sim.id); setShowSimSelector(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between",
                        selectedSimId === sim.id && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sim.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{sim.agents} agents</p>
                      </div>
                      {sim.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                onBlur={() => setTimeout(() => setShowFilterDropdown(false), 200)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {activeFilter || 'Filter'}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {FILTER_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setActiveFilter(opt); setShowFilterDropdown(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
                        activeFilter === opt
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layout Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
              {LAYOUT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setLayout(opt)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors",
                    layout === opt
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Graph Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Grid-dot background pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(148 163 184 / 0.2) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Centered placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-10 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center mb-5">
                <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {selectedSimId
                  ? 'Graph visualization will render here when connected to the backend.'
                  : 'Select a simulation above to explore the relationship graph.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 overflow-y-auto transition-colors duration-300">

        {/* Graph Stats */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Graph Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nodes', value: '1,248' },
              { label: 'Edges', value: '4,392' },
              { label: 'Clusters', value: '12' },
              { label: 'Avg Degree', value: '7.03' },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50"
              >
                <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Legend
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Circle className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Supportive</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Opposing</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="w-3.5 h-3.5 fill-slate-400 text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Neutral</span>
            </div>
          </div>
        </div>

        {/* Featured Nodes */}
        <div className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Featured Nodes
          </h3>
          <div className="space-y-3">
            {FEATURED_AGENTS.map(agent => (
              <div
                key={agent.id}
                className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 cursor-pointer hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${agent.avatar}&backgroundColor=f8fafc`}
                    alt={agent.name}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{agent.name}</h4>
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        agent.stance === 'Supportive' ? "bg-emerald-500" :
                        agent.stance === 'Opposing' ? "bg-rose-500" :
                        "bg-slate-400"
                      )} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{agent.role}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                      {agent.connections} connections
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
