"use client";

/**
 * Raktio — Main Sidebar
 *
 * Navigation zones (as per APP_STRUCTURE_AND_PAGES.md):
 *   WORKSPACE   → Overview, New Simulation, Active Simulations, Reports, Compare Lab
 *   INTELLIGENCE → Audience Studio, Agent Atlas, Knowledge & Sources, Graph Explorer
 *   OPERATIONS  → Credits & Billing, Integrations, Team & Governance, Settings
 */

// TODO: implement sidebar with navigation groups, active state, credit balance chip
export function Sidebar() {
  return (
    <aside className="w-60 border-r bg-card flex flex-col shrink-0">
      <div className="p-4 border-b">
        <span className="font-bold text-lg tracking-tight">Raktio</span>
      </div>
      {/* TODO: NavGroup WORKSPACE */}
      {/* TODO: NavGroup INTELLIGENCE */}
      {/* TODO: NavGroup OPERATIONS */}
    </aside>
  );
}
