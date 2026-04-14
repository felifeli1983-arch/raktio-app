"""
Raktio Schema — Simulation request/response models.
Aligned with public.simulations table from 001_initial_schema.sql.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


# ── Constrained types (match DB CHECK constraints) ─────────────────────

SimulationStatus = Literal[
    "draft", "understanding", "planning", "audience_preparing",
    "cost_check", "bootstrapping", "running", "paused",
    "completing", "reporting", "completed", "failed", "canceled",
]

PlannerStatus = Literal["pending", "running", "ready", "failed"]

DurationPreset = Literal["6h", "12h", "24h", "48h", "72h"]

RecsysChoice = Literal["random", "reddit", "personalized", "twhin-bert"]


# ── Request schemas ────────────────────────────────────────────────────

class SimulationCreate(BaseModel):
    """POST /api/simulations — create a new simulation in draft status."""
    name: str = Field(..., min_length=1, max_length=200)
    goal_type: str = "general"
    brief_text: Optional[str] = None
    agent_count_requested: int = Field(default=500, ge=10, le=100000)
    duration_preset: DurationPreset = "24h"
    platform_scope: list[str] = Field(default=["x"])
    geography_scope: dict[str, Any] = Field(default_factory=dict)
    recsys_choice: RecsysChoice = "random"


class SimulationUpdate(BaseModel):
    """PATCH /api/simulations/{id} — update mutable fields before launch."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    brief_text: Optional[str] = None
    agent_count_requested: Optional[int] = Field(default=None, ge=10, le=100000)
    duration_preset: Optional[DurationPreset] = None
    platform_scope: Optional[list[str]] = None
    geography_scope: Optional[dict[str, Any]] = None
    recsys_choice: Optional[RecsysChoice] = None


# ── Response schemas ───────────────────────────────────────────────────

class SimulationResponse(BaseModel):
    """Single simulation object returned by the API."""
    simulation_id: uuid.UUID
    workspace_id: uuid.UUID
    created_by_user_id: uuid.UUID
    name: str
    goal_type: str
    status: SimulationStatus
    planner_status: PlannerStatus
    brief_text: Optional[str] = None
    brief_context_json: Optional[dict[str, Any]] = None
    agent_count_requested: int
    agent_count_final: Optional[int] = None
    duration_preset: DurationPreset
    platform_scope: list[str]
    geography_scope: dict[str, Any]
    recsys_choice: RecsysChoice
    credit_estimate: Optional[int] = None
    credit_final: Optional[int] = None
    parent_simulation_id: Optional[uuid.UUID] = None
    compare_group_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime


class SimulationListResponse(BaseModel):
    """Paginated list of simulations."""
    items: list[SimulationResponse]
    total: int
    page: int
    page_size: int
