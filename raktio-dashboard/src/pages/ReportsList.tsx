import React, { useState, useEffect } from 'react';
import { PageLoading, PageError, PageEmpty } from '../components/PageStates';
import {
  FileText, Search, Filter, Download, MoreHorizontal, Calendar,
  ChevronRight, Activity, ShieldAlert, BarChart3, Clock, BadgeCheck,
  Loader2, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { reportsApi, Report } from '../lib/api/reports';

function deriveRisk(report: Report): 'High' | 'Medium' | 'Low' {
  const score = report.scorecard_json?.risk_score;
  if (score == null) return 'Low';
  if (score >= 7) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

function statusBadge(status: Report['status']) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: 'Ready', cls: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
    partial:   { label: 'Partial', cls: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' },
    generating:{ label: 'Generating', cls: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' },
    pending:   { label: 'Pending', cls: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
    failed:    { label: 'Failed', cls: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' },
  };
  const s = map[status] ?? map.pending;
  return s;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function reportName(report: Report): string {
  if (report.summary_json?.topic_summary) return report.summary_json.topic_summary;
  return `Report ${report.simulation_id}`;
}

export default function ReportsList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);

  const fetchReports = () => {
    setError(null);
    setLoading(true);
    reportsApi.list()
      .then(data => {
        setReports(data.items);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load reports');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      reportName(r).toLowerCase().includes(q) ||
      r.report_id.toLowerCase().includes(q) ||
      r.simulation_id.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  const completedCount = reports.filter(r => r.status === 'completed').length;
  const successRate = reports.length > 0 ? Math.round((completedCount / reports.length) * 100) : 0;
  const highRiskCount = reports.filter(r => deriveRisk(r) === 'High').length;

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={fetchReports} />;

  if (reports.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <PageEmpty
          icon={FileText}
          title="No reports yet"
          description="Reports will appear here once you run a simulation and generate a report."
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Reports Archive</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and download detailed reports from past simulations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm shadow-sm">
            <Filter className="w-4 h-4" /> Advanced Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Reports Generated</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{reports.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Success Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{successRate}%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">High Risk Reports</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{highRiskCount}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/80">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span className="hidden sm:inline">Sort by:</span>
            <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100">
              <option>Date (Newest)</option>
              <option>Date (Oldest)</option>
              <option>Name (A-Z)</option>
              <option>Risk (High-Low)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold">Report Name</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Risk Level</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredReports.map((report) => {
                const risk = deriveRisk(report);
                const badge = statusBadge(report.status);
                return (
                  <tr key={report.report_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <Link to={`/reports/${report.simulation_id}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {reportName(report)}
                          </Link>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {report.report_id} {report.sections.length > 0 && `\u2022 ${report.sections.length} sections`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border",
                        badge.cls
                      )}>
                        {report.status === 'generating' && <Loader2 className="w-3 h-3 animate-spin" />}
                        {report.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        {report.status === 'completed' && <BadgeCheck className="w-3 h-3" />}
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        {formatDate(report.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border",
                        risk === 'High' ? "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50" :
                        risk === 'Medium' ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" :
                        "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                      )}>
                        {risk === 'High' && <ShieldAlert className="w-3 h-3" />}
                        {risk === 'Medium' && <Activity className="w-3 h-3" />}
                        {risk === 'Low' && <BadgeCheck className="w-3 h-3" />}
                        {risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/80">
          <span>Showing {filteredReports.length} of {reports.length} reports</span>
        </div>
      </div>
    </div>
  );
}
