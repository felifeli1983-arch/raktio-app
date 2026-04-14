"""
Raktio Repository — Billing

All direct Supabase/DB access for credit_balances and credit_ledger.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from app.db.supabase_client import get_supabase


def get_balance(organization_id: str) -> Optional[dict[str, Any]]:
    """Get credit_balances row for an org."""
    sb = get_supabase()
    result = (
        sb.table("credit_balances")
        .select("available_credits, reserved_credits")
        .eq("organization_id", organization_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def reserve_credits(
    organization_id: str,
    amount: int,
    available_after: int,
) -> None:
    """Deduct from available, add to reserved."""
    sb = get_supabase()
    sb.table("credit_balances").update({
        "available_credits": available_after,
        "reserved_credits": amount,
    }).eq("organization_id", organization_id).execute()


def refund_credits(
    organization_id: str,
    available_after: int,
    reserved_after: int,
) -> None:
    """Restore available credits and reduce reserved."""
    sb = get_supabase()
    sb.table("credit_balances").update({
        "available_credits": available_after,
        "reserved_credits": reserved_after,
    }).eq("organization_id", organization_id).execute()


def insert_ledger_entry(row: dict[str, Any]) -> dict[str, Any]:
    """Insert a credit_ledger entry. Returns inserted row."""
    sb = get_supabase()
    result = sb.table("credit_ledger").insert(row).execute()
    return result.data[0] if result.data else {}
