"""
Raktio Service — Brief Understanding

Phase 2 of the simulation pipeline (DATAFLOW_AND_RUNTIME.md):
Takes raw brief_text from a simulation and calls Claude Sonnet (PLANNING route)
to extract structured understanding.

Outputs stored in simulations.brief_context_json.
Simulation status transitions: draft → understanding → (back to draft with context).
"""

from __future__ import annotations

import json
import uuid

from fastapi import HTTPException, status

from app.adapters.llm_adapter import llm_adapter, LLMResponse
from app.config import ModelRoute
from app.repositories import simulations as sim_repo


# ── System prompt for brief understanding ──────────────────────────────

BRIEF_UNDERSTANDING_SYSTEM = """You are the Brief Understanding module of Raktio, a social reaction simulation platform.

Your job is to analyze a user's simulation brief and extract structured context that will be used to plan a synthetic audience simulation.

You must output valid JSON with this exact structure:
{
  "topic_summary": "One-paragraph summary of what this brief is about",
  "domain": "The domain/industry (e.g. marketing, PR, product launch, politics, crisis, legal, media)",
  "simulation_goal": "What the user wants to learn from the simulation",
  "key_entities": ["Entity 1", "Entity 2", ...],
  "key_concepts": ["Concept 1", "Concept 2", ...],
  "candidate_audience_segments": [
    {"segment": "segment name", "description": "why this segment matters", "estimated_share": 0.3}
  ],
  "candidate_platforms": ["x", "instagram", "reddit", "tiktok", "linkedin"],
  "geography_hints": {
    "primary_countries": ["IT", "US", ...],
    "primary_languages": ["it", "en", ...],
    "scope_level": "national | multi-country | global"
  },
  "recommended_scale": {
    "min_agents": 500,
    "recommended_agents": 2000,
    "rationale": "Why this scale is appropriate"
  },
  "risks_and_ambiguity": ["Risk or ambiguity 1", "Risk or ambiguity 2"],
  "confidence_notes": "Overall assessment of brief clarity and simulation feasibility"
}

Rules:
- Always output valid JSON, nothing else
- candidate_platforms must only use: x, reddit, instagram, tiktok, linkedin
- geography_hints.primary_countries must use ISO 3166-1 alpha-2 codes
- estimated_share values in candidate_audience_segments must sum to approximately 1.0
- Be concrete and specific, not generic
- If the brief is vague, say so in confidence_notes and still provide best-effort analysis
"""


async def understand_brief(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict:
    """
    Run brief understanding on a simulation's brief_text.

    1. Validates the simulation exists and has a brief
    2. Transitions status to 'understanding'
    3. Calls Claude Sonnet (PLANNING route)
    4. Stores result in brief_context_json
    5. Transitions status back to 'draft' (with context now populated)

    Returns the parsed brief_context_json dict.
    """
    # 1. Fetch simulation
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    if not row.get("brief_text"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Simulation has no brief_text. Add a brief before requesting understanding.",
        )

    current_status = row.get("status")
    if current_status not in ("draft",):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot understand brief in '{current_status}' status. Simulation must be in 'draft'.",
        )

    # 2. Transition to 'understanding'
    sim_repo.update(simulation_id, workspace_id, {"status": "understanding"})

    try:
        # 3. Build brief content with source context if available
        brief_content = f"Analyze this simulation brief:\n\n{row['brief_text']}"

        # Inject source context from linked documents
        from app.services.knowledge_service import get_source_context_for_simulation
        source_context = get_source_context_for_simulation(str(simulation_id))
        if source_context:
            brief_content += "\n\n## Uploaded Source Documents\n"
            brief_content += f"Number of sources: {source_context['source_count']}\n\n"

            for summary in source_context.get("summaries", [])[:3]:
                brief_content += f"### Source Summary\n{summary}\n\n"

            entities = source_context.get("entities", [])
            if entities:
                brief_content += "### Key Entities from Sources\n"
                for e in entities[:10]:
                    if isinstance(e, dict):
                        brief_content += f"- **{e.get('name', '?')}** ({e.get('type', '?')}): {e.get('relevance', '')}\n"
                brief_content += "\n"

            topics = source_context.get("topics", [])
            if topics:
                brief_content += f"### Topics from Sources: {', '.join(topics[:15])}\n\n"

            claims = source_context.get("key_claims", [])
            if claims:
                brief_content += "### Key Claims from Sources\n"
                for c in claims[:5]:
                    if isinstance(c, dict):
                        brief_content += f"- {c.get('claim', '')}\n"
                brief_content += "\n"

        # 4. Call Claude Sonnet
        response: LLMResponse = await llm_adapter.complete(
            route=ModelRoute.PLANNING,
            messages=[
                {
                    "role": "user",
                    "content": brief_content,
                }
            ],
            system=BRIEF_UNDERSTANDING_SYSTEM,
            max_tokens=4096,
            temperature=0.3,
            log_context={
                "simulation_id": str(simulation_id),
                "workspace_id": str(workspace_id),
                "service_module": "brief_service",
                "call_purpose": "brief_understanding",
            },
        )

        # 4. Parse JSON response
        try:
            brief_context = json.loads(response.content)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            brief_context = json.loads(content)

        # Add LLM usage metadata
        brief_context["_llm_metadata"] = {
            "model": response.model,
            "usage": response.usage,
        }

        # 5. Store result and transition back to 'draft'
        sim_repo.update(simulation_id, workspace_id, {
            "brief_context_json": brief_context,
            "status": "draft",
        })

        return brief_context

    except Exception as exc:
        # On failure, revert status to draft
        sim_repo.update(simulation_id, workspace_id, {"status": "draft"})

        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Brief understanding failed: {exc}",
        )
