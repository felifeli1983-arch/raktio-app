"""
Raktio Service — Compare

Phase 11 of the simulation pipeline (DATAFLOW_AND_RUNTIME.md):
Compares two completed simulations using real runtime evidence
from both OASIS SQLite databases.

Evidence sources (same as report_service):
  - event counts (posts, comments, likes, follows, etc.)
  - action summary from trace
  - top posts with content + engagement
  - per-agent activity breakdown
  - belief shift indicators (behavioral stance, reaction ratio)
  - exposure history (from refresh traces)
  - interaction matrix (comment/like/follow/mute edges)

Uses Claude Sonnet (REPORT route) to generate structured comparison.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.adapters.llm_adapter import llm_adapter
from app.config import ModelRoute
from app.repositories import compare as compare_repo
from app.repositories import reports as report_repo
from app.repositories import simulations as sim_repo
from app.runtime.event_bridge import build_evidence_bundle


COMPARE_SYSTEM = """You are the Compare Analyst module of Raktio, a social reaction simulation platform.

You compare two simulation runs using real runtime evidence from both.

When runtime evidence is provided for both simulations, you MUST:
- Compare actual event counts (posts, comments, likes, follows)
- Compare real agent behavior patterns (who created content, who reacted)
- Compare belief/stance indicators between the two runs
- Compare exposure patterns and interaction matrices
- Quote specific post content as evidence for differences
- Distinguish evidence-backed differences from inferred differences

Output valid JSON with this structure:
{
  "summary": "One-paragraph evidence-backed comparison summary",
  "winner": "base | target | draw",
  "evidence_quality": "full | partial | config_only",
  "key_differences": [
    {
      "dimension": "engagement | sentiment | reach | content_quality | ...",
      "base_value": "...",
      "target_value": "...",
      "significance": "high | medium | low",
      "evidence_type": "metric | behavioral | inferred"
    }
  ],
  "metric_comparison": {
    "base": {"posts": 0, "comments": 0, "likes": 0, "follows": 0, "trace_events": 0},
    "target": {"posts": 0, "comments": 0, "likes": 0, "follows": 0, "trace_events": 0}
  },
  "agent_behavior_deltas": [
    {"observation": "...", "evidence_type": "behavioral"}
  ],
  "segment_deltas": [],
  "platform_deltas": [],
  "geography_deltas": [],
  "recommendations": ["Rec 1", "Rec 2"],
  "confidence": 0.8,
  "limitations": ["Limitation 1"]
}

