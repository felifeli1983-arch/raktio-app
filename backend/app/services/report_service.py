"""
Raktio Service — Report Generation

Phase 10 of the simulation pipeline (DATAFLOW_AND_RUNTIME.md):
Generates progressive, evidence-backed reports from simulation run data
using Claude Sonnet (REPORT route).

Report sections (from REPORTS_AND_INSIGHTS_SPEC.md):
  - executive_summary
  - key_findings
  - belief_shifts
  - patient_zero
  - segment_analysis
  - geography_analysis
  - platform_analysis
  - recommendations
  - evidence
  - confidence_limitations

Sections are generated progressively and stored individually.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

from fastapi import HTTPException, status

from app.adapters.llm_adapter import llm_adapter
from app.config import ModelRoute
from app.repositories import reports as report_repo
from app.repositories import simulations as sim_repo

# Section generation order (progressive)
# Section generation order (progressive).
# Aligned with REPORTS_AND_INSIGHTS_SPEC.md sections 1-15.
REPORT_SECTIONS = [
    "executive_summary",
    "simulation_context",
    "outcome_scorecard",
    "key_findings",
    "belief_shifts",
    "patient_zero",
    "segment_analysis",
    "geography_analysis",
    "platform_analysis",
    "exposure_analysis",
    "faction_analysis",
    "recommendations",
    "evidence",
    "confidence_limitations",
]

REPORT_SYSTEM = """You are the Report Generator module of Raktio, a social reaction simulation platform.

You generate one section of a simulation report at a time. Each section must be evidence-backed, specific, and actionable.

Output valid JSON with this structure:
{
  "content_markdown": "## Section Title\\n\\nMarkdown content of the section...",
  "structured_json": {
    "key_points": ["Point 1", "Point 2"],
    "metrics": {},
    "evidence_refs": []
  }
}

