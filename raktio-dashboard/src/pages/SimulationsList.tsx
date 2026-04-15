import React, { useState, useEffect, useRef } from 'react';
import { PageLoading, PageError } from '../components/PageStates';
import {
  PlayCircle, Search, Filter, MoreHorizontal, Activity, Clock, Users,
  CheckCircle2, X, FolderOpen, AlertTriangle, Pause, Copy, FileText,
  Archive, Trash2, Eye, BarChart3, XCircle, Database, Zap, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { simulationsApi, Simulation } from '../lib/api/simulations';

type SimStatus = 'all' | 'running' | 'draft' | 'completed' | 'failed' | 'canceled';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    running: { bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50', text: 'text-blue-700 dark:text-blue-400', icon: <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />, label: 'Running' },
    completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-700 dark:text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Completed' },
    draft: { bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', icon: <Clock className="w-3 h-3" />, label: 'Draft' },
    failed: { bg: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800/50', text: 'text-rose-700 dark:text-rose-400', icon: <XCircle className="w-3 h-3" />, label: 'Failed' },
    canceled: { bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-500 dark:text-slate-500', icon: <X className="w-3 h-3" />, label: 'Canceled' },
  };
  const c = config[status] || config.draft;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border", c.bg, c.text)}>
      {c.icon} {c.label}
    </span>
  );
}

export default function SimulationsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SimStatus>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadSimulations = () => {
    setLoading(true);
    setError(null);
    simulationsApi.list(1, 50)
      .then(data => {
        setSimulations(data.items);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load simulations');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSimulations();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusCounts = {
    all: simulations.length,
    running: simulations.filter(s => s.status === 'running').length,
    draft: simulations.filter(s => s.status === 'draft').length,
    completed: simulations.filter(s => s.status === 'completed').length,
    failed: simulations.filter(s => s.status === 'failed').length,
    canceled: simulations.filter(s => s.status === 'canceled').length,
  };

  const STATUS_TABS: { id: SimStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: statusCounts.all },
    { id: 'running', label: 'Running', count: statusCounts.running },
    { id: 'draft', label: 'Draft', count: statusCounts.draft },
    { id: 'completed', label: 'Completed', count: statusCounts.completed },
    { id: 'failed', label: 'Failed', count: statusCounts.failed },
    { id: 'canceled', label: 'Canceled', count: statusCounts.canceled },
  ];

  const filtered = simulations.filter(s => {
    if (activeTab !== 'all' && s.status !== activeTab) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.simulation_id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={loadSimulations} />;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto relative transition-colors duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="font-medium text-sm">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100/50 dark:border-slate-800/50 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Simulations
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage and monitor all your simulation runs.</p>
          </div>
          <Link to="/sim/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
            <PlayCircle className="w-4 h-4" /> New Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-6">

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100/50 dark:border-slate-700/50 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {tab.label} <span className="ml-1 text-xs opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100/50 dark:border-slate-700/50 flex gap-4 bg-slate-50/50 dark:bg-slate-800/80">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search simulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No simulations found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
                {activeTab !== 'all' ? `No ${activeTab} simulations. Try a different filter.` : 'Create your first simulation to get started.'}
              </p>
              <Link to="/sim/new" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                <PlayCircle className="w-5 h-5" /> Create Simulation
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100/50 dark:border-slate-700/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="p-4">Simulation</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Agents</th>
                      <th className="p-4">Platform</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Sentiment</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-slate-700/50">
                    {filtered.map((sim) => {
                      const agentCount = sim.agent_count_final || sim.agent_count_requested;
                      const platformLabel = sim.platform_scope.join(', ');
                      const reportStatus = sim.status === 'completed' ? 'ready' : sim.status === 'reporting' ? 'generating' : null;

                      return (
                      <tr
                        key={sim.simulation_id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        onClick={() => {
                          if (sim.status === 'running') navigate(`/sim/${sim.simulation_id}/canvas`);
                          else if (sim.status === 'completed') navigate(`/reports/${sim.simulation_id}`);
                          else if (sim.status === 'draft') navigate('/sim/new');
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              sim.status === 'running' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                              sim.status === 'failed' ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" :
                              "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            )}>
                              <Activity className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{sim.name}</p>
                                {sim.memory_mode === 'persistent' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded border border-violet-100 dark:border-violet-800/50" title="Persistent memory mode">
                                    <Database className="w-3 h-3" /> Persistent
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{sim.simulation_id.slice(0, 12)}</p>
                                {reportStatus === 'ready' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <FileText className="w-3 h-3" /> Report
                                  </span>
                                )}
                                {reportStatus === 'generating' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Generating
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{new Date(sim.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            {agentCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">{platformLabel}</span>
                        </td>
                        <td className="p-4"><StatusBadge status={sim.status} /></td>
                        <td className="p-4 text-sm">
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        </td>
                        <td className="p-4 text-right relative" ref={openMenuId === sim.simulation_id ? menuRef : undefined}>
                          <button
                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === sim.simulation_id ? null : sim.simulation_id); }}
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openMenuId === sim.simulation_id && (
                            <div className="absolute right-4 top-12 w-52 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95">
                              {sim.status === 'running' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); navigate(`/sim/${sim.simulation_id}/canvas`); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Open Canvas
                                  </button>
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    simulationsApi.pause(sim.simulation_id)
                                      .then(() => { showToast('Simulation paused'); loadSimulations(); })
                                      .catch(err => showToast(err.message || 'Failed to pause simulation'));
                                  }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                    <Pause className="w-4 h-4" /> Pause
                                  </button>
                                  <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-2" />
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    simulationsApi.cancel(sim.simulation_id)
                                      .then(() => { showToast('Simulation canceled'); loadSimulations(); })
                                      .catch(err => showToast(err.message || 'Failed to cancel simulation'));
                                  }} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-2">
                                    <X className="w-4 h-4" /> Cancel
                                  </button>
                                </>
                              )}
                              {sim.status === 'completed' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); navigate(`/sim/${sim.simulation_id}/canvas`); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Open Canvas
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); navigate(`/reports/${sim.simulation_id}`); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Open Report
                                  </button>
                                </>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); showToast('Simulation duplicated'); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                <Copy className="w-4 h-4" /> Duplicate
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); showToast('Simulation archived'); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                <Archive className="w-4 h-4" /> Archive
                              </button>
                              {(sim.status === 'draft' || sim.status === 'canceled' || sim.status === 'failed') && (
                                <>
                                  <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-2" />
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    simulationsApi.delete(sim.simulation_id)
                                      .then(() => {
                                        setSimulations(prev => prev.filter(s => s.simulation_id !== sim.simulation_id));
                                        showToast('Simulation deleted');
                                      })
                                      .catch(err => showToast(err.message || 'Failed to delete simulation'));
                                  }} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100/50 dark:border-slate-700/50 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                <span>Showing {filtered.length} of {simulations.length} simulations</span>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md font-medium">1</button>
                  <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
