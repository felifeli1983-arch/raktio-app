import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth/AuthContext';
import { RequireAuth, RequireGuest } from './lib/auth/AuthGuard';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import NewSimulation from './pages/NewSimulation';
import LiveFeed from './pages/LiveFeed';
import Report from './pages/Report';
import CompareLab from './pages/CompareLab';
import AgentProfile from './pages/AgentProfile';
import AgentAtlas from './pages/AgentAtlas';
import Knowledge from './pages/Knowledge';
import SimulationsList from './pages/SimulationsList';
import AgentsPool from './pages/AgentsPool';
import ReportsList from './pages/ReportsList';
import Billing from './pages/Billing';
import Integrations from './pages/Integrations';
import Team from './pages/Team';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import GraphExplorer from './pages/GraphExplorer';
import AdminCosts from './pages/AdminCosts';
import AdminAudit from './pages/AdminAudit';
import AdminTenants from './pages/AdminTenants';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes — redirect to /overview if already logged in */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
          <Route path="/signup" element={<RequireGuest><Register /></RequireGuest>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected App Routes — require auth */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            {/* Workspace */}
            <Route path="/overview" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
            <Route path="/simulations" element={<SimulationsList />} />
            <Route path="/sim/new" element={<NewSimulation />} />
            <Route path="/sim/:id/canvas" element={<LiveFeed />} />
            <Route path="/sim/:id" element={<Navigate to="/sim/1/canvas" replace />} />
            <Route path="/reports" element={<ReportsList />} />
            <Route path="/reports/:id" element={<Report />} />
            <Route path="/compare" element={<CompareLab />} />

            {/* Intelligence */}
            <Route path="/audiences" element={<AgentsPool />} />
            <Route path="/agents" element={<AgentAtlas />} />
            <Route path="/agents/:id" element={<AgentProfile />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/graph" element={<GraphExplorer />} />

            {/* Operations */}
            <Route path="/billing" element={<Billing />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/team" element={<Team />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/costs" element={<AdminCosts />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/admin/tenants" element={<AdminTenants />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
