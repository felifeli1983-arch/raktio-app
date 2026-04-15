import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, UserPlus, Mail, MoreVertical, 
  CheckCircle2, Clock, ShieldAlert, Building, 
  Key, Lock, Search, Activity, Edit, Trash2, X
} from 'lucide-react';
import { cn } from '../lib/utils';

const TEAM_MEMBERS = [
  { id: 1, name: 'Alessandro Rossi', email: 'a.rossi@acme.com', role: 'Admin', status: 'active', lastActive: 'Now' },
  { id: 2, name: 'Giulia Bianchi', email: 'g.bianchi@acme.com', role: 'Analyst', status: 'active', lastActive: '2 hours ago' },
  { id: 3, name: 'Marco Verdi', email: 'm.verdi@acme.com', role: 'Viewer', status: 'invited', lastActive: '-' },
  { id: 4, name: 'Elena Neri', email: 'e.neri@acme.com', role: 'Analyst', status: 'active', lastActive: 'Yesterday' },
];

export default function Team() {
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'audit'>('members');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Team & Governance
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage access, roles, and monitor workspace activity.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => showToast('Opening invite form...')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-8 flex gap-8 overflow-hidden">
        
        {/* Left Sidebar: Navigation */}
        <div className="w-64 shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('members')}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2", activeTab === 'members' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
              >
                <Users className="w-4 h-4" /> Team Members
              </button>
              <button 
                onClick={() => setActiveTab('roles')}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2", activeTab === 'roles' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
              >
                <Key className="w-4 h-4" /> Roles & Permissions
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2", activeTab === 'audit' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
              >
                <Clock className="w-4 h-4" /> Audit Log
              </button>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm">Workspace Security</h3>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">SSO (SAML)</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">2FA Obbligatoria</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {activeTab === 'members' && (
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80 shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white">Users ({TEAM_MEMBERS.length})</h3>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-900/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-white dark:bg-slate-800/50 sticky top-0 z-10">
                      <th className="p-4 font-bold">User</th>
                      <th className="p-4 font-bold">Role</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Last Active</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {TEAM_MEMBERS.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{member.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold border",
                            member.role === 'Admin' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800/50" :
                            member.role === 'Analyst' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/50" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          )}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {member.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                              <Mail className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{member.lastActive}</td>
                        <td className="p-4 text-right relative action-menu-container">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {openMenuId === member.id && (
                            <div className="absolute right-8 top-10 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95">
                              <button 
                                onClick={() => { setOpenMenuId(null); showToast(`Opening role editor for ${member.name}`); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" /> Change Role
                              </button>
                              <button 
                                onClick={() => { setOpenMenuId(null); showToast(`Requesting removal of ${member.name}`); }}
                                className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Remove User
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Full access to all features, billing, and team management.</p>
                  </div>
                </div>
                <div className="pl-16">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">Team Management</span>
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">Billing</span>
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">Create Simulations</span>
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">Knowledge Management</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analyst</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Can create and manage simulations, and update the Knowledge Base.</p>
                  </div>
                </div>
                <div className="pl-16">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">Create Simulations</span>
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">Knowledge Management</span>
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">View Reports</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Viewer</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Read-only access to reports and completed simulations.</p>
                  </div>
                </div>
                <div className="pl-16">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">View Reports</span>
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700/50">Data Export</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100/50 dark:border-slate-700/50 flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-6">
                  <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Audit Log (Coming Soon)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Here you will be able to view the complete history of all actions performed by users in the workspace for compliance and security purposes.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
