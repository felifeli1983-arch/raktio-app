"""
Raktio Repository — Compare

All direct Supabase/DB access for compare_runs.
"""

from __future__ import annotations

from typing import Any, Optional

from app.db.supabase_client import get_supabase


def insert_compare(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("compare_runs").insert(row).execute()
    return result.data[0] if result.data else {}


def update_compare(compare_id: str, data: dict[str, Any]) -> None:
    sb = get_supabase()
    sb.table("compare_runs").update(data).eq("compare_id", compare_id).execute()


def find_by_id(compare_id: str, workspace_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("compare_runs")
        .select("*")
        .eq("compare_id", compare_id)
        .eq("workspace_id", workspace_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def list_by_workspace(workspace_id: str) -> list[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("compare_runs")
        .select("*")
        .eq("workspace_id", workspace_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []
