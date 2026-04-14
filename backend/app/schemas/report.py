"""
Raktio Schema — Report request/response models.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel


ReportStatus = Literal["pending", "generating", "partial", "completed", "failed"]
SectionKey = Literal[
    "executive_summary", "key_findings", "belief_shifts",
    "patient_zero", "segment_analysis", "geography_analysis",
    "platform_analysis", "recommendations", "evidence",
    "confidence_limitations",
]


class ReportSectionResponse(BaseModel):
    report_section_id: uuid.UUID
    report_id: uuid.UUID
    section_key: SectionKey
    status: str
    content_markdown: Optional[str] = None
    structured_json: Optional[dict[str, Any]] = None
    generated_at: Optional[datetime] = None


class ReportResponse(BaseModel):
    report_id: uuid.UUID
    simulation_id: uuid.UUID
    run_id: Optional[uuid.UUID] = None
    status: ReportStatus
    report_version: int
    summary_json: Optional[dict[str, Any]] = None
    scorecard_json: Optional[dict[str, Any]] = None
    confidence_notes: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    sections: list[ReportSectionResponse] = []


class ReportListResponse(BaseModel):
    items: list[ReportResponse]
    total: int
