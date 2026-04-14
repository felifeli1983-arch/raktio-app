"""
Raktio Service — Compare

Phase 11 of the simulation pipeline (DATAFLOW_AND_RUNTIME.md):
Compares two simulations side-by-side to identify differences
in outcomes, sentiment, segments, geography, and platform behavior.

Uses Claude Sonnet (REPORT route) to generate structured comparison.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

from fastapi import HTTPException, status

from app.adapters.llm_adapter import llm_adapter
from app.config import ModelRoute
from app.repositories import compare as compare_repo
from app.repositories import reports as report_repo
from app.repositories import simulations as sim_repo


COMPARE_SYSTEM = """You are the Compare Analyst module of Raktio, a social reaction simulation platform.

You compare two simulation runs and produce a structured comparison report.

Output valid JSON with this structure:
{
  "summary": "One-paragraph comparison summary",
  "winner": "base | target | draw",
  "key_differences": [
    {"dimension": "sentiment", "base_value": "...", "target_value": "...", "significance": "high"}
  ],
  "segment_deltas": [
    {"segment": "Millennials", "base_stance": "supportive", "target_stance": "neutral", "shift": "negative"}
  ],
  "platform_deltas": [],
  "geography_deltas": [],
  "recommendations": ["Rec 1", "Rec 2"],
  "confidence": 0.7
}

Rules:
- Always output valid JSON
- winner: which simulation performed better toward the user's goal
- significance: high, medium, low
- Be specific and actionable
"""


async def create_compare(
    workspace_id: uuid.UUID,
    base_simulation_id: uuid.UUID,
    target_simulation_id: uuid.UUID,
    compare_type: str = "standard",
) -> dict[str, Any]:
    """
    Create a comparison between two simulations.
    Both simulations must belong to the same workspace.
    """
    # Validate both simulations exist in this workspace
    base = sim_repo.find_by_id(base_simulation_id, workspace_id)
    if not base:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Base simulation not found")

    target = sim_repo.find_by_id(target_simulation_id, workspace_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target simulation not found")

    # Both simulations must be completed
    for label, sim in [("Base", base), ("Target", target)]:
        if sim.get("status") != "completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{label} simulation is in '{sim.get('status')}' status. Only completed simulations can be compared.",
            )

    # Create compare record
    compare = compare_repo.insert_compare({
        "workspace_id": str(workspace_id),
        "base_simulation_id": str(base_simulation_id),
        "target_simulation_id": str(target_simulation_id),
        "compare_type": compare_type,
        "status": "generating",
    })
    compare_id = compare["compare_id"]

    try:
        # Build context
        context = {
            "base": {
                "name": base.get("name"),
                "brief_text": base.get("brief_text"),
                "brief_context": base.get("brief_context_json"),
                "agent_count": base.get("agent_count_final"),
                "platforms": base.get("platform_scope"),
                "duration": base.get("duration_preset"),
                "status": base.get("status"),
            },
            "target": {
                "name": target.get("name"),
                "brief_text": target.get("brief_text"),
                "brief_context": target.get("brief_context_json"),
                "agent_count": target.get("agent_count_final"),
                "platforms": target.get("platform_scope"),
                "duration": target.get("duration_preset"),
                "status": target.get("status"),
            },
        }

        # Get reports if available
        for key, sim_id in [("base", base_simulation_id), ("target", target_simulation_id)]:
            report_summary = report_repo.find_report_summary(str(sim_id))
            if report_summary:
                context[key]["report_summary"] = report_summary.get("summary_json")

        response = await llm_adapter.complete(
            route=ModelRoute.REPORT,
            messages=[{
                "role": "user",
                "content": f"Compare these two simulations:\n\n```json\n{json.dumps(context, indent=2, default=str)}\n```",
            }],
            system=COMPARE_SYSTEM,
            max_tokens=4096,
            temperature=0.3,
        )

        try:
            summary = json.loads(response.content)
        except json.JSONDecodeError:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            summary = json.loads(content)

        from datetime import datetime, timezone
        compare_repo.update_compare(compare_id, {
            "summary_json": summary,
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })

        return {"compare_id": compare_id, "status": "completed", "summary": summary}

    except Exception as exc:
        compare_repo.update_compare(compare_id, {"status": "failed"})

        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Compare generation failed: {exc}",
        )


async def get_compare(compare_id: uuid.UUID, workspace_id: uuid.UUID) -> dict[str, Any]:
    """Get a compare run by ID."""
    result = compare_repo.find_by_id(str(compare_id), str(workspace_id))
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compare not found")
    return result


async def list_compares(workspace_id: uuid.UUID) -> list[dict[str, Any]]:
    """List all compare runs for a workspace."""
    return compare_repo.list_by_workspace(str(workspace_id))
