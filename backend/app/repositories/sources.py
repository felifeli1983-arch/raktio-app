"""
Raktio Repository — Sources & Knowledge

CRUD for sources, source_extractions, and source_links.
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from app.db.supabase_client import get_supabase


# ── Sources ────────────────────────────────────────────────────────────

def insert_source(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("sources").insert(row).execute()
    return result.data[0] if result.data else {}


def find_source_by_id(source_id: str, workspace_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("sources")
        .select("*")
        .eq("source_id", source_id)
        .eq("workspace_id", workspace_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def list_sources(workspace_id: str, limit: int = 50, offset: int = 0) -> tuple[list[dict[str, Any]], int]:
    sb = get_supabase()
    count_result = (
        sb.table("sources")
        .select("source_id", count="exact")
        .eq("workspace_id", workspace_id)
        .eq("status", "active")
        .execute()
    )
    total = count_result.count or 0
    result = (
        sb.table("sources")
        .select("*")
        .eq("workspace_id", workspace_id)
        .eq("status", "active")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or [], total


def update_source(source_id: str, data: dict[str, Any]) -> None:
    sb = get_supabase()
    sb.table("sources").update(data).eq("source_id", source_id).execute()


# ── Source Extractions ─────────────────────────────────────────────────

def insert_extraction(row: dict[str, Any]) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("source_extractions").insert(row).execute()
    return result.data[0] if result.data else {}


def get_latest_extraction(source_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    result = (
        sb.table("source_extractions")
        .select("*")
        .eq("source_id", source_id)
        .order("extraction_version", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


# ── Source Links ───────────────────────────────────────────────────────

def link_source(source_id: str, entity_type: str, entity_id: str) -> dict[str, Any]:
    sb = get_supabase()
    result = sb.table("source_links").upsert({
        "source_id": source_id,
        "linked_entity_type": entity_type,
        "linked_entity_id": entity_id,
    }, on_conflict="source_id,linked_entity_type,linked_entity_id").execute()
    return result.data[0] if result.data else {}


def get_sources_for_entity(entity_type: str, entity_id: str) -> list[dict[str, Any]]:
    """Get all sources linked to a simulation/audience/report."""
    sb = get_supabase()
    links = (
        sb.table("source_links")
        .select("source_id")
        .eq("linked_entity_type", entity_type)
        .eq("linked_entity_id", entity_id)
        .execute()
    )
    if not links.data:
        return []

    source_ids = [l["source_id"] for l in links.data]
    result = sb.table("sources").select("*").in_("source_id", source_ids).execute()
    return result.data or []


def get_extractions_for_entity(entity_type: str, entity_id: str) -> list[dict[str, Any]]:
    """Get all source extractions for sources linked to an entity."""
    sources = get_sources_for_entity(entity_type, entity_id)
    if not sources:
        return []

    sb = get_supabase()
    source_ids = [s["source_id"] for s in sources]
    result = (
        sb.table("source_extractions")
        .select("*")
        .in_("source_id", source_ids)
        .order("extraction_version", desc=True)
        .execute()
    )
    return result.data or []
