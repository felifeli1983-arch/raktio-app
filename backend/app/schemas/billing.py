"""
Raktio Schema — Billing request/response models.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class CreditEstimateRequest(BaseModel):
    agent_count: int = Field(..., ge=10, le=100000)
    duration_preset: str = "24h"
    platform_scope: Optional[list[str]] = None
    geography_scope: Optional[dict[str, Any]] = None


class CreditEstimateResponse(BaseModel):
    credit_estimate: int
    agent_count: int
    duration_preset: str
    platform_count: int
    formula: str


class BalanceResponse(BaseModel):
    organization_id: str
    available_credits: int
    reserved_credits: int
    plan: Optional[dict[str, Any]] = None


class PlanResponse(BaseModel):
    plan_id: str
    name: str
    agent_limit: int
    monthly_price: float
    annual_price: float
    included_credits: int
    bonus_credits: int
    is_enterprise: bool
    feature_flags: dict[str, Any]
