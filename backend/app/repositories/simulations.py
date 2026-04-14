"""
Raktio Repository — Simulations

All direct Supabase/DB access for the simulations domain.
Services call this module — they never call sb.table() directly.
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from app.db.supabase_client import get_supabase


def insert(row: dict[str, Any]) -> dict[str, Any]:
    """Insert a simulation row. Returns the inserted row dict."""
    sb = get_supabase()
    result = sb.table("simulations").insert(row).execute()
    return result.data[0] if result.data else {}


def find_by_id(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> Optional[dict[str, Any]]:
    """Find a single simulation by ID, scoped to workspace."""
    sb = get_supabase()
    result = (
        sb.table("simulations")
        .select("*")
        .eq("simulation_id", str(simulation_id))
        .eq("workspace_id", str(workspace_id))
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def list_by_workspace(
    workspace_id: uuid.UUID,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[dict[str, Any]], int]:
    """
    List simulations for a workspace, ordered by created_at desc.
    Returns (rows, total_count).
    """
    sb = get_supabase()

    count_result = (
        sb.table("simulations")
        .select("simulation_id", count="exact")
        .eq("workspace_id", str(workspace_id))
        .execute()
    )
    total = count_result.count or 0

    result = (
        sb.table("simulations")
        .select("*")
        .eq("workspace_id", str(workspace_id))
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return result.data or [], total


def update(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
    data: dict[str, Any],
) -> Optional[dict[str, Any]]:
    """Update a simulation row. Returns the updated row dict or None."""
    sb = get_supabase()
    result = (
        sb.table("simulations")
        .update(data)
        .eq("simulation_id", str(simulation_id))
        .eq("workspace_id", str(workspace_id))
        .execute()
    )
    return result.data[0] if result.data else None


def delete(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> None:
    """Delete a simulation, scoped to workspace."""
    sb = get_supabase()
    (
        sb.table("simulations")
        .delete()
        .eq("simulation_id", str(simulation_id))
        .eq("workspace_id", str(workspace_id))
        .execute()
    )


# ── Helpers for related lookups ────────────────────────────────────────

def get_workspace_org_id(workspace_id: uuid.UUID) -> Optional[str]:
    """Return organization_id for a workspace, or None."""
    sb = get_supabase()
    result = (
        sb.table("workspaces")
        .select("organization_id")
        .eq("workspace_id", str(workspace_id))
        .limit(1)
        .execute()
    )
    if result.data and result.data[0].get("organization_id"):
        return result.data[0]["organization_id"]
    return None


def get_org_plan_agent_limit(organization_id: str) -> Optional[int]:
    """Return agent_limit for the org's plan, or None."""
    sb = get_supabase()
    result = (
        sb.table("organizations")
        .select("plan_id")
        .eq("organization_id", organization_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        return None

    plan_id = result.data[0]["plan_id"]
    plan_result = (
        sb.table("plans")
        .select("agent_limit")
        .eq("plan_id", plan_id)
        .limit(1)
        .execute()
    )
    return plan_result.data[0]["agent_limit"] if plan_result.data else None


def get_available_credits(organization_id: str) -> Optional[int]:
    """Return available_credits for an org, or None if no balance exists.
    NOTE: For full billing operations, use repositories/billing.py instead."""
    sb = get_supabase()
    result = (
        sb.table("credit_balances")
        .select("available_credits")
        .eq("organization_id", organization_id)
        .limit(1)
        .execute()
    )
    return result.data[0]["available_credits"] if result.data else None


# ── Simulation Configs ─────────────────────────────────────────────────

def get_latest_config(simulation_id: uuid.UUID) -> Optional[dict[str, Any]]:
    """Get the latest simulation_configs row."""
    sb = get_supabase()
    result = (
        sb.table("simulation_configs")
        .select("*")
        .eq("simulation_id", str(simulation_id))
        .order("config_version", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def get_latest_config_version(simulation_id: uuid.UUID) -> int:
    """Get the highest config_version for a simulation, or 0."""
    sb = get_supabase()
    result = (
        sb.table("simulation_configs")
        .select("config_version")
        .eq("simulation_id", str(simulation_id))
        .order("config_version", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0]["config_version"] if result.data else 0


def insert_config(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("simulation_configs").insert(row).execute()
    return result.data[0] if result.data else {}


def update_config(simulation_id: uuid.UUID, data: dict[str, Any]) -> None:
    """Update the latest config for a simulation."""
    sb = get_supabase()
    sb.table("simulation_configs").update(data).eq(
        "simulation_id", str(simulation_id)
    ).execute()


# ── Simulation Runs ────────────────────────────────────────────────────

def insert_run(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("simulation_runs").insert(row).execute()
    return result.data[0] if result.data else {}


def update_run(run_id: str, data: dict[str, Any]) -> None:
    sb = get_supabase()
    sb.table("simulation_runs").update(data).eq("run_id", run_id).execute()


def update_run_by_simulation(
    simulation_id: str, current_status: str, data: dict[str, Any],
) -> None:
    """Update runs matching simulation_id and current status."""
    sb = get_supabase()
    sb.table("simulation_runs").update(data).eq(
        "simulation_id", simulation_id
    ).eq("status", current_status).execute()


def get_latest_run(simulation_id: uuid.UUID) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("simulation_runs")
        .select("*")
        .eq("simulation_id", str(simulation_id))
        .order("started_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def get_simulation_ids_for_workspace(workspace_id: str) -> list[str]:
    """Return all simulation_ids for a workspace."""
    sb = get_supabase()
    result = (
        sb.table("simulations")
        .select("simulation_id")
        .eq("workspace_id", workspace_id)
        .execute()
    )
    return [s["simulation_id"] for s in (result.data or [])]
