import React, { useState, useEffect } from 'react';
import { PageLoading, PageError } from '../components/PageStates';
import {
  CreditCard, Zap, CheckCircle2, Download,
  Clock, Shield, ArrowRight, BarChart3,
  AlertCircle, Receipt, Activity, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { billingApi, Balance, LedgerEntry } from '../lib/api/billing';
import { getErrorMessage } from '../lib/api/client';

// TODO: Invoices come from the payment provider (Stripe, etc.) — not yet integrated.
const INVOICES = [
  { id: 'INV-2024-001', date: '01 Apr 2026', amount: '€ 499,00', status: 'Paid', plan: 'Enterprise Plan (Monthly)' },
  { id: 'INV-2024-002', date: '15 Mar 2026', amount: '€ 150,00', status: 'Paid', plan: 'Credit Recharge (5,000)' },
  { id: 'INV-2024-003', date: '01 Mar 2026', amount: '€ 499,00', status: 'Paid', plan: 'Enterprise Plan (Monthly)' },
];

export default function Billing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [usage, setUsage] = useState<LedgerEntry[]>([]);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      billingApi.balance(),
      billingApi.usage(10),
    ])
      .then(([bal, usg]) => {
        setBalance(bal);
        setUsage(usg.items);
        setLoading(false);
      })
      .catch(err => {
        setError(getErrorMessage(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={loadData} />;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto relative transition-colors duration-300">

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
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Credits & Billing
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your plan, recharge credits, and monitor simulation usage.
            </p>
          </div>
          <button 
            onClick={() => showToast('Opening credit recharge...')}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400 dark:text-amber-500" /> Recharge Credits
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-8">
        
        {/* Top Row: Balance & Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Balance Card (Premium Feel) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 dark:bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-sm font-bold text-blue-200 dark:text-slate-400 uppercase tracking-wider mb-2">Available Credit Balance</p>
                  <div className="flex items-end gap-3">
                    <h2 className="text-5xl font-bold text-white tracking-tight">{balance?.available_credits?.toLocaleString() ?? '—'}</h2>
                    <span className="text-lg text-blue-200 dark:text-blue-400 font-medium mb-1">
                      {balance ? `~ ${Math.floor(balance.available_credits / 150)} simulations` : ''}
                    </span>
                  </div>
                  {(balance?.reserved_credits ?? 0) > 0 && (
                    <p className="text-xs text-blue-200 dark:text-slate-400 mt-1">
                      {balance!.reserved_credits.toLocaleString()} credits reserved for running simulations
                    </p>
                  )}
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">{balance?.plan?.name ?? 'Enterprise'} Plan Active</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-200 dark:text-slate-400">Estimated usage this month</span>
                  <span className="font-bold text-white">3,550 / 16,000</span>
                </div>
                <div className="w-full bg-white/20 dark:bg-slate-800 rounded-full h-2 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
                <p className="text-xs text-blue-200 dark:text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Unused credits roll over to the next month.
                </p>
              </div>
            </div>
          </div>

          {/* Cost Estimator / Info */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex flex-col">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> How do credits work?
            </h3>
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">1 Base Simulation (10k agents)</strong> costa in media 150 crediti.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">A/B Testing</strong> consuma crediti in base al numero di varianti testate.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Interviste 1:1</strong> con gli agenti consumano 1 credito per messaggio.
                </p>
              </div>
            </div>
            <button 
              onClick={() => showToast('Opening cost calculator...')}
              className="w-full mt-4 py-2 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border border-blue-100 dark:border-slate-700"
            >
              Cost Calculator
            </button>
          </div>
        </div>

        {/* Two Columns: Usage Log & Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Usage Log */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Usage Log
              </h3>
              <button 
                onClick={() => showToast('Loading full history...')}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {usage.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">No usage recorded yet.</div>
              )}
              {usage.map((entry) => {
                const isPositive = entry.amount > 0;
                const costLabel = isPositive ? `+${entry.amount.toLocaleString()} credits` : `${entry.amount.toLocaleString()} credits`;
                return (
                  <div key={entry.ledger_id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.note || entry.event_type}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>
                        {costLabel}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Saldo: {entry.balance_after.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Recent Invoices
              </h3>
              <button 
                onClick={() => navigate('/settings')}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Manage Data
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {INVOICES.map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{invoice.plan}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.date} • {invoice.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{invoice.amount}</p>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{invoice.status}</p>
                    </div>
                    <button 
                      onClick={() => showToast(`Download fattura ${invoice.id} avviato`)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Plans Overview (Static for now) */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your current plan</h3>
          <div className="bg-white dark:bg-slate-800/50 border-2 border-blue-500 dark:border-blue-500/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              ATTIVO
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Plan card: shows balance.plan info when available, else falls back to mock */}
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{balance?.plan?.name ?? 'Enterprise'}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Accesso completo all'OASIS Engine, agenti illimitati nel database, API access e supporto dedicato.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">€ 499<span className="text-sm text-slate-500 dark:text-slate-400 font-normal">/mese</span></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Billed monthly</p>
                </div>
                <button 
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
