"""
Raktio Schema — Audience request/response models.
Aligned with public.audiences table from 003_audiences_and_participation.sql.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


AudienceType = Literal["generated", "filter_based", "source_derived", "cloned", "private"]
AudienceStatus = Literal["active", "archived", "deleted"]


class AudienceResponse(BaseModel):
    audience_id: uuid.UUID
    workspace_id: uuid.UUID
    created_by_user_id: uuid.UUID
    name: str
    description: Optional[str] = None
    audience_type: AudienceType
    is_private: bool
    agent_count: int
    geography_summary: dict[str, Any]
    platform_summary: dict[str, Any]
    stance_summary: dict[str, Any]
    demographics_summary: dict[str, Any]
    status: AudienceStatus
    created_at: datetime
    updated_at: datetime


class AudienceListResponse(BaseModel):
    items: list[AudienceResponse]
    total: int
    page: int
    page_size: int
