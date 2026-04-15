import React, { useState, useEffect } from 'react';
import {
  FileText, Sparkles, Settings, Rocket, UploadCloud,
  ArrowRight, ArrowLeft, CheckCircle2, Users, Globe, Activity,
  AlertCircle, BrainCircuit, Zap, Clock, Database,
  Link2, Plus, Trash2, Target, TrendingUp, Shield,
  Sliders, Radio, BarChart3, Hash, Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { simulationsApi, Simulation } from '../lib/api/simulations';
import { billingApi, CreditEstimate } from '../lib/api/billing';

const STEPS = [
  { num: 1, label: 'Brief', icon: FileText },
  { num: 2, label: 'Configuration', icon: Settings },
  { num: 3, label: 'Sources', icon: Database },
  { num: 4, label: 'Understanding', icon: BrainCircuit },
  { num: 5, label: 'Plan', icon: Target },
  { num: 6, label: 'Audience', icon: Users },
  { num: 7, label: 'Review & Launch', icon: Rocket },
];

const PLATFORMS = [
  { id: 'x', label: 'X / Twitter' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
];

const DURATION_PRESETS = ['6h', '12h', '24h', '48h', '72h'];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Italy', 'Germany', 'France',
  'Spain', 'Brazil', 'Japan', 'India', 'Canada', 'Australia',
];

const RECSYS_OPTIONS = [
  { id: 'random', label: 'Random', desc: 'Uniform random sampling across demographics' },
  { id: 'reddit', label: 'Reddit', desc: 'Community-weighted sampling from subreddit data' },
  { id: 'personalized', label: 'Personalized', desc: 'Persona-matched agent selection' },
  { id: 'twhin-bert', label: 'TwHIN-BERT', desc: 'Twitter heterogeneous graph embeddings' },
];

export default function NewSimulation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // API wiring state
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [creditEstimateData, setCreditEstimateData] = useState<CreditEstimate | null>(null);

  // Step 1: Brief
  const [brief, setBrief] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Step 2: Configuration
  const [platforms, setPlatforms] = useState<string[]>(['x']);
  const [country, setCountry] = useState('Italy');
  const [duration, setDuration] = useState('24h');
  const [memoryMode, setMemoryMode] = useState<'fresh' | 'persistent'>('fresh');

  // Step 3: Sources
  const [sources, setSources] = useState<{ url: string; label: string }[]>([
    { url: 'https://blog.acme.com/pricing-update', label: 'Company Blog — Pricing Update' },
  ]);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [sourceFiles, setSourceFiles] = useState<string[]>([]);

  // Step 4: Understanding (analyzing state)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Step 6: Audience
  const [audienceSize, setAudienceSize] = useState(10000);
  const [recsys, setRecsys] = useState('personalized');

  // Step 3 → Step 4: Create simulation + understand
  const handleStartAnalysis = async () => {
    setStepLoading(true);
    setStepError(null);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setStep(4);
    try {
      let simId = simulationId;
      if (!simId) {
        const created = await simulationsApi.create({
          name: brief.slice(0, 80) || 'New Simulation',
          brief_text: brief,
          duration_preset: duration,
          platform_scope: platforms,
          geography_scope: { countries: [country] },
          recsys_choice: recsys as any,
          memory_mode: memoryMode,
          simulation_language: country === 'Italy' ? 'it' : country === 'Japan' ? 'ja' : country === 'Brazil' ? 'pt' : country === 'Spain' ? 'es' : country === 'France' ? 'fr' : country === 'Germany' ? 'de' : 'en',
        });
        simId = created.simulation_id;
        setSimulationId(simId);
        setSimulation(created);
      }
      const understood = await simulationsApi.understand(simId);
      setSimulation(understood);
      setAnalysisComplete(true);
    } catch (err: any) {
      setStepError(err.message || 'Failed to analyze brief');
    } finally {
      setIsAnalyzing(false);
      setStepLoading(false);
    }
  };

  // Step 4 → Step 5: Plan
  const handlePlan = async () => {
    if (!simulationId) return;
    setStepLoading(true);
    setStepError(null);
    try {
      const planned = await simulationsApi.plan(simulationId);
      setSimulation(planned);
      setStep(5);
    } catch (err: any) {
      setStepError(err.message || 'Failed to create plan');
    } finally {
      setStepLoading(false);
    }
  };

  // Step 5 → Step 6: Prepare audience
  const handlePrepareAudience = async () => {
    if (!simulationId) return;
    setStepLoading(true);
    setStepError(null);
    try {
      const prepared = await simulationsApi.prepareAudience(simulationId);
      setSimulation(prepared);
      setStep(6);
    } catch (err: any) {
      setStepError(err.message || 'Failed to prepare audience');
    } finally {
      setStepLoading(false);
    }
  };

  // Step 6 → Step 7: Credit estimate + review
  const handleReview = async () => {
    setStepLoading(true);
    setStepError(null);
    try {
      const est = await billingApi.estimate({
        agent_count: simulation?.agent_count_final || audienceSize,
        duration_preset: duration,
        platform_scope: platforms,
        geography_scope: { countries: [country] },
      });
      setCreditEstimateData(est);
      setStep(7);
    } catch (err: any) {
      setStepError(err.message || 'Failed to estimate credits');
    } finally {
      setStepLoading(false);
    }
  };

  // Step 7: Launch
  const handleLaunch = async () => {
    if (!simulationId) return;
    setStepLoading(true);
    setStepError(null);
    try {
      await simulationsApi.launch(simulationId);
      navigate(`/sim/${simulationId}/canvas`);
    } catch (err: any) {
      setStepError(err.message || 'Failed to launch simulation');
    } finally {
      setStepLoading(false);
    }
  };

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addSource = () => {
    if (newSourceUrl.trim()) {
      setSources((prev) => [...prev, { url: newSourceUrl.trim(), label: newSourceUrl.trim() }]);
      setNewSourceUrl('');
    }
  };

  const removeSource = (idx: number) => {
    setSources((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatAudienceSize = (n: number) => n.toLocaleString();

  const creditEstimate = {
    audience: Math.round(audienceSize / 20),
    execution: Math.round((audienceSize / 10) * (parseInt(duration) / 6)),
    sources: sources.length * 25,
  };
  const totalCredits = creditEstimate.audience + creditEstimate.execution + creditEstimate.sources;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* Header & Stepper */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
            New Simulation
          </h1>

          <div className="flex items-center justify-between relative">
            {/* Background track */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
            {/* Progress fill */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 dark:bg-blue-500 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors bg-white dark:bg-slate-900',
                    step > s.num && 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400',
                    step === s.num && 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-600',
                    step < s.num && 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  )}
                >
                  {step > s.num ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider absolute -bottom-6 whitespace-nowrap',
                    step >= s.num ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none p-8 mt-12 min-h-[400px]">

          {/* ─── STEP 1: BRIEF ─── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  What do you want to test?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Paste your press release draft, social post, or pricing strategy change.
                </p>
              </div>

              <textarea
                className="w-full h-40 p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="e.g. We want to launch a new annual subscription model that removes the free plan but adds enterprise features. We fear backlash from the indie developer community..."
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              />

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 mb-3 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Upload materials (Optional)
                </p>
                <p className="text-xs mt-1 mb-4">
                  Drag your draft in PDF, DOCX, or product screenshots here
                </p>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50 mt-2">
                  <Database className="w-4 h-4" />
                  Company context will be loaded automatically from your Knowledge Base.
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!brief.trim()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Next: Configuration <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: CONFIGURATION ─── */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Simulation Configuration
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Choose the platforms, geography, duration and memory behavior.
                </p>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Platforms to Simulate
                </label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map((p) => {
                    const selected = platforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-colors',
                          selected
                            ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        )}
                      >
                        {selected && <CheckCircle2 className="w-4 h-4" />}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Geography */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Geography
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full max-w-xs p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Duration Presets */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Simulation Duration
                </label>
                <div className="flex gap-3">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        'px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-colors',
                        duration === d
                          ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Mode */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Memory Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMemoryMode('fresh')}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-colors',
                      memoryMode === 'fresh'
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className={cn('w-4 h-4', memoryMode === 'fresh' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')} />
                      <span className={cn('font-bold text-sm', memoryMode === 'fresh' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300')}>
                        Fresh
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Agents start with no prior memory. Clean-slate simulation every run.
                    </p>
                  </button>
                  <button
                    onClick={() => setMemoryMode('persistent')}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-colors',
                      memoryMode === 'persistent'
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Database className={cn('w-4 h-4', memoryMode === 'persistent' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')} />
                      <span className={cn('font-bold text-sm', memoryMode === 'persistent' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300')}>
                        Persistent
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Agents retain memory from previous simulations. Great for longitudinal studies.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={platforms.length === 0}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Next: Sources <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: SOURCES ─── */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Knowledge Sources
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Link external sources the AI will use to contextualize your simulation.
                </p>
              </div>

              {/* Linked sources list */}
              <div className="space-y-3">
                {sources.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {s.label}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {s.url}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSource(i)}
                      className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0 ml-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add source */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSource()}
                  placeholder="Paste a URL (article, blog post, report...)"
                  className="flex-1 p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addSource}
                  disabled={!newSourceUrl.trim()}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Upload additional files */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                <UploadCloud className="w-6 h-6 mb-2 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Upload additional files
                </p>
                <p className="text-xs mt-1">PDF, CSV, DOCX, TXT</p>
                {sourceFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sourceFiles.map((f, i) => (
                      <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleStartAnalysis}
                  disabled={stepLoading}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
                >
                  {stepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analyze with AI <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: UNDERSTANDING ─── */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Analyzing your brief...
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-md">
                    The AI is processing your inputs, sources, and platform context to generate an understanding of the simulation landscape.
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      AI Understanding
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      The AI has analyzed your brief and produced the following insights.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-5">
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Detected Risk
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        High backlash risk (Toxic Drift) in the "Indie Developers" segment due to free plan removal. Potential viral negativity on X and Reddit.
                      </p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-5">
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Suggested Audience
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        10,000 Agents. Mix: 60% Indie Developers, 30% Tech Leads, 10% CTOs.
                      </p>
                    </div>
                  </div>

                  {/* Stance Distribution */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-5">
                    <h3 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Estimated Stance Distribution
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                          <span>Supportive</span><span>15%</span>
                        </div>
                        <div className="h-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-full">
                          <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: '15%' }} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          <span>Neutral</span><span>35%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                          <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full" style={{ width: '35%' }} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                          <span>Opposing</span><span>50%</span>
                        </div>
                        <div className="h-2 bg-rose-200 dark:bg-rose-900/50 rounded-full">
                          <div className="h-full bg-rose-500 dark:bg-rose-400 rounded-full" style={{ width: '50%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Topics */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" /> Key Topics Extracted
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Pricing Change', 'Free Tier Removal', 'Enterprise Features', 'Indie Dev Community', 'Subscription Fatigue', 'Open Source Alternatives', 'Developer Trust'].map((topic) => (
                        <span
                          key={topic}
                          className="text-xs font-bold bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600/50"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(5)}
                      className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      Next: Plan <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── STEP 5: PLAN ─── */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Simulation Plan
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Review the AI-generated plan before proceeding to audience setup.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Goal */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Goal
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    Measure community reaction to free-tier removal and identify messaging strategies that minimize backlash while highlighting enterprise value.
                  </p>
                </div>

                {/* Expected Outcomes */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Expected Outcomes
                  </h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">-</span> Sentiment trajectory over {duration}</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">-</span> Viral risk score per platform</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">-</span> Top counter-narratives identified</li>
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Risk Factors
                  </h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">!</span> Indie dev segment highly polarized</li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">!</span> Possible coordinated negative campaigns</li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">!</span> Cross-platform amplification risk</li>
                  </ul>
                </div>

                {/* Recommended Adjustments */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Recommended Adjustments
                  </h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">+</span> Increase audience to 15,000 for statistical significance</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">+</span> Enable Reddit platform for community threads</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">+</span> Use TwHIN-BERT recsys for realistic engagement</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Next: Audience <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 6: AUDIENCE ─── */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Audience Setup
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Configure audience size and the recommendation system for agent selection.
                </p>
              </div>

              {/* Audience Size Slider */}
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Audience Size</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatAudienceSize(audienceSize)} Agents</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={audienceSize}
                  onChange={(e) => setAudienceSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
                  <span>500 (Fast)</span>
                  <span>50,000 (Enterprise)</span>
                </div>
              </div>

              {/* RecSys Choice */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Recommendation System
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {RECSYS_OPTIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRecsys(r.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-colors',
                        recsys === r.id
                          ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Radio className={cn('w-4 h-4', recsys === r.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')} />
                        <span className={cn('font-bold text-sm', recsys === r.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300')}>
                          {r.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mock Audience Preview */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Audience Preparation Preview
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { segment: 'Indie Developers', count: Math.round(audienceSize * 0.6), color: 'blue' },
                    { segment: 'Tech Leads', count: Math.round(audienceSize * 0.3), color: 'emerald' },
                    { segment: 'CTOs / Executives', count: Math.round(audienceSize * 0.1), color: 'violet' },
                  ].map((seg) => (
                    <div
                      key={seg.segment}
                      className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 text-center"
                    >
                      <p className={cn('text-2xl font-bold mb-1', {
                        'text-blue-600 dark:text-blue-400': seg.color === 'blue',
                        'text-emerald-600 dark:text-emerald-400': seg.color === 'emerald',
                        'text-violet-600 dark:text-violet-400': seg.color === 'violet',
                      })}>
                        {formatAudienceSize(seg.count)}
                      </p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{seg.segment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(5)}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(7)}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Next: Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 7: REVIEW & LAUNCH ─── */}
          {step === 7 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Ready to Launch
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Review all settings below, then launch your simulation.
                </p>
              </div>

              {/* Full Summary */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Configuration Summary
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Platforms</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {platforms.map((p) => PLATFORMS.find((pl) => pl.id === p)?.label).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Geography</span>
                    <span className="font-bold text-slate-900 dark:text-white">{country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Duration</span>
                    <span className="font-bold text-slate-900 dark:text-white">{duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Memory Mode</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">{memoryMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Audience Size</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatAudienceSize(audienceSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">RecSys</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {RECSYS_OPTIONS.find((r) => r.id === recsys)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Sources</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sources.length} linked</span>
                  </div>
                </div>
              </div>

              {/* Brief preview */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Brief
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{brief}</p>
              </div>

              {/* Credit Estimate */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Credit Estimate
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Audience Generation ({formatAudienceSize(audienceSize)})</span>
                    <span className="font-bold text-slate-900 dark:text-white">{creditEstimate.audience.toLocaleString()} Credits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Execution ({duration})</span>
                    <span className="font-bold text-slate-900 dark:text-white">{creditEstimate.execution.toLocaleString()} Credits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Source Processing ({sources.length} sources)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{creditEstimate.sources.toLocaleString()} Credits</span>
                  </div>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-slate-900 dark:text-white">Total Estimated</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{totalCredits.toLocaleString()} Credits</span>
                  </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs p-3 rounded-lg flex items-start gap-2 border border-blue-100/50 dark:border-blue-800/30">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>You have 12,450 credits remaining. Balance after this simulation: {(12450 - totalCredits).toLocaleString()} credits.</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => setStep(6)}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white px-6 py-3 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => navigate('/sim/1/canvas')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <Rocket className="w-5 h-5" /> Launch Simulation
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
