"""
Raktio Service — Admin

Platform-level oversight for the admin control plane.
All functions assume the caller has been verified as platform_admin
by the require_admin guard.
"""

from __future__ import annotations

from typing import Any

from app.repositories import admin as admin_repo


async def get_platform_overview() -> dict[str, Any]:
    """High-level platform overview for the admin dashboard."""
    population = admin_repo.get_population_stats()
    credits = admin_repo.get_platform_credit_summary()
    llm_costs = admin_repo.get_llm_cost_summary()
    _, sim_total = admin_repo.list_all_simulations(limit=0)
    failed_runs = admin_repo.list_failed_runs(limit=5)

    return {
        "simulations_total": sim_total,
        "population": population,
        "credits": credits,
        "llm_costs": llm_costs,
        "recent_failures": failed_runs,
    }


async def list_tenants(
    limit: int = 50,
    offset: int = 0,
) -> dict[str, Any]:
    """List all organizations with plan info."""
    orgs, total = admin_repo.list_organizations(limit, offset)
    return {"items": orgs, "total": total}


async def get_tenant(organization_id: str) -> dict[str, Any] | None:
    """Get detailed info for one organization."""
    return admin_repo.get_organization(organization_id)


async def list_simulations_admin(
    status_filter: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, Any]:
    """List all simulations across all workspaces (admin view)."""
    sims, total = admin_repo.list_all_simulations(status_filter, limit, offset)
    return {"items": sims, "total": total}


async def get_runtime_overview() -> dict[str, Any]:
    """Runtime health: recent runs + failures."""
    recent = admin_repo.list_recent_runs(limit=20)
    failed = admin_repo.list_failed_runs(limit=10)

    running = [r for r in recent if r.get("status") in ("running", "bootstrapping")]
    completed = [r for r in recent if r.get("status") == "completed"]

    return {
        "active_runs": len(running),
        "recent_completed": len(completed),
        "recent_failed": len(failed),
        "running": running,
        "recent_failures": failed,
    }


async def get_cost_overview() -> dict[str, Any]:
    """LLM cost summary for admin."""
    return admin_repo.get_llm_cost_summary()


async def get_population_overview() -> dict[str, Any]:
    """Agent population stats."""
    return admin_repo.get_population_stats()
