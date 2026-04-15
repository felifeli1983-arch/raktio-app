import React, { useRef, useState, useEffect } from 'react';
import { PageLoading, PageError, PageEmpty } from '../components/PageStates';
import {
  FileText, Download, Share2, TrendingUp, ArrowLeft, Zap, Target,
  AlertTriangle, Lightbulb, Users, Globe, Hash, BarChart3, Eye,
  Network, Quote, CheckCircle2, ShieldAlert, MapPin, MessageSquare,
  Flame, ChevronRight, Layers, BookOpen, Info, Loader2, AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { reportsApi, Report as ReportType, ReportSection } from '../lib/api/reports';
import { getErrorMessage } from '../lib/api/client';

/* ── Section icon mapping ── */
const SECTION_ICONS: Record<string, React.ElementType> = {
  'executive_summary': Zap,
  'simulation_context': Info,
  'outcome_scorecard': BarChart3,
  'key_findings': Lightbulb,
  'belief_shifts': TrendingUp,
  'patient_zero': Flame,
  'segment_analysis': Users,
  'geography_analysis': Globe,
  'platform_analysis': Hash,
  'exposure_analysis': Eye,
  'faction_analysis': Network,
  'evidence': Quote,
  'recommendations': Lightbulb,
  'confidence_limitations': ShieldAlert,
};

function SectionCard({ id, num, title, icon: Icon, children }: {
  id: string;
  num: number;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
          {num}
        </span>
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        <h2 className="font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function ScoreCard({ label, value, max, color, icon: Icon }: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ElementType;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon className="w-4 h-4" />
        <h3 className="text-xs font-bold uppercase tracking-wider">{label}</h3>
      </div>
      <p className="text-3xl font-bold text-white mb-2">{value}<span className="text-base text-slate-400">/{max}</span></p>
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function sectionLabel(key: string): string {
  return key
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Render markdown-ish text as simple paragraphs */
function MarkdownContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

function SectionStatusIndicator({ status }: { status: string }) {
  if (status === 'generating') {
    return (
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 py-8 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Generating this section...</span>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 py-8 justify-center">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">This section failed to generate.</span>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 py-8 justify-center">
        <Loader2 className="w-5 h-5" />
        <span className="text-sm font-medium">Pending...</span>
      </div>
    );
  }
  return null;
}

export default function Report() {
  const navigate = useNavigate();
  const { id } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportType | null>(null);

  const fetchReport = () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    reportsApi.get(id)
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(getErrorMessage(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={fetchReport} />;

  if (!report) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <PageEmpty
          icon={FileText}
          title="Report not found"
          description="This report does not exist or has been removed."
          actionLabel="Back to Reports"
          onAction={() => navigate('/reports')}
        />
      </div>
    );
  }

  const scorecard = report.scorecard_json ?? {};
  const summary = report.summary_json ?? {};
  const sections = report.sections ?? [];

  const reportTitle = summary.topic_summary || `Simulation ${report.simulation_id}`;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col">

      {/* -- Header (sticky) -- */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 px-8 py-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-bold text-sm mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" /> {reportTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span>{formatDate(report.created_at)}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>ID: {report.simulation_id}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {sections.length} sections
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold",
                  report.status === 'completed' && 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
                  report.status === 'generating' && 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
                  report.status === 'partial' && 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
                  report.status === 'failed' && 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
                  report.status === 'pending' && 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
                )}>
                  {report.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -- Body: sidebar + content -- */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">

        {/* Left sidebar nav */}
        <nav className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 overflow-y-auto py-6 px-4 gap-0.5">
          {/* Executive summary link (always first) */}
          <button
            onClick={() => scrollToSection('executive-summary')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors">
              1
            </span>
            <span className="truncate">Executive Summary</span>
          </button>
          {sections.map((s, i) => (
            <button
              key={s.report_section_id}
              onClick={() => scrollToSection(s.section_key)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
            >
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors">
                {i + 2}
              </span>
              <span className="truncate">{sectionLabel(s.section_key)}</span>
            </button>
          ))}
        </nav>

        {/* Main content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* -- 1. Executive Summary (dark hero card) -- */}
          <section id="executive-summary" className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
              <Zap className="w-5 h-5 text-blue-400" /> Executive Summary
            </h2>

            {/* Scorecard metrics */}
            {Object.keys(scorecard).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 mb-6">
                {scorecard.risk_score != null && (
                  <ScoreCard label="Risk Score" value={scorecard.risk_score} max={10} color="bg-rose-500" icon={ShieldAlert} />
                )}
                {scorecard.resonance != null && (
                  <ScoreCard label="Resonance" value={scorecard.resonance} max={10} color="bg-blue-500" icon={TrendingUp} />
                )}
                {scorecard.controversy != null && (
                  <ScoreCard label="Controversy" value={scorecard.controversy} max={10} color="bg-amber-500" icon={Flame} />
                )}
                {scorecard.adoption_potential != null && (
                  <ScoreCard label="Adoption Potential" value={scorecard.adoption_potential} max={10} color="bg-emerald-500" icon={Target} />
                )}
              </div>
            ) : (
              <div className="relative z-10 mb-6 text-sm text-slate-300">
                No scorecard data available yet.
              </div>
            )}

            {/* Summary / recommendation */}
            {summary.recommendation ? (
              <div className="relative z-10 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="text-white font-semibold">Recommendation:</span>{' '}
                  {summary.recommendation}
                </p>
              </div>
            ) : summary.executive_summary ? (
              <div className="relative z-10 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-300 leading-relaxed">{summary.executive_summary}</p>
              </div>
            ) : sections.length > 0 && sections[0].content_markdown ? (
              <div className="relative z-10 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{sections[0].content_markdown}</p>
              </div>
            ) : null}
          </section>

          {/* -- Dynamic sections -- */}
          {sections.map((section, i) => {
            const IconComponent = SECTION_ICONS[section.section_key] ?? FileText;
            const num = i + 2; // executive summary is 1

            return (
              <SectionCard
                key={section.report_section_id}
                id={section.section_key}
                num={num}
                title={sectionLabel(section.section_key)}
                icon={IconComponent}
              >
                {section.status !== 'completed' ? (
                  <SectionStatusIndicator status={section.status} />
                ) : section.content_markdown ? (
                  <MarkdownContent text={section.content_markdown} />
                ) : section.structured_json ? (
                  <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(section.structured_json, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-400 italic">No content available for this section.</p>
                )}
              </SectionCard>
            );
          })}

          {/* Confidence notes (if present at report level) */}
          {report.confidence_notes && (
            <SectionCard
              id="confidence-notes"
              num={sections.length + 2}
              title="Confidence & Limits"
              icon={ShieldAlert}
            >
              <MarkdownContent text={report.confidence_notes} />
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
}
