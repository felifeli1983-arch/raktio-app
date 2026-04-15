import React, { useState, useEffect } from 'react';
import { PageLoading, PageError } from '../components/PageStates';
import {
  Search, Filter, BrainCircuit, Activity, Database,
  ShieldAlert, Star, ChevronDown, MoreHorizontal, MessageSquare,
  Network, History, Target, Users, X, Send, Download, RefreshCw, Edit3, Lock, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { agentsApi, Agent, AgentProfile } from '../lib/api/agents';

export default function AgentAtlas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<AgentProfile | null>(null);
  const [showInterview, setShowInterview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    agentsApi.list({ limit: 50 })
      .then(data => {
        setAgents(data.items);
        if (data.items.length > 0) {
          const first = data.items[0];
          setSelectedAgent(first.agent_id);
          agentsApi.get(first.agent_id)
            .then(profile => setSelectedProfile(profile))
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load agents');
        setLoading(false);
      });
  }, []);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    agentsApi.get(agentId)
      .then(profile => setSelectedProfile(profile))
      .catch(() => {});
  };

  const filteredAgents = agents.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.display_name.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      a.profession.toLowerCase().includes(q) ||
      a.mbti.toLowerCase().includes(q)
    );
  });

  const activeAgent = agents.find(a => a.agent_id === selectedAgent) || null;
  const agentName = activeAgent ? (activeAgent.display_name || `${activeAgent.first_name} ${activeAgent.last_name}`) : '';
  const agentHandle = activeAgent ? `@${activeAgent.username}` : '';
  const agentInfluence = activeAgent ? Math.round(activeAgent.influence_weight * 20) : 0;
  const memoryCount = selectedProfile?.memory_summary?.simulation_count ?? 0;

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={() => {
    setError(null);
    setLoading(true);
    agentsApi.list({ limit: 50 })
      .then(data => { setAgents(data.items); setLoading(false); })
      .catch(err => { setError(err.message || 'Failed to load agents'); setLoading(false); });
  }} />;

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* LEFT: Agent List & Filters */}
      <div className="w-1/2 lg:w-5/12 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 transition-colors duration-300">
        
        {/* Header & Search */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Agent Atlas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Explore the psychological database of your synthetic audience.</p>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by role, MBTI or name..."
                className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
              />
            </div>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
            <span className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer shadow-sm">All ({agents.length})</span>
            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer transition-colors">Influential (&gt;80)</span>
            <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer transition-colors">Opposing</span>
            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer transition-colors">Analysts (NT)</span>
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {filteredAgents.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
              {searchQuery ? 'No agents match your search.' : 'No agents found.'}
            </div>
          )}
          {filteredAgents.map(agent => {
            const name = agent.display_name || `${agent.first_name} ${agent.last_name}`;
            const influence = Math.round(agent.influence_weight * 20);
            return (
            <div
              key={agent.agent_id}
              onClick={() => handleSelectAgent(agent.agent_id)}
              className={cn(
                "p-4 rounded-2xl cursor-pointer transition-all duration-200",
                selectedAgent === agent.agent_id
                  ? "bg-white dark:bg-slate-800 shadow-md ring-1 ring-blue-500/20 dark:ring-blue-400/30 border border-transparent"
                  : "bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
              )}
            >
              <div className="flex items-start gap-4">
                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${agent.username}`} alt={name} className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{name}</h3>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-lg border",
                      agent.base_stance_bias === 'supportive' ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50" :
                      agent.base_stance_bias === 'opposing' ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/50" :
                      "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50"
                    )}>
                      {agent.base_stance_bias}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{agent.profession} • @{agent.username}</p>

                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      <BrainCircuit className="w-3 h-3" /> {agent.mbti}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-800/50">
                      <Star className="w-3 h-3" /> Infl: {influence}
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                      <Database className="w-3 h-3" /> Mem: {agent.interests?.length ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Agent Detail Profile */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-y-auto relative transition-colors duration-300">
        {activeAgent ? (
          <div className="max-w-3xl mx-auto p-8 animate-in fade-in slide-in-from-right-8 duration-300">
            
            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${activeAgent.username}`} alt={agentName} className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 shadow-md" />
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{agentName}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{agentHandle} • {activeAgent.profession}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(selectedProfile?.topic_exposures && selectedProfile.topic_exposures.length > 0
                        ? selectedProfile.topic_exposures.slice(0, 4).map((t, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">
                              {t.topic || t.name || JSON.stringify(t)}
                            </span>
                          ))
                        : activeAgent.interests?.slice(0, 4).map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">
                              {tag}
                            </span>
                          ))
                      ) || <span className="text-xs text-slate-400">No topics tracked</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => setShowMenu(!showMenu)}
                      onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between group">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" /> Export Profile JSON
                          </div>
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-2"></div>
                        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Only</div>
                        <button disabled className="w-full text-left px-4 py-2 text-sm text-slate-400 flex items-center justify-between cursor-not-allowed opacity-70">
                          <div className="flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Edit Parameters
                          </div>
                          <Lock className="w-3 h-3" />
                        </button>
                        <button disabled className="w-full text-left px-4 py-2 text-sm text-slate-400 flex items-center justify-between cursor-not-allowed opacity-70">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Reset Memory
                          </div>
                          <Lock className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowInterview(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Interview
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative group">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3 cursor-help">
                  <BrainCircuit className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider border-b border-dashed border-slate-300 dark:border-slate-600">MBTI Profile</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  The <strong>Myers-Briggs Type Indicator (MBTI)</strong> is a psychological model that classifies personality into 16 types. It helps Raktio predict how the agent processes information and makes decisions.
                  <div className="absolute -bottom-1 left-6 w-2 h-2 bg-slate-900 dark:bg-white rotate-45"></div>
                </div>

                <div className="text-3xl font-bold text-slate-900 dark:text-white">{activeAgent.mbti}</div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">{activeAgent.mbti.split('').map(l => ({E:'Extroverted',I:'Introverted',S:'Sensing',N:'Intuitive',T:'Thinking',F:'Feeling',J:'Judging',P:'Perceiving'}[l] || l)).join(', ')}</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative group">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3 cursor-help">
                  <Network className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider border-b border-dashed border-slate-300 dark:border-slate-600">Network Influence</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  <strong>Influence</strong> measures (0-100) the agent's ability to shape opinions of other nodes in the network. High-influence agents can trigger chain reactions.
                  <div className="absolute -bottom-1 left-6 w-2 h-2 bg-slate-900 dark:bg-white rotate-45"></div>
                </div>

                <div className="flex items-end gap-2 mb-2">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{agentInfluence}</div>
                  {agentInfluence >= 80 && <div className="text-sm font-bold text-emerald-500 mb-1">Top 5%</div>}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${agentInfluence}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 relative group">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3 cursor-help">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider border-b border-dashed border-slate-300 dark:border-slate-600">Memory</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  <strong>Memory</strong> indicates how many past simulations this agent has participated in. Agents remember previous interactions, developing biases toward your brand.
                  <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-900 dark:bg-white rotate-45"></div>
                </div>

                <div className="text-3xl font-bold text-slate-900 dark:text-white">{memoryCount}</div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                  {memoryCount > 0 ? `Participated in ${memoryCount} past simulations.` : 'No simulation history yet'}
                </p>
              </div>
            </div>

            {/* Deep Dive Sections */}
            <div className="space-y-8">
              
              {/* Memory Summary / Core Beliefs */}
              <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Memory Summary
                </h3>
                {selectedProfile?.memory_summary ? (
                  <div className="space-y-4">
                    {selectedProfile.memory_summary.summary_text && (
                      <div className="p-5 bg-slate-50/50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selectedProfile.memory_summary.summary_text}</p>
                      </div>
                    )}
                    {activeAgent.values && activeAgent.values.length > 0 && (
                      <div className="p-5 bg-slate-50/50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Values</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeAgent.values.map(v => (
                            <span key={v} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800/50">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No simulation history yet</div>
                )}
              </div>

              {/* Simulation History */}
              <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Recent Actions (Cross-Simulation)
                </h3>
                {selectedProfile?.recent_episodes && selectedProfile.recent_episodes.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-700/50 space-y-8">
                    {selectedProfile.recent_episodes.map((ep, i) => (
                      <div key={i} className="relative">
                        <div className={cn(
                          "absolute -left-[29px] top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-900",
                          ep.sentiment === 'negative' ? 'bg-rose-500' : ep.sentiment === 'positive' ? 'bg-emerald-500' : 'bg-blue-500'
                        )}></div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">
                          {ep.created_at ? new Date(ep.created_at).toLocaleDateString() : 'Unknown date'}
                          {ep.simulation_title ? ` • ${ep.simulation_title}` : ''}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {ep.summary || ep.action || ep.content || 'Action recorded'}
                        </p>
                        {ep.quote && (
                          <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-xl text-sm text-slate-600 dark:text-slate-400 italic">
                            "{ep.quote}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No simulation episodes yet</div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Select an agent to view the psychological profile.</p>
          </div>
        )}
      </div>

      {/* Interview Modal (OASIS IPC) */}
      {showInterview && activeAgent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${activeAgent.username}`} alt={agentName} className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{agentName}</h3>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">OASIS IPC Link Active</p>
                </div>
              </div>
              <button onClick={() => setShowInterview(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 space-y-6">
              <div className="flex justify-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                  Neural connection established
                </span>
              </div>
              
              <div className="flex gap-3">
                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${activeAgent.username}`} alt={agentName} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-1" />
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">{agentName}</span>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
                    Ciao. Ho notato che state cambiando i piani tariffari. Sinceramente, la cosa non mi convince per niente. Come pensate di giustificare questo aumento a noi utenti storici?
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-row-reverse">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex" alt="You" className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 shrink-0 mt-1" />
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 mb-1 block">You (Analyst)</span>
                  <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none text-sm shadow-sm">
                    Stiamo introducendo nuove feature basate sull'AI che ridurranno i tempi di lavoro del 30%. Non pensi che questo compensi l'aumento?
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${activeAgent.username}`} alt={agentName} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-1" />
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">{agentName}</span>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
                    <div className="flex gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={`Write to ${agentName || 'agent'}...`} 
                  className="w-full pl-5 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all" 
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3">
                Direct interactions may permanently alter the agent's memory.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
