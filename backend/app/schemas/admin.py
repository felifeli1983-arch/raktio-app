"""
Raktio Schema — Admin response models.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel


class PlatformOverviewResponse(BaseModel):
    simulations_total: int
    population: dict[str, Any]
    credits: dict[str, Any]
    llm_costs: dict[str, Any]
    recent_failures: list[dict[str, Any]]


class TenantListResponse(BaseModel):
    items: list[dict[str, Any]]
    total: int


class SimulationAdminListResponse(BaseModel):
    items: list[dict[str, Any]]
    total: int


class RuntimeOverviewResponse(BaseModel):
    active_runs: int
    recent_completed: int
    recent_failed: int
    running: list[dict[str, Any]]
    recent_failures: list[dict[str, Any]]
