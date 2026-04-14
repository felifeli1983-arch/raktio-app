"""
Raktio Repository — LLM Usage Log

Append-only log of all LLM calls for cost tracking and analytics.
This repository is write-heavy (one insert per LLM call) and
read-light (analytics queries from admin/billing).
"""

from __future__ import annotations

from typing import Any, Optional

from app.db.supabase_client import get_supabase


def insert_usage(row: dict[str, Any]) -> dict[str, Any]:
    """Insert an LLM usage log entry. Returns inserted row."""
    sb = get_supabase()
    result = sb.table("llm_usage_log").insert(row).execute()
    return result.data[0] if result.data else {}


def get_usage_by_simulation(simulation_id: str) -> list[dict[str, Any]]:
    """Get all LLM usage entries for a simulation."""
    sb = get_supabase()
    result = (
        sb.table("llm_usage_log")
        .select("*")
        .eq("simulation_id", simulation_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


def get_usage_by_org(
    organization_id: str,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """Get recent LLM usage for an organization."""
    sb = get_supabase()
    result = (
        sb.table("llm_usage_log")
        .select("*")
        .eq("organization_id", organization_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


def get_usage_summary_by_org(organization_id: str) -> dict[str, Any]:
    """Get aggregated usage summary for an organization."""
    sb = get_supabase()
    result = (
        sb.table("llm_usage_log")
        .select("route, provider, input_tokens, output_tokens, estimated_cost_usd")
        .eq("organization_id", organization_id)
        .execute()
    )

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
            summary["by_route"][route] = {"calls": 0, "input_tokens": 0, "output_tokens": 0, "cost_usd": 0.0}
        summary["by_route"][route]["calls"] += 1
        summary["by_route"][route]["input_tokens"] += row.get("input_tokens", 0)
        summary["by_route"][route]["output_tokens"] += row.get("output_tokens", 0)
        summary["by_route"][route]["cost_usd"] += float(row.get("estimated_cost_usd", 0))

        provider = row.get("provider", "unknown")
        if provider not in summary["by_provider"]:
            summary["by_provider"][provider] = {"calls": 0, "cost_usd": 0.0}
        summary["by_provider"][provider]["calls"] += 1
        summary["by_provider"][provider]["cost_usd"] += float(row.get("estimated_cost_usd", 0))

    summary["total_estimated_cost_usd"] = round(summary["total_estimated_cost_usd"], 6)
    return summary
