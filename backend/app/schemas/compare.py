"""
Raktio Schema — Compare request/response models.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel


CompareType = Literal["standard", "a_b_test", "variant", "time_series"]
CompareStatus = Literal["pending", "generating", "completed", "failed"]


class CompareCreate(BaseModel):
    base_simulation_id: uuid.UUID
    target_simulation_id: uuid.UUID
    compare_type: CompareType = "standard"


class CompareResponse(BaseModel):
    compare_id: uuid.UUID
    workspace_id: uuid.UUID
    base_simulation_id: uuid.UUID
    target_simulation_id: uuid.UUID
    compare_type: CompareType
    summary_json: Optional[dict[str, Any]] = None
    status: CompareStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
