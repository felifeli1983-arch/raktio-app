"""
Raktio — Supabase Service-Role Client

Singleton client for server-side DB operations.
Uses the service_role key, which bypasses RLS — the backend is responsible
for authorization checks via guards.py before calling any DB operation.

Usage:
    from app.db.supabase_client import get_supabase

    sb = get_supabase()
    result = sb.table("simulations").select("*").execute()
"""

from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """
    Return a cached Supabase client authenticated with the service_role key.
    The client is created once and reused for the lifetime of the process.
    """
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. "
            "Check your .env file."
        )

    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
    )