Rules:
- Always output valid JSON
- evidence_quality: "full" if both runs have runtime evidence, "partial" if only one, "config_only" if neither
- evidence_type per difference: "metric" (from counts), "behavioral" (from stance/interaction), "inferred" (from LLM reasoning)
- Be specific: cite real numbers, real posts, real agent names
- confidence: higher when both have full evidence
"""


def _build_sim_evidence_context(
    sim_row: dict[str, Any],
    sim_id: uuid.UUID,
    label: str,
) -> dict[str, Any]:
    """Build evidence context for one simulation."""
    context: dict[str, Any] = {
        "name": sim_row.get("name"),
        "brief_text": sim_row.get("brief_text"),
        "agent_count": sim_row.get("agent_count_final"),
        "platforms": sim_row.get("platform_scope"),
        "duration": sim_row.get("duration_preset"),
    }

    # Get runtime evidence from SQLite
    run = sim_repo.get_latest_run(sim_id)
    sqlite_path = run.get("sqlite_path") if run else None

    if sqlite_path:
        evidence = build_evidence_bundle(sqlite_path)
        context["has_runtime_evidence"] = True
        context["event_counts"] = evidence.get("event_counts", {})
        context["action_summary"] = evidence.get("action_summary", {})
        context["total_posts"] = evidence.get("total_posts", 0)
        context["total_comments"] = evidence.get("total_comments", 0)
        context["top_posts"] = evidence.get("top_posts", [])[:5]
        context["sample_comments"] = evidence.get("sample_comments", [])[:5]
        context["agent_activity"] = evidence.get("agent_activity", {})
        context["belief_indicators"] = evidence.get("belief_indicators", {})
        context["exposure_history"] = evidence.get("exposure_history", {})
        context["interaction_matrix"] = evidence.get("interaction_matrix", {})
    else:
        context["has_runtime_evidence"] = False

    # Get report summary if available
    report_summary = report_repo.find_report_summary(str(sim_id))
    if report_summary:
        context["report_summary"] = report_summary.get("summary_json")

    return context


def _build_compare_prompt(base_ctx: dict, target_ctx: dict) -> str:
    """Build a structured prompt for the compare LLM call."""
    prompt = ""

    # Determine evidence quality
    base_has = base_ctx.get("has_runtime_evidence", False)
    target_has = target_ctx.get("has_runtime_evidence", False)
    if base_has and target_has:
        evidence_note = "Both simulations have full runtime evidence. Use real data."
    elif base_has or target_has:
        evidence_note = "Only one simulation has runtime evidence. Note this asymmetry."
    else:
        evidence_note = "Neither simulation has runtime evidence. Comparison is config-based only."

    prompt += f"## Evidence Quality\n{evidence_note}\n\n"

    # Base simulation
    prompt += "## Base Simulation\n"
    prompt += f"**{base_ctx.get('name')}** — {base_ctx.get('agent_count')} agents, {base_ctx.get('duration')}\n"
    prompt += f"Brief: {(base_ctx.get('brief_text') or '')[:200]}\n\n"

    if base_has:
        counts = base_ctx.get("event_counts", {})
        prompt += f"### Base Metrics\n"
        prompt += f"- Posts: {counts.get('post', 0)}, Comments: {counts.get('comment', 0)}, Likes: {counts.get('like', 0)}, Follows: {counts.get('follow', 0)}, Trace: {counts.get('trace', 0)}\n"

        for post in base_ctx.get("top_posts", [])[:3]:
            prompt += f"- Top post by **{post.get('username', '?')}**: \"{(post.get('content') or '')[:120]}\"\n"

        belief = base_ctx.get("belief_indicators", {})
        if belief:
            prompt += "### Base Agent Stances\n"
            for agent, ind in belief.items():
                prompt += f"- {agent}: {ind.get('behavioral_stance')} (ratio: {ind.get('reaction_ratio')})\n"

        matrix = base_ctx.get("interaction_matrix", {})
        ci = matrix.get("comment_interactions", [])
        if ci:
            prompt += "### Base Interactions\n"
            for i in ci[:5]:
                prompt += f"- {i['from']} → {i['to']}: {i['count']}x ({i['type']})\n"
        prompt += "\n"

    # Target simulation
    prompt += "## Target Simulation\n"
    prompt += f"**{target_ctx.get('name')}** — {target_ctx.get('agent_count')} agents, {target_ctx.get('duration')}\n"
    prompt += f"Brief: {(target_ctx.get('brief_text') or '')[:200]}\n\n"

    if target_has:
        counts = target_ctx.get("event_counts", {})
        prompt += f"### Target Metrics\n"
        prompt += f"- Posts: {counts.get('post', 0)}, Comments: {counts.get('comment', 0)}, Likes: {counts.get('like', 0)}, Follows: {counts.get('follow', 0)}, Trace: {counts.get('trace', 0)}\n"

        for post in target_ctx.get("top_posts", [])[:3]:
            prompt += f"- Top post by **{post.get('username', '?')}**: \"{(post.get('content') or '')[:120]}\"\n"

        belief = target_ctx.get("belief_indicators", {})
        if belief:
            prompt += "### Target Agent Stances\n"
            for agent, ind in belief.items():
                prompt += f"- {agent}: {ind.get('behavioral_stance')} (ratio: {ind.get('reaction_ratio')})\n"

        matrix = target_ctx.get("interaction_matrix", {})
        ci = matrix.get("comment_interactions", [])
        if ci:
            prompt += "### Target Interactions\n"
            for i in ci[:5]:
                prompt += f"- {i['from']} → {i['to']}: {i['count']}x ({i['type']})\n"
        prompt += "\n"

    prompt += "## Task\nGenerate a structured comparison based on the evidence above.\n"
    return prompt


async def create_compare(
    workspace_id: uuid.UUID,
    base_simulation_id: uuid.UUID,
    target_simulation_id: uuid.UUID,
    compare_type: str = "standard",
) -> dict[str, Any]:
    """
    Create an evidence-backed comparison between two completed simulations.
    Reads runtime evidence from both OASIS SQLite databases.
    """
    # Validate both simulations exist and are completed
    base = sim_repo.find_by_id(base_simulation_id, workspace_id)
    if not base:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Base simulation not found")

    target = sim_repo.find_by_id(target_simulation_id, workspace_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target simulation not found")

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
        # Build evidence context for both simulations
        base_ctx = _build_sim_evidence_context(base, base_simulation_id, "base")
        target_ctx = _build_sim_evidence_context(target, target_simulation_id, "target")

        # Build structured prompt
        prompt = _build_compare_prompt(base_ctx, target_ctx)

        response = await llm_adapter.complete(
            route=ModelRoute.REPORT,
            messages=[{"role": "user", "content": prompt}],
            system=COMPARE_SYSTEM,
            max_tokens=4096,
            temperature=0.3,
            log_context={
                "simulation_id": str(base_simulation_id),
                "compare_id": compare_id,
                "workspace_id": str(workspace_id),
                "service_module": "compare_service",
                "call_purpose": "compare",
            },
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
