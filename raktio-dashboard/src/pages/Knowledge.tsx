import React, { useState } from 'react';
import { 
  Database, UploadCloud, FileText, Link as LinkIcon, 
  CheckCircle2, Clock, Trash2, RefreshCw, Search, 
  Filter, HardDrive, Cpu, AlertCircle, Plus, X, FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

const INITIAL_MOCK_SOURCES = [
  { id: 1, name: 'Brand_Guidelines_2023.pdf', type: 'document', size: '4.2 MB', status: 'active', date: '2 hours ago', tokens: '12.5k' },
  { id: 2, name: 'Q3_Social_Media_Export.csv', type: 'dataset', size: '12.8 MB', status: 'active', date: 'Yesterday', tokens: '84.2k' },
  { id: 3, name: 'Competitor_Analysis_Report.docx', type: 'document', size: '1.1 MB', status: 'processing', date: '10 min ago', tokens: '...' },
  { id: 4, name: 'https://acme.com/about-us', type: 'link', size: '-', status: 'active', date: '3 days ago', tokens: '2.1k' },
  { id: 5, name: 'Crisis_Management_Protocol.pdf', type: 'document', size: '850 KB', status: 'error', date: '5 days ago', tokens: '-' },
];

export default function Knowledge() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [sources, setSources] = useState(INITIAL_MOCK_SOURCES);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const clearSources = () => {
    setSources([]);
    showToast("All sources have been removed.");
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden relative transition-colors duration-300">
      
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
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 shrink-0 z-10 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Knowledge & Sources
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Your organization's long-term memory. Upload Brand Guidelines, Tone of Voice, and historical data. These documents define your brand DNA and provide context for <strong>all</strong> simulations.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {sources.length > 0 && (
              <button onClick={clearSources} className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors mr-2">
                Clear (Demo)
              </button>
            )}
            <button 
              onClick={() => showToast('Opening URL input...')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <LinkIcon className="w-4 h-4" /> Add URL
            </button>
            <button 
              onClick={() => showToast('Opening file selector...')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" /> Upload File
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-8 flex gap-8 overflow-hidden">
        
        {/* Left Sidebar: Stats & Filters */}
        <div className="w-64 shrink-0 flex flex-col gap-6">
          
          {/* Vector DB Status */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">Vector DB Status</h3>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Indexed Tokens</p>
                <p className="text-2xl font-bold">{sources.length > 0 ? '101.3k' : '0'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Sync Status</p>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  Synced
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">Filter by Type</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveFilter('all')}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors", activeFilter === 'all' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
              >
                All sources
              </button>
              <button 
                onClick={() => setActiveFilter('document')}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2", activeFilter === 'document' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
              >
                <FileText className="w-4 h-4" /> Documents (PDF, DOCX)
              </button>
              <button 
                onClick={() => setActiveFilter('dataset')}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2", activeFilter === 'dataset' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
              >
                <HardDrive className="w-4 h-4" /> Datasets (CSV, JSON)
              </button>
              <button 
                onClick={() => setActiveFilter('link')}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2", activeFilter === 'link' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
              >
                <LinkIcon className="w-4 h-4" /> Web Links
              </button>
            </div>
          </div>

        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* Drag & Drop Upload Zone */}
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer shrink-0">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Drag files here to upload</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              We support PDF, DOCX, CSV, JSON, and TXT files up to 50MB. Documents are automatically processed and vectorized for use in simulations.
            </p>
          </div>

          {/* Sources List */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white">Uploaded Sources</h3>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sources.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No sources uploaded</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Upload documents or add URLs to start building your social intelligence memory.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-white dark:bg-slate-800/50 sticky top-0 z-10">
                      <th className="p-4 font-bold">Nome File</th>
                      <th className="p-4 font-bold">Stato</th>
                      <th className="p-4 font-bold">Dimensione</th>
                      <th className="p-4 font-bold">Token</th>
                      <th className="p-4 font-bold">Aggiunto</th>
                      <th className="p-4 font-bold text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {sources.map((source) => (
                      <tr key={source.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              source.type === 'document' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                              source.type === 'dataset' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                              "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            )}>
                              {source.type === 'document' && <FileText className="w-4 h-4" />}
                              {source.type === 'dataset' && <HardDrive className="w-4 h-4" />}
                              {source.type === 'link' && <LinkIcon className="w-4 h-4" />}
                            </div>
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{source.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {source.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                          {source.status === 'processing' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-800/50">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                            </span>
                          )}
                          {source.status === 'error' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-800/50">
                              <AlertCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{source.size}</td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{source.tokens}</td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{source.date}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => showToast(`Deleting ${source.name}...`)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
