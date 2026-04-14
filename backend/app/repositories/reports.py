"""
Raktio Repository — Reports

All direct Supabase/DB access for reports and report_sections.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from app.db.supabase_client import get_supabase


def insert_report(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("reports").insert(row).execute()
    return result.data[0] if result.data else {}


def update_report(report_id: str, data: dict[str, Any]) -> None:
    sb = get_supabase()
    sb.table("reports").update(data).eq("report_id", report_id).execute()


def find_report_by_simulation(simulation_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("reports")
        .select("*")
        .eq("simulation_id", simulation_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def find_report_summary(simulation_id: str) -> Optional[dict[str, Any]]:
    """Get just the summary_json for a completed report."""
    sb = get_supabase()
    result = (
        sb.table("reports")
        .select("summary_json")
        .eq("simulation_id", simulation_id)
        .eq("status", "completed")
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def list_reports_by_simulation_ids(sim_ids: list[str]) -> list[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("reports")
        .select("*")
        .in_("simulation_id", sim_ids)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


def insert_section(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("report_sections").insert(row).execute()
    return result.data[0] if result.data else {}


def update_section(report_id: str, section_key: str, data: dict[str, Any]) -> None:
    sb = get_supabase()
    sb.table("report_sections").update(data).eq(
        "report_id", report_id
    ).eq("section_key", section_key).execute()


def get_sections(report_id: str) -> list[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("report_sections")
        .select("*")
        .eq("report_id", report_id)
        .order("section_key")
        .execute()
    )
    return result.data or []