Rules:
- content_markdown: well-formatted markdown for display
- structured_json: machine-readable structured data for the same content
- Be specific and reference simulation data where available
- Include confidence qualifiers where appropriate
- Always output valid JSON, nothing else
"""


async def generate_report(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """
    Generate a full report for a completed simulation.

    Prerequisites:
    - Simulation must be in 'completed' or 'reporting' status
    - A simulation_runs record must exist

    Steps:
    1. Create report record (status='generating')
    2. Transition simulation to 'reporting'
    3. Generate sections progressively
    4. Mark report as 'completed'
    5. Transition simulation to 'completed'
    """
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    if row.get("status") not in ("completed", "completing", "reporting"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot generate report in '{row['status']}' status. Simulation must be completed first.",
        )

    # Find latest run
    run = sim_repo.get_latest_run(simulation_id)
    run_id = run["run_id"] if run else None

    # Create report record
    report = report_repo.insert_report({
        "simulation_id": str(simulation_id),
        "run_id": run_id,
        "status": "generating",
    })
    report_id = report["report_id"]

    # Create section placeholders
    for section_key in REPORT_SECTIONS:
        report_repo.insert_section({
            "report_id": report_id,
            "section_key": section_key,
            "status": "pending",
        })

    # Transition to reporting
    sim_repo.update(simulation_id, workspace_id, {"status": "reporting"})

    # Build context for report generation
    brief_context = row.get("brief_context_json", {})
    config = sim_repo.get_latest_config(simulation_id)
    planner_rec = config.get("planner_recommendation_json", {}) if config else {}

    sim_context = {
        "simulation_name": row.get("name"),
        "brief_text": row.get("brief_text"),
        "brief_understanding": brief_context,
        "planner_recommendation": planner_rec,
        "agent_count": row.get("agent_count_final"),
        "duration": row.get("duration_preset"),
        "platforms": row.get("platform_scope"),
    }

    # Generate sections progressively
    generated_sections = {}
    for section_key in REPORT_SECTIONS:
        try:
            report_repo.update_section(report_id, section_key, {"status": "generating"})

            section_data = await _generate_section(section_key, sim_context, generated_sections)
            generated_sections[section_key] = section_data

            from datetime import datetime, timezone
            report_repo.update_section(report_id, section_key, {
                "status": "completed",
                "content_markdown": section_data.get("content_markdown", ""),
                "structured_json": section_data.get("structured_json", {}),
                "generated_at": datetime.now(timezone.utc).isoformat(),
            })

        except Exception as exc:
            report_repo.update_section(report_id, section_key, {
                "status": "failed",
                "content_markdown": f"Section generation failed: {exc}",
            })

    # Build summary from executive_summary section
    exec_summary = generated_sections.get("executive_summary", {})
    from datetime import datetime, timezone
    report_repo.update_report(report_id, {
        "status": "completed",
        "summary_json": exec_summary.get("structured_json"),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    })

    sim_repo.update(simulation_id, workspace_id, {"status": "completed"})

    return {
        "report_id": report_id,
        "status": "completed",
        "sections_generated": len(generated_sections),
        "sections_failed": len(REPORT_SECTIONS) - len(generated_sections),
    }


async def _generate_section(
    section_key: str,
    sim_context: dict[str, Any],
    previous_sections: dict[str, Any],
) -> dict[str, Any]:
    """Generate a single report section via Claude Sonnet (REPORT route)."""

    section_descriptions = {
        "executive_summary": "Write a concise executive summary of the simulation results. Cover the main takeaway, overall sentiment, key risks identified, and top recommendation.",
        "simulation_context": "Summarize the simulation setup: goal, brief, agent count, duration, geography scope, platform scope, audience composition, recsys choice, and key planner assumptions.",
        "outcome_scorecard": "Provide a compact evaluation scorecard: overall score, risk score, resonance score, controversy score, adoption potential, polarization score. Use 0-10 scale with labeled bands.",
        "key_findings": "List the 5-8 most important findings from the simulation. Each finding should be specific and evidence-backed.",
        "belief_shifts": "Analyze how audience beliefs and opinions shifted during the simulation. Identify which segments changed position and why.",
        "patient_zero": "Identify the most influential agents/amplifiers in the simulation. Who drove the narrative? Who were early adopters vs resistors?",
        "segment_analysis": "Break down results by audience segment. How did each segment react differently?",
        "geography_analysis": "Analyze geographic patterns in the simulation results. Regional variations, hotspots, and cold zones.",
        "platform_analysis": "Compare results across platforms. How did the conversation differ on each platform?",
        "exposure_analysis": "Explain what agents saw and how that shaped outcomes. Top exposed content, exposure distribution across segments, recsys effect summary.",
        "faction_analysis": "Explain social structure changes. Faction emergence, echo chambers, follow clusters, bridge roles, de-escalators.",
        "recommendations": "Provide 5-8 actionable recommendations based on the simulation results. Be specific and strategic.",
        "evidence": "Summarize the key evidence supporting the findings. Reference specific events, posts, or patterns.",
        "confidence_limitations": "Assess the confidence level of this analysis. Note limitations, assumptions, and areas where more data would help. NOTE: This report is generated from simulation configuration and planner data. True evidence-backed reporting depends on real OASIS runtime execution, which is not yet wired.",
    }

    prompt = (
        f"## Simulation Context\n"
        f"```json\n{json.dumps(sim_context, indent=2, default=str)}\n```\n\n"
    )

    if previous_sections:
        prompt += "## Previous Sections Already Generated\n"
        for key, data in previous_sections.items():
            prompt += f"### {key}\n{data.get('content_markdown', '')[:500]}\n\n"

    prompt += (
        f"## Task\n"
        f"Generate the **{section_key}** section.\n"
        f"{section_descriptions.get(section_key, 'Generate this report section.')}\n"
    )

    response = await llm_adapter.complete(
        route=ModelRoute.REPORT,
        messages=[{"role": "user", "content": prompt}],
        system=REPORT_SYSTEM,
        max_tokens=4096,
        temperature=0.4,
    )

    try:
        result = json.loads(response.content)
    except json.JSONDecodeError:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        result = json.loads(content)

    return result


# ── Read operations ────────────────────────────────────────────────────

async def get_report(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """Get the latest report for a simulation with all sections."""
    row = sim_repo.find_by_id(simulation_id, workspace_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    report = report_repo.find_report_by_simulation(str(simulation_id))
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No report found")

    report["sections"] = report_repo.get_sections(report["report_id"])
    return report
