import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  PlusCircle,
  Activity,
  BarChart3,
  GitCompare,
  Users,
  Fingerprint,
  Database,
  CreditCard,
  Plug,
  Shield,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Share2,
  ShieldAlert,
  DollarSign,
  ScrollText,
  Building
} from 'lucide-react';
import { cn } from '../lib/utils';
import ErrorBoundary from './ErrorBoundary';
import { useAuth } from '../lib/auth/AuthContext';
import { billingApi } from '../lib/api/billing';

function SidebarItem({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active?: boolean }) {
  return (
    <Link to={to} className={cn(
      "flex items-center w-full gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-200",
      active 
        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-[0_2px_10px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgb(0,0,0,0.2)]" 
        : "text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
    )}>
      <Icon className={cn("w-5 h-5", active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
      <span>{label}</span>
    </Link>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, currentWorkspace, workspaceError, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(() => {
    // Sync React state with the actual DOM class (set by index.html inline script)
    return document.documentElement.classList.contains('dark');
  });
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('raktio-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('raktio-theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    billingApi.balance()
      .then(bal => setCreditBalance(bal.available_credits))
      .catch(() => {}); // Silently fail — pill shows fallback dash
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 p-4 gap-4 transition-colors duration-300 overflow-hidden">
      {/* SIDEBAR — fixed height, internal scroll */}
      <aside className="w-64 flex flex-col hidden md:flex shrink-0 h-full">
        <div className="h-16 flex items-center px-4 mb-4 shrink-0">
          <Link to="/overview" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Raktio</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-8 min-h-0">
          {/* WORKSPACE */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Workspace</p>
            <SidebarItem to="/overview" icon={LayoutDashboard} label="Overview" active={location.pathname === '/overview' || location.pathname === '/dashboard'} />
            <SidebarItem to="/simulations" icon={Activity} label="Simulations" active={location.pathname === '/simulations' || location.pathname.includes('/canvas') || location.pathname.includes('/sim/')} />
            <SidebarItem to="/sim/new" icon={PlusCircle} label="New Simulation" active={location.pathname === '/sim/new'} />
            <SidebarItem to="/reports" icon={BarChart3} label="Reports" active={location.pathname.startsWith('/reports')} />
            <SidebarItem to="/compare" icon={GitCompare} label="Compare Lab" active={location.pathname === '/compare'} />
          </div>

          {/* INTELLIGENCE */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Intelligence</p>
            <SidebarItem to="/audiences" icon={Users} label="Audience Studio" active={location.pathname === '/audiences'} />
            <SidebarItem to="/agents" icon={Fingerprint} label="Agent Atlas" active={location.pathname.startsWith('/agents')} />
            <SidebarItem to="/knowledge" icon={Database} label="Knowledge & Sources" active={location.pathname === '/knowledge'} />
            <SidebarItem to="/graph" icon={Share2} label="Graph Explorer" active={location.pathname === '/graph'} />
          </div>

          {/* OPERATIONS */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Operations</p>
            <SidebarItem to="/billing" icon={CreditCard} label="Credits & Billing" active={location.pathname === '/billing'} />
            <SidebarItem to="/integrations" icon={Plug} label="Integrations" active={location.pathname === '/integrations'} />
            <SidebarItem to="/team" icon={Shield} label="Team & Governance" active={location.pathname === '/team'} />
            <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
          </div>

          {/* ADMIN */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Admin</p>
            <SidebarItem to="/admin" icon={ShieldAlert} label="Admin Control" active={location.pathname === '/admin'} />
            <SidebarItem to="/admin/costs" icon={DollarSign} label="Model & Cost Control" active={location.pathname === '/admin/costs'} />
            <SidebarItem to="/admin/audit" icon={ScrollText} label="Audit Logs" active={location.pathname === '/admin/audit'} />
            <SidebarItem to="/admin/tenants" icon={Building} label="Tenant Management" active={location.pathname === '/admin/tenants'} />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT — fills remaining height */}
      <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden relative transition-colors duration-300 min-h-0">

        {/* TOP NAV — fixed at top, never scrolls */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-20 transition-colors duration-300 border-b border-slate-100/50 dark:border-slate-800/30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search simulations, reports, audiences..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-100 dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Credits in Navbar */}
            <div className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => navigate('/billing')}>
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-0.5">Credits</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{creditBalance?.toLocaleString() ?? '—'}</p>
              </div>
            </div>

            <button onClick={toggleTheme} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2"></div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-2xl transition-colors"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.email || 'user'}`} alt="User" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentWorkspace?.name || 'Workspace'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentWorkspace?.role || ''}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800/50 mb-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</p>
                    </div>
                    <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Profile Settings
                    </button>
                    <button onClick={() => { navigate('/team'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Team Management
                    </button>
                    <button onClick={() => { navigate('/billing'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Billing
                    </button>
                    <div className="h-px bg-slate-50 dark:bg-slate-800/50 my-2"></div>
                    <button onClick={async () => { setIsProfileOpen(false); await signOut(); navigate('/login'); }} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-medium">
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Workspace error banner */}
        {workspaceError && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm shrink-0 flex items-center justify-between">
            <span>{workspaceError}</span>
            <button onClick={() => navigate('/settings')} className="text-xs font-bold text-amber-700 dark:text-amber-400 underline ml-4">Settings</button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto relative z-10 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
