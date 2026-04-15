import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Pause, Play, Square, Copy, Filter, Activity, MessageCircle,
  Briefcase, Users, Zap, Flame, TrendingUp, Network, Clock, MapPin, GitCompare,
  MessageSquare, Heart, Repeat, ThumbsDown, MoreHorizontal, BadgeCheck,
  ShieldAlert, ChevronRight, Search, SlidersHorizontal, Maximize2, Download,
  BrainCircuit, X, Film, Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Map, Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as d3 from 'd3';
import { simulationsApi, Simulation } from '../lib/api/simulations';
import { createEventSource } from '../lib/api/client';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// D3 Force Graph Component
interface AgentNode extends d3.SimulationNodeDatum {
  id: number;
  group: string;
  radius: number;
  name: string;
  handle: string;
  role: string;
  mbti: string;
  stance: string;
  content: string;
}

function ForceGraph({ isPaused, onNodeClick }: { isPaused: boolean, onNodeClick: (node: AgentNode) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 800;
    const height = 600;

    const ROLES = ['Marketing Manager', 'Software Engineer', 'Designer', 'Product Manager', 'CEO', 'Student'];
    const MBTIS = ['INTJ', 'ESFJ', 'INFP', 'ENTP', 'ISTP', 'ENFJ'];
    const NAMES = ['Marco R.', 'Sarah J.', 'Elena B.', 'Alex T.', 'Giulia M.', 'Luca P.'];

    // Generate Mock Network Data
    const nodes: AgentNode[] = Array.from({ length: 80 }, (_, i) => {
      const group = i === 0 ? 'center' : i < 30 ? 'supportive' : i < 60 ? 'opposing' : 'neutral';
      const stance = group === 'supportive' ? 'Supportive' : group === 'opposing' ? 'Opposing' : 'Neutral';
      return {
        id: i,
        group,
        radius: i === 0 ? 24 : i === 30 ? 16 : Math.random() * 6 + 4,
        name: NAMES[i % NAMES.length],
        handle: `@user_${i}`,
        role: ROLES[i % ROLES.length],
        mbti: MBTIS[i % MBTIS.length],
        stance: stance,
        content: i === 30 
          ? "Non capisco perché abbiano rimosso il piano annuale scontato. È un problema enorme." 
          : `Opinione generata dall'agente ${i} riguardo al nuovo aggiornamento.`,
      };
    });

    const links = [
      ...Array.from({ length: 20 }, (_, i) => ({ source: i + 1, target: 0, value: 1 })),
      ...Array.from({ length: 40 }, () => ({ source: Math.floor(Math.random() * 29) + 1, target: Math.floor(Math.random() * 29) + 1, value: 1 })),
      ...Array.from({ length: 50 }, () => ({ source: Math.floor(Math.random() * 29) + 30, target: Math.floor(Math.random() * 29) + 30, value: 1 })),
      ...Array.from({ length: 30 }, () => ({ source: Math.floor(Math.random() * 19) + 60, target: Math.floor(Math.random() * 19) + 60, value: 1 })),
      ...Array.from({ length: 10 }, () => ({ source: Math.floor(Math.random() * 29) + 1, target: Math.floor(Math.random() * 29) + 30, value: 0.5 })),
    ].filter(l => l.source !== l.target);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("background-color", "transparent");

    const g = svg.append("g");

    // Add a tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "absolute hidden bg-slate-900 dark:bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none z-50 transition-opacity")
      .style("opacity", 0);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(0.8));

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("x", d3.forceX().strength(0.08))
      .force("y", d3.forceY().strength(0.08))
      .force("collide", d3.forceCollide().radius((d: any) => d.radius + 5));

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const link = g.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.3)
      .attr("class", "dark:stroke-slate-600")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value) * 1.5);

    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
        if (d.group === 'center') return '#3b82f6';
        if (d.group === 'supportive') return '#10b981';
        if (d.group === 'opposing') return '#f43f5e';
        return '#64748b';
      })
      .attr("stroke", "#ffffff")
      .attr("class", "dark:stroke-slate-900")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("filter", d => d.id === 30 || d.id === 0 ? "url(#glow)" : "none")
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .transition().duration(200)
          .attr("r", d.radius + 6)
          .attr("stroke-width", 3);
        
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div class="font-bold mb-1">${d.name}</div>
          <div class="text-[10px] text-slate-300">${d.role}</div>
          <div class="text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block ${
            d.stance === 'Supportive' ? 'bg-emerald-500/20 text-emerald-300' :
            d.stance === 'Opposing' ? 'bg-rose-500/20 text-rose-300' :
            'bg-slate-500/20 text-slate-300'
          }">${d.stance}</div>
        `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 28) + "px")
          .classed("hidden", false);
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this)
          .transition().duration(200)
          .attr("r", d.radius)
          .attr("stroke-width", d.id === 30 ? 4 : 2);
          
        tooltip.transition().duration(500).style("opacity", 0)
          .on("end", () => tooltip.classed("hidden", true));
      })
      .on("click", (event, d: any) => {
        onNodeClick(d);
      });

    // Add pulsing effect to patient zero
    node.filter(d => d.id === 30)
      .attr("class", isPaused ? "" : "animate-pulse")
      .attr("stroke", "#f43f5e")
      .attr("stroke-width", 4);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    return () => {
        simulation.stop();
        d3.select("body").selectAll(".absolute.hidden.bg-slate-900").remove(); // Cleanup tooltip
        d3.select("body").selectAll(".absolute.hidden.bg-slate-800").remove(); // Cleanup tooltip dark
      };
  }, [isPaused, onNodeClick]);

  return <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

export default function SimulationCanvas() {
  const navigate = useNavigate();
  const { id: simId } = useParams();
  const [activeTab, setActiveTab] = useState('Network');
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);

  // Real simulation state
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [simLoading, setSimLoading] = useState(true);
  const [runStatus, setRunStatus] = useState<string>('running');

  // Live data from SSE
  const [events, setEvents] = useState<any[]>([]);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [beliefShift, setBeliefShift] = useState(0);
  const [unfollowRate, setUnfollowRate] = useState(0);
  const [tick, setTick] = useState(0);

  // Fetch simulation data on mount
  useEffect(() => {
    if (!simId) return;
    simulationsApi.get(simId)
      .then(sim => {
        setSimulation(sim);
        setSimLoading(false);
        setIsPaused(sim.status === 'paused');
        if (sim.status === 'completed' || sim.status === 'failed' || sim.status === 'canceled') {
          setRunStatus(sim.status);
        }
      })
      .catch(() => setSimLoading(false));
  }, [simId]);

  // Connect to SSE stream for live events
  useEffect(() => {
    if (!simId) return;
    // Don't connect if simulation is in terminal state
    if (runStatus === 'completed' || runStatus === 'failed' || runStatus === 'canceled') return;

    const es = createEventSource(`/api/stream/${simId}`);

    es.addEventListener('simulation_event', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setEvents(prev => [data, ...prev].slice(0, 500));
        setTick(t => t + 1);

        // If it's a post/comment, add to feed
        if (data.action_type === 'create_post' || data.action_type === 'create_comment') {
          const feedPost = {
            id: data.event_id || Date.now(),
            author: data.user_name || 'Agent',
            handle: `@${data.user_name || 'agent'}`,
            stance: 'Neutral' as const,
            mbti: '',
            role: '',
            content: data.content || data.text || '',
            time: 'Now',
            likes: 0,
            reposts: 0,
            comments: 0,
            viral: false,
          };
          setPosts(prev => [feedPost, ...prev].slice(0, 50));
        }

        // Update metrics from events
        if (data.action_type === 'like_post') setBeliefShift(prev => Math.min(prev + 1, 100));
        if (data.action_type === 'dislike_post') setBeliefShift(prev => Math.max(prev - 1, 0));
        if (data.action_type === 'unfollow') setUnfollowRate(prev => prev + 1);
      } catch {}
    });

    es.addEventListener('run_state', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setRunStatus(data.status || 'running');
        if (data.step && data.total) {
          setProgress((data.step / data.total) * 100);
        }
      } catch {}
    });

    es.addEventListener('simulation_ended', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setRunStatus(data.status || 'completed');
      } catch {}
      es.close();
    });

    es.onerror = () => {
      // EventSource auto-reconnects on most errors
    };

    return () => es.close();
  }, [simId, runStatus]);

  // Control actions
  const handlePause = async () => {
    if (!simId) return;
    try { await simulationsApi.pause(simId); setIsPaused(true); } catch {}
  };
  const handleResume = async () => {
    if (!simId) return;
    try { await simulationsApi.resume(simId); setIsPaused(false); } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">

      {/* Terminal status banner */}
      {(runStatus === 'completed' || runStatus === 'failed' || runStatus === 'canceled') && (
        <div className={cn("px-6 py-2 text-center text-sm font-bold shrink-0",
          runStatus === 'completed' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          runStatus === 'failed' && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          runStatus === 'canceled' && "bg-slate-500/10 text-slate-600 dark:text-slate-400",
        )}>
          Simulation {runStatus}.
          {runStatus === 'completed' && <button onClick={() => navigate(`/reports/${simId}`)} className="underline ml-2">View Report →</button>}
        </div>
      )}

      {/* 1. HEADER */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm dark:shadow-slate-900/20">
        <div className="flex items-center gap-4">
          <Link to="/simulations" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{simulation?.name || 'Simulation'}</h1>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider",
                isPaused ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"
              )}>
                {!isPaused && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>}
                {isPaused ? 'Paused' : `Live (${Math.floor(progress)}%)`}
              </span>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="hidden lg:flex items-center gap-8 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Audience</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{(simulation?.agent_count_final || simulation?.agent_count_requested || 0).toLocaleString()} Agents</span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Round</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">4 / 10</span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Credits Used</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">1,250</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm shadow-sm">
            <Copy className="w-4 h-4" /> Clone
          </button>
          <button 
            onClick={() => navigate(`/reports/${simId}`)}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-sm shadow-sm"
          >
            <Square className="w-4 h-4" /> End & Report
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. COLONNA SINISTRA: Control & Filters */}
        <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/50 flex flex-col overflow-y-auto shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800/50">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> Platforms
            </h3>
            <div className="space-y-1">
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" />
                <MessageCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span className="text-sm font-medium text-slate-700 dark:text-slate-300">X / Twitter</span>
              </label>
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" />
                <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reddit</span>
              </label>
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" />
                <Heart className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Instagram</span>
              </label>
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" />
                <Film className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span className="text-sm font-medium text-slate-700 dark:text-slate-300">TikTok</span>
              </label>
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" />
                <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn</span>
              </label>
            </div>
          </div>

          <div className="p-3 border-b border-slate-200 dark:border-slate-800/50">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Segments
            </h3>
            <div className="space-y-1">
              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gen Z (18-24)</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">4.5k</span>
              </label>
              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600 bg-transparent" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Millennials</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">3.2k</span>
              </label>
            </div>
          </div>

          <div className="p-3 border-b border-slate-200 dark:border-slate-800/50">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Stance
            </h3>
            <div className="space-y-1">
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-600 bg-transparent" />
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Supportive</span>
              </label>
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-600 bg-transparent" />
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Opposing</span>
              </label>
              <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-slate-600 focus:ring-slate-600 bg-transparent" />
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Neutral</span>
              </label>
            </div>
          </div>

          <div className="p-3">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Smart Filters
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Influential Agents Only
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors border border-rose-100 dark:border-rose-500/20">
                Isolate Patient Zero
              </button>
            </div>
          </div>
        </aside>

        {/* 3. AREA CENTRALE: Modalità di Osservazione */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative">
          
          {/* Tabs */}
          <div className="flex items-center px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/50 shrink-0 overflow-x-auto scrollbar-hide z-10 shadow-sm">
            {[
              { id: 'Network', icon: Network },
              { id: 'Feed', icon: MessageSquare },
              { id: 'Geo', icon: MapPin },
              { id: 'Timeline', icon: Clock },
              { id: 'Segments', icon: Users },
              { id: 'Compare', icon: GitCompare },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative whitespace-nowrap",
                  activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Canvas Content Area */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* NETWORK TAB */}
            {activeTab === 'Network' && (
              <div className="absolute inset-0 bg-[#f8fafc] dark:bg-slate-950 overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }}></div>
                
                {/* Canvas Controls (Top Right) */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-lg shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-lg shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* D3 Force Graph */}
                <div className="absolute inset-0">
                  <ForceGraph isPaused={isPaused} onNodeClick={setSelectedAgent} />
                </div>

                {/* Selected Node Deep Dive Drawer */}
                {selectedAgent && (
                  <div className="absolute top-0 right-0 w-96 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800/50 shadow-2xl dark:shadow-slate-900/50 z-30 animate-in slide-in-from-right duration-300 flex flex-col">
                    {/* Drawer Header */}
                    <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 flex items-center justify-between shrink-0 border-b border-transparent dark:border-slate-800/50">
                      <div className="flex items-center gap-2">
                        {selectedAgent.id === 30 ? (
                          <Zap className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Users className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {selectedAgent.id === 30 ? 'Patient Zero' : 'Agent Deep Dive'}
                        </span>
                      </div>
                      <button onClick={() => setSelectedAgent(null)} className="text-slate-400 dark:text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {/* Identity */}
                      <div className="flex items-start gap-4 mb-6">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedAgent.name}&backgroundColor=f8fafc`} alt={selectedAgent.name} className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm" />
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedAgent.name}</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{selectedAgent.handle}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {selectedAgent.role}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <BrainCircuit className="w-3 h-3" /> {selectedAgent.mbti}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stance & Risk */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Stance Attuale</p>
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-md border inline-block",
                            selectedAgent.stance === 'Supportive' ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" :
                            selectedAgent.stance === 'Opposing' ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" :
                            "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                          )}>
                            {selectedAgent.stance}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Risk Score</p>
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-md border inline-block",
                            selectedAgent.id === 30 ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                          )}>
                            {selectedAgent.id === 30 ? 'High (94/100)' : 'Low (12/100)'}
                          </span>
                        </div>
                      </div>

                      {/* Psychological Profile */}
                      <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Psychological Profile
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                              <span className="text-slate-500 dark:text-slate-400">Rationality vs Emotivity</span>
                              <span className="text-slate-700 dark:text-slate-300">70% Razionale</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[70%]"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                              <span className="text-slate-500 dark:text-slate-400">Change Resistance</span>
                              <span className="text-slate-700 dark:text-slate-300">{selectedAgent.id === 30 ? '85% Alta' : '40% Media'}</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className={cn("h-full", selectedAgent.id === 30 ? "bg-rose-500 w-[85%]" : "bg-amber-500 w-[40%]")}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Current Thought */}
                      <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Current Thought
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-l-4 text-sm text-slate-700 dark:text-slate-300 italic shadow-sm">
                          "{selectedAgent.content}"
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 mt-auto">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                          <MessageCircle className="w-4 h-4" /> Live Interview (Agent Chat)
                        </button>
                        <button className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                          <Clock className="w-4 h-4" /> View Full History
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FEED TAB */}
            {activeTab === 'Feed' && (
              <div className="absolute inset-0 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-2xl mx-auto space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-xl p-5 shadow-sm hover:shadow-md dark:shadow-slate-900/20 transition-shadow relative overflow-hidden animate-in fade-in slide-in-from-top-4">
                      {post.viral && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600"></div>}
                      {!post.viral && post.stance === 'Supportive' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>}
                      
                      <div className="flex items-center gap-2 text-xs font-bold mb-4 pl-1">
                        {post.viral && (
                          <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-500/20">
                            <Flame className="w-3.5 h-3.5" /> Post Virale
                          </span>
                        )}
                        {post.patientZero && (
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                            <Network className="w-3.5 h-3.5" /> Patient Zero
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${post.author}&backgroundColor=f8fafc`} alt="Avatar" className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{post.author}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">{post.handle}</span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">{post.time}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                              post.stance === 'Supportive' ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" :
                              post.stance === 'Opposing' ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" :
                              "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            )}>
                              {post.stance}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                              {post.mbti}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                              <BrainCircuit className="w-3 h-3" /> {post.role}
                            </div>
                          </div>

                          <p className="text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed mb-4">{post.content}</p>

                          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><MessageCircle className="w-4 h-4" /> {post.comments}</button>
                            <button className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"><Repeat className="w-4 h-4" /> {post.reposts}</button>
                            <button className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"><Heart className="w-4 h-4" /> {post.likes}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GEO TAB — MapLibre GL (WebGL, GPU-accelerated) */}
            {activeTab === 'Geo' && (
              <div className="absolute inset-0 bg-[#0f172a] overflow-hidden z-0">
                <Map
                  mapLib={maplibregl}
                  initialViewState={{ longitude: 10, latitude: 35, zoom: 2.5 }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                  attributionControl={false}
                  minZoom={1.5}
                  maxZoom={12}
                >
                  <NavigationControl position="top-right" showCompass={false} />

                  {/* Agent cluster points as GeoJSON */}
                  <Source
                    id="agent-clusters"
                    type="geojson"
                    data={{
                      type: 'FeatureCollection',
                      features: [
                        {
                          type: 'Feature',
                          geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
                          properties: { name: 'New York', stance: 'supportive', pct: 35, agents: 350, color: '#10b981', radius: 14 },
                        },
                        {
                          type: 'Feature',
                          geometry: { type: 'Point', coordinates: [9.19, 45.4642] },
                          properties: { name: 'Milano', stance: 'opposing', pct: 45, agents: 450, color: '#f43f5e', radius: 22, epicenter: true },
                        },
                        {
                          type: 'Feature',
                          geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
                          properties: { name: 'Tokyo', stance: 'neutral', pct: 20, agents: 200, color: '#3b82f6', radius: 10 },
                        },
                      ],
                    }}
                  >
                    {/* Outer glow ring for epicenter */}
                    <Layer
                      id="epicenter-glow"
                      type="circle"
                      filter={['==', ['get', 'epicenter'], true]}
                      paint={{
                        'circle-radius': 32,
                        'circle-color': '#f43f5e',
                        'circle-opacity': 0.15,
                        'circle-blur': 1,
                      }}
                    />
                    {/* Main cluster circles */}
                    <Layer
                      id="cluster-circles"
                      type="circle"
                      paint={{
                        'circle-radius': ['get', 'radius'],
                        'circle-color': ['get', 'color'],
                        'circle-opacity': 0.6,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': ['get', 'color'],
                        'circle-stroke-opacity': 0.9,
                      }}
                    />
                    {/* Labels */}
                    <Layer
                      id="cluster-labels"
                      type="symbol"
                      layout={{
                        'text-field': ['get', 'name'],
                        'text-size': 11,
                        'text-offset': [0, 2.2],
                        'text-anchor': 'top',
                        'text-font': ['Open Sans Bold'],
                      }}
                      paint={{
                        'text-color': '#e2e8f0',
                        'text-halo-color': '#0f172a',
                        'text-halo-width': 1.5,
                      }}
                    />
                  </Source>
                </Map>

                <div className="absolute bottom-24 left-6 bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700 dark:border-slate-800 p-5 rounded-xl backdrop-blur-md z-[1000] shadow-2xl w-72">
                  <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" /> Geographic Distribution
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between gap-4 mb-1">
                        <span className="text-slate-300">Europe (Epicenter)</span>
                        <span className="text-rose-400 font-bold">45%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-[45%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between gap-4 mb-1">
                        <span className="text-slate-300">North America</span>
                        <span className="text-emerald-400 font-bold">35%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[35%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between gap-4 mb-1">
                        <span className="text-slate-300">Asia Pacific</span>
                        <span className="text-blue-400 font-bold">20%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[20%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'Timeline' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
                <Clock className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Timeline View</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">Activity volume, sentiment shifts and key turning points over simulated time. Will render real-time once connected to the event stream.</p>
              </div>
            )}

            {/* SEGMENTS TAB */}
            {activeTab === 'Segments' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
                <Users className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Segments View</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">Compare reactions across audience segments — per-segment trends, objections and amplification patterns. Available after audience preparation completes.</p>
              </div>
            )}

            {/* COMPARE TAB */}
            {activeTab === 'Compare' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
                <GitCompare className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Compare View</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">Side-by-side observation of two simulation variants. Open the Compare Lab for full A/B analysis.</p>
              </div>
            )}

            {/* Playback Controls (Bottom Center) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 shadow-xl dark:shadow-slate-900/50 rounded-full px-6 py-3 flex items-center gap-6 z-20">
              <button 
                onClick={() => isPaused ? handleResume() : handlePause()}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
              >
                {isPaused ? <Play className="w-5 h-5 ml-1" /> : <Pause className="w-5 h-5" />}
              </button>
              
              <div className="flex flex-col gap-1 w-96">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>Round 1</span>
                  <span className="text-blue-600 dark:text-blue-400">Round 4 (Live)</span>
                  <span>Round 10</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full relative cursor-pointer">
                  <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-blue-600 rounded-full shadow-sm transition-all duration-1000" style={{ left: `calc(${progress}% - 8px)` }}></div>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 w-16 text-right font-mono">
                00:14:{String(tick % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
        </main>

        {/* 4. COLONNA DESTRA: Live Metrics & Insights */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800/50 flex flex-col overflow-y-auto shrink-0 z-10 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.5)]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Live Dynamics
            </h3>
            
            {/* Belief Shift */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Belief Shift (Conversione)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{beliefShift}%</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-tight mb-2">
                Il {beliefShift}% degli agenti "Neutrali" è passato a "Supportive" nell'ultimo round.
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${beliefShift}%` }}></div>
              </div>
            </div>

            {/* Toxic Drift / Backlash */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Toxic Drift</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">Allerta</span>
              </div>
              <div className={cn("bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg p-3 mt-2 transition-colors", !isPaused && tick % 2 === 0 && "bg-rose-100 dark:bg-rose-500/20")}>
                <h5 className="text-[10px] font-bold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" /> Backlash Risk
                </h5>
                <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 leading-tight">
                  Negative sentiment spike detected in "Marketing Managers" cluster.
                </p>
              </div>
            </div>

            {/* Unfollow Rate */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Relationship Breaks (Unfollow)</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{unfollowRate} / min</span>
              </div>
              <div className="flex items-end gap-1 h-8 mt-2">
                {[10, 15, 12, 25, 45, 40, unfollowRate].map((val, i) => (
                  <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-sm relative group">
                    <div className="absolute bottom-0 w-full bg-rose-400 dark:bg-rose-500 rounded-t-sm transition-all duration-500" style={{ height: `${(val/60)*100}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-500" /> Causality
            </h3>
            
            {/* Top Amplifiers */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Amplifiers</p>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=f8fafc" alt="David" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">David C. <span className="text-slate-400 dark:text-slate-500 font-normal">@david_ceo</span></p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+2.4k reach (Supportive)</p>
                </div>
              </div>
              <div 
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer border",
                  selectedAgent?.id === 30 ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                )}
                onClick={() => setSelectedAgent({
                  id: 30, group: 'opposing', radius: 16, name: 'Marco R.', handle: '@marcor_mkt', 
                  role: 'Marketing Manager', mbti: 'ESFJ', stance: 'Opposing', 
                  content: "Non capisco perché abbiano rimosso il piano annuale scontato. È un problema enorme."
                } as any)}
              >
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Marco&backgroundColor=f8fafc" alt="Marco" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">Marco R. <span className="text-slate-400 dark:text-slate-500 font-normal">@marcor_mkt</span></p>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">+5.1k reach (Opposing)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {['#pricing', '#free-tier', '#enterprise', '#alternatives', '#migration'].map(tag => (
                <span key={tag} className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Run Health */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Run Health
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Events/sec</span>
                <span className="font-bold text-slate-900 dark:text-white">142</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Polarization</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">0.64</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Queue Depth</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Low</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
