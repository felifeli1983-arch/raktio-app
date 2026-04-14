"""
Raktio Repository — Admin

Platform-wide queries for the admin control plane.
All queries use service_role (bypasses RLS) — caller must be
verified as platform_admin before reaching this layer.
"""

from __future__ import annotations

from typing import Any

from app.db.supabase_client import get_supabase


# ── Tenants / Organizations ────────────────────────────────────────────

def list_organizations(limit: int = 50, offset: int = 0) -> tuple[list[dict[str, Any]], int]:
    sb = get_supabase()
    count_result = sb.table("organizations").select("organization_id", count="exact").execute()
    total = count_result.count or 0

    result = (
        sb.table("organizations")
        .select("*, plans(name, agent_limit)")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or [], total


def get_organization(organization_id: str) -> dict[str, Any] | None:
    sb = get_supabase()
    result = (
        sb.table("organizations")
        .select("*, plans(name, agent_limit, monthly_price, included_credits)")
        .eq("organization_id", organization_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


# ── Simulations overview ───────────────────────────────────────────────

def list_all_simulations(
    status_filter: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[dict[str, Any]], int]:
    sb = get_supabase()
    query = sb.table("simulations").select("simulation_id, workspace_id, name, status, agent_count_final, duration_preset, credit_final, created_at, updated_at", count="exact")

    if status_filter:
        query = query.eq("status", status_filter)

    count_result = query.execute()
    total = count_result.count or 0

    query2 = sb.table("simulations").select("simulation_id, workspace_id, name, status, agent_count_final, duration_preset, credit_final, created_at, updated_at")
    if status_filter:
        query2 = query2.eq("status", status_filter)

    result = query2.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data or [], total


# ── Runtime / runs ─────────────────────────────────────────────────────

def list_recent_runs(limit: int = 20) -> list[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("simulation_runs")
        .select("run_id, simulation_id, status, started_at, completed_at, failed_at, failure_reason, simulated_time_completed")
        .order("started_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


def list_failed_runs(limit: int = 20) -> list[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("simulation_runs")
        .select("run_id, simulation_id, status, started_at, failed_at, failure_reason")
        .eq("status", "failed")
        .order("failed_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


# ── Population overview ────────────────────────────────────────────────

def get_population_stats() -> dict[str, Any]:
    sb = get_supabase()

    total = sb.table("agents").select("agent_id", count="exact").execute()
    global_count = sb.table("agents").select("agent_id", count="exact").eq("is_global", True).execute()
    active_count = sb.table("agents").select("agent_id", count="exact").eq("status", "active").execute()

    # Country distribution (top 10)
    country_result = sb.table("agents").select("country").eq("is_global", True).eq("status", "active").execute()
    countries: dict[str, int] = {}
    for row in (country_result.data or []):
        c = row.get("country", "unknown")
        countries[c] = countries.get(c, 0) + 1
    top_countries = sorted(countries.items(), key=lambda x: -x[1])[:10]

    return {
        "total_agents": total.count or 0,
        "global_agents": global_count.count or 0,
        "active_agents": active_count.count or 0,
        "top_countries": [{"country": c, "count": n} for c, n in top_countries],
    }


# ── Billing overview ──────────────────────────────────────────────────

def get_platform_credit_summary() -> dict[str, Any]:
    sb = get_supabase()

    balances = sb.table("credit_balances").select("available_credits, reserved_credits").execute()
    total_available = sum(r.get("available_credits", 0) for r in (balances.data or []))
    total_reserved = sum(r.get("reserved_credits", 0) for r in (balances.data or []))

    ledger_count = sb.table("credit_ledger").select("credit_ledger_id", count="exact").execute()

    return {
        "total_available_credits": total_available,
        "total_reserved_credits": total_reserved,
        "total_organizations": len(balances.data or []),
        "total_ledger_entries": ledger_count.count or 0,
    }


# ── LLM cost overview ─────────────────────────────────────────────────

def get_llm_cost_summary() -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("llm_usage_log").select("provider, route, input_tokens, output_tokens, estimated_cost_usd").execute()
    rows = result.data or []

    summary: dict[str, Any] = {
        "total_calls": len(rows),
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "total_estimated_cost_usd": 0.0,
        "by_route": {},
        "by_provider": {},
    }

    for row in rows:
        summary["total_input_tokens"] += row.get("input_tokens", 0)
        summary["total_output_tokens"] += row.get("output_tokens", 0)
        summary["total_estimated_cost_usd"] += float(row.get("estimated_cost_usd", 0))

        route = row.get("route", "unknown")
        if route not in summary["by_route"]:
            summary["by_route"][route] = {"calls": 0, "cost_usd": 0.0}
        summary["by_route"][route]["calls"] += 1
        summary["by_route"][route]["cost_usd"] += float(row.get("estimated_cost_usd", 0))

        provider = row.get("provider", "unknown")
        if provider not in summary["by_provider"]:
            summary["by_provider"][provider] = {"calls": 0, "cost_usd": 0.0}
        summary["by_provider"][provider]["calls"] += 1
        summary["by_provider"][provider]["cost_usd"] += float(row.get("estimated_cost_usd", 0))

    summary["total_estimated_cost_usd"] = round(summary["total_estimated_cost_usd"], 4)
    return summary


# ── Audit logs ─────────────────────────────────────────────────────────

def insert_audit_log(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("audit_logs").insert(row).execute()
    return result.data[0] if result.data else {}


def list_audit_logs(
    limit: int = 50,
    offset: int = 0,
    action_type: str | None = None,
    organization_id: str | None = None,
) -> tuple[list[dict[str, Any]], int]:
    sb = get_supabase()
    query = sb.table("audit_logs").select("*", count="exact")

    if action_type:
        query = query.eq("action_type", action_type)
    if organization_id:
        query = query.eq("organization_id", organization_id)

    count_result = query.execute()
    total = count_result.count or 0

    query2 = sb.table("audit_logs").select("*")
    if action_type:
        query2 = query2.eq("action_type", action_type)
    if organization_id:
        query2 = query2.eq("organization_id", organization_id)

    result = query2.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data or [], total
