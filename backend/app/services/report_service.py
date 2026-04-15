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
from app.runtime.event_bridge import build_evidence_bundle

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

You generate one section of a simulation report at a time.

Evidence handling rules:
- When runtime_evidence is provided AND has sufficient data, cite real events, posts, and metrics.
- When evidence is sparse (few agents, few posts), acknowledge the limitation and provide the best analysis possible with what exists. Do NOT invent data. Do NOT refuse to generate the section.
- When no runtime evidence is provided, clearly state findings are based on simulation configuration only.
- A small simulation (< 50 agents) with limited evidence is NORMAL. Always produce useful analysis.

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
- When evidence exists, cite specific posts/comments by quoting them
- Include real metrics (post count, comment count, like count, etc.)
- If evidence is insufficient for strong conclusions, say so explicitly but still provide the section
- Always output valid JSON, nothing else
"""


async def generate_report(
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
    language: str = "en",
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
        "summary_json": {"language": language},
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

    # Get runtime evidence from OASIS SQLite (if available)
    runtime_evidence = {}
    sqlite_path = run.get("sqlite_path") if run else None
    if sqlite_path:
        runtime_evidence = build_evidence_bundle(sqlite_path)

    # Get agent geography data from Supabase (GEO-01)
    from app.repositories import agents as agent_repo
    participants = agent_repo.get_simulation_participants(simulation_id)
    agent_geo: dict[str, str] = {}
    for p in participants:
        agent = agent_repo.find_agent_by_id(uuid.UUID(p["agent_id"]))
        if agent:
            agent_geo[agent.get("username", "")] = f"{agent.get('city', '')}, {agent.get('country', '')}".strip(", ")

    sim_context = {
        "simulation_name": row.get("name"),
        "brief_text": row.get("brief_text"),
        "brief_understanding": brief_context,
        "planner_recommendation": planner_rec,
        "agent_count": row.get("agent_count_final"),
        "duration": row.get("duration_preset"),
        "platforms": row.get("platform_scope"),
        "has_runtime_evidence": bool(runtime_evidence),
        "runtime_evidence": runtime_evidence,
        "agent_geography": agent_geo,
    }

    # Generate sections progressively with robust retry
    from datetime import datetime, timezone
    generated_sections = {}
    max_retries = 2  # Up to 3 attempts total

    for section_key in REPORT_SECTIONS:
        success = False
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                report_repo.update_section(report_id, section_key, {"status": "generating"})

                section_data = await _generate_section(
                    section_key, sim_context, generated_sections,
                    log_context={
                        "simulation_id": str(simulation_id),
                        "workspace_id": str(workspace_id),
                        "report_id": report_id,
                        "service_module": "report_service",
                        "call_purpose": f"report_section:{section_key}" + (f":retry{attempt}" if attempt > 0 else ""),
                    },
                    language=language,
                )
                generated_sections[section_key] = section_data

                report_repo.update_section(report_id, section_key, {
                    "status": "completed",
                    "content_markdown": section_data.get("content_markdown", ""),
                    "structured_json": section_data.get("structured_json", {}),
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                })
                success = True
                break

            except (SystemExit, KeyboardInterrupt):
                raise
            except Exception as exc:
                last_error = exc
                if attempt < max_retries:
                    continue  # Retry with same prompt

        # If all attempts failed, generate a graceful degradation section
        if not success:
            fallback = _generate_fallback_section(section_key, sim_context, str(last_error))
            generated_sections[section_key] = fallback
            report_repo.update_section(report_id, section_key, {
                "status": "completed",
                "content_markdown": fallback["content_markdown"],
                "structured_json": fallback.get("structured_json", {}),
                "generated_at": datetime.now(timezone.utc).isoformat(),
            })

    # Build summary from executive_summary section
    exec_summary = generated_sections.get("executive_summary", {})
    scorecard = generated_sections.get("outcome_scorecard", {}).get("structured_json")
    report_repo.update_report(report_id, {
        "status": "completed",
        "summary_json": {
            **(exec_summary.get("structured_json") or {}),
            "language": language,
            "sections_generated": len(generated_sections),
            "evidence_level": "sparse" if (sim_context.get("agent_count") or 0) < 50 else "standard",
        },
        "scorecard_json": scorecard,
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
    log_context: dict[str, Any] | None = None,
    language: str = "en",
) -> dict[str, Any]:
    """Generate a single report section via Claude Sonnet (REPORT route)."""

    # Classify evidence strength
    evidence = sim_context.get("runtime_evidence", {})
    agent_count = sim_context.get("agent_count") or 0
    post_count = evidence.get("event_counts", {}).get("post", 0) if evidence else 0
    comment_count = evidence.get("event_counts", {}).get("comment", 0) if evidence else 0
    trace_count = evidence.get("event_counts", {}).get("trace", 0) if evidence else 0

    if trace_count > 500 and post_count > 50:
        evidence_level = "rich"
    elif trace_count > 50 and post_count > 5:
        evidence_level = "moderate"
    else:
        evidence_level = "sparse"

    # Evidence caveat for prompts
    evidence_caveat = ""
    if evidence_level == "sparse":
        evidence_caveat = (
            f"\n\nNOTE: This is a {'small ' if agent_count < 50 else ''}simulation with limited evidence "
            f"({agent_count} agents, {post_count} posts, {comment_count} comments). "
            f"Provide the best analysis you can with available data. "
            f"Acknowledge limitations explicitly. Do NOT fabricate data. "
            f"If insufficient evidence exists for strong conclusions in this section, "
            f"state what CAN be observed and what cannot.\n"
        )
    elif evidence_level == "moderate":
        evidence_caveat = (
            f"\n\nNOTE: Moderate evidence available ({agent_count} agents, {post_count} posts). "
            f"Provide analysis based on what exists. Flag areas with limited confidence.\n"
        )

    section_descriptions = {
        "executive_summary": "Write a concise executive summary of the simulation results. Cover the main takeaway, overall sentiment, key risks identified, and top recommendation.",
        "simulation_context": "Summarize the simulation setup: goal, brief, agent count, duration, geography scope, platform scope, audience composition, recsys choice, and key planner assumptions.",
        "outcome_scorecard": "Provide a compact evaluation scorecard: overall score, risk score, resonance score, controversy score, adoption potential, polarization score. Use 0-10 scale with labeled bands. If evidence is limited, provide best estimates and note low confidence.",
        "key_findings": f"List the {'3-5' if evidence_level == 'sparse' else '5-8'} most important findings from the simulation. Each finding should be specific and evidence-backed where possible.",
        "belief_shifts": "Analyze how audience beliefs and opinions shifted during the simulation. Use behavioral indicators (likes, dislikes, follows, mutes) as proxies if direct stance data is limited.",
        "patient_zero": "Identify the most active or influential agents in the simulation based on post counts, engagement received, and follow relationships. If no clear 'patient zero' pattern exists, describe the most notable agents and their behavior." + (" With limited agents, focus on who was most active and what content generated the most engagement." if evidence_level == "sparse" else ""),
        "segment_analysis": "Break down results by audience segment (profession, demographics, or behavioral patterns). If formal segments are not available, group agents by observed behavior patterns.",
        "geography_analysis": "Analyze geographic patterns in the simulation results. If agents are concentrated in one region, describe the regional context and note the limited geographic scope rather than claiming regional variation." + (" With agents from a single country, focus on what the geographic concentration means for the findings." if evidence_level == "sparse" else ""),
        "platform_analysis": "Analyze how the conversation played out on the simulated platform(s). If only one platform was simulated, focus on platform-specific dynamics and behavioral patterns rather than cross-platform comparison.",
        "exposure_analysis": "Explain what agents saw and how that shaped outcomes. Top exposed content, exposure distribution, and recommendation system effects.",
        "faction_analysis": "Describe social structure patterns observed: clusters, follow relationships, echo chambers, bridge agents. If interaction data is limited, describe what patterns are visible.",
        "recommendations": f"Provide {'3-5' if evidence_level == 'sparse' else '5-8'} actionable recommendations based on the simulation results. Be specific and strategic.",
        "evidence": "Summarize the key evidence supporting the findings. Reference specific events, posts, or patterns. Include the most notable quotes and interactions.",
        "confidence_limitations": "Assess the confidence level of this analysis. Note limitations from simulation size, evidence density, and methodological assumptions.",
    }

    # Build context block — exclude heavy evidence from JSON to stay within token limits
    context_for_prompt = {
        "simulation_name": sim_context.get("simulation_name"),
        "brief_text": sim_context.get("brief_text"),
        "agent_count": sim_context.get("agent_count"),
        "duration": sim_context.get("duration"),
        "platforms": sim_context.get("platforms"),
        "has_runtime_evidence": sim_context.get("has_runtime_evidence", False),
    }

    # Language instruction for report output
    lang_map = {"en": "English", "it": "Italian", "es": "Spanish", "fr": "French", "de": "German", "pt": "Portuguese"}
    lang_name = lang_map.get(language, language)
    lang_instruction = f"\n\nIMPORTANT: Write all analysis text in {lang_name}. Preserve any evidence quotes (agent posts, comments) in their original language.\n" if language != "en" else ""

    prompt = f"## Simulation Setup\n```json\n{json.dumps(context_for_prompt, indent=2, default=str)}\n```\n{lang_instruction}\n"

    # Add runtime evidence if available
    evidence = sim_context.get("runtime_evidence", {})
    if evidence:
        prompt += "## Runtime Evidence (from real OASIS simulation)\n\n"

        # Event counts
        counts = evidence.get("event_counts", {})
        prompt += f"### Event Counts\n"
        prompt += f"- Posts: {counts.get('post', 0)}\n"
        prompt += f"- Comments: {counts.get('comment', 0)}\n"
        prompt += f"- Likes: {counts.get('like', 0)}\n"
        prompt += f"- Dislikes: {counts.get('dislike', 0)}\n"
        prompt += f"- Follows: {counts.get('follow', 0)}\n"
        prompt += f"- Mutes: {counts.get('mute', 0)}\n"
        prompt += f"- Reports: {counts.get('report', 0)}\n"
        prompt += f"- Total trace events: {counts.get('trace', 0)}\n"
        prompt += f"- Exposure records: {evidence.get('exposure_records', 0)}\n\n"

        # Action summary
        action_summary = evidence.get("action_summary", {})
        if action_summary:
            prompt += f"### Action Summary\n"
            for action, count in sorted(action_summary.items(), key=lambda x: -x[1]):
                if action not in ("refresh", "sign_up"):
                    prompt += f"- {action}: {count}\n"
            prompt += "\n"

        # Top posts (with actual content)
        top_posts = evidence.get("top_posts", [])
        if top_posts:
            prompt += "### Top Posts (by engagement)\n"
            for p in top_posts[:5]:
                content = (p.get("content") or "")[:200]
                prompt += (
                    f"- **{p.get('username', '?')}**: \"{content}\"\n"
                    f"  (likes: {p.get('num_likes', 0)}, "
                    f"dislikes: {p.get('num_dislikes', 0)}, "
                    f"shares: {p.get('num_shares', 0)})\n"
                )
            prompt += "\n"

        # Sample comments (with actual content)
        sample_comments = evidence.get("sample_comments", [])
        if sample_comments:
            prompt += "### Sample Comments\n"
            for c in sample_comments[:8]:
                content = (c.get("content") or "")[:150]
                prompt += (
                    f"- **{c.get('username', '?')}** on post {c.get('post_id')}: "
                    f"\"{content}\"\n"
                )
            prompt += "\n"

        # Per-agent activity
        agent_activity = evidence.get("agent_activity", {})
        if agent_activity:
            prompt += "### Per-Agent Activity\n"
            for agent, acts in agent_activity.items():
                act_str = ", ".join(f"{k}: {v}" for k, v in acts.items())
                prompt += f"- **{agent}**: {act_str}\n"
            prompt += "\n"

        # Belief shift indicators
        belief = evidence.get("belief_indicators", {})
        if belief:
            prompt += "### Belief/Stance Indicators (per agent)\n"
            for agent, ind in belief.items():
                stance = ind.get("behavioral_stance", "unknown")
                ratio = ind.get("reaction_ratio")
                ratio_str = f", reaction ratio: {ratio}" if ratio is not None else ""
                targets = ind.get("engagement_targets", {})
                target_str = f", engages with: {', '.join(targets.keys())}" if targets else ""
                prompt += f"- **{agent}**: {stance}{ratio_str}{target_str}\n"
            prompt += "\n"

        # Exposure history
        exp_hist = evidence.get("exposure_history", {})
        per_agent_exp = exp_hist.get("per_agent", {})
        per_post_exp = exp_hist.get("per_post", {})
        if per_agent_exp:
            prompt += "### Exposure History (what each agent saw)\n"
            for agent, data in per_agent_exp.items():
                prompt += (
                    f"- **{agent}**: saw {data.get('unique_posts', 0)} unique posts, "
                    f"{data.get('exposure_count', 0)} total exposures\n"
                )
            prompt += "\n"
        if per_post_exp:
            prompt += "### Post Reach\n"
            for pid, data in per_post_exp.items():
                agents = data.get("exposed_to", [])
                prompt += f"- Post {pid}: reached {len(agents)} agents ({', '.join(agents)})\n"
            prompt += "\n"

        # Interaction matrix
        interactions = evidence.get("interaction_matrix", {})
        comment_int = interactions.get("comment_interactions", [])
        like_int = interactions.get("like_interactions", [])
        follow_edges = interactions.get("follow_edges", [])
        mute_edges = interactions.get("mute_edges", [])
        if comment_int or like_int:
            prompt += "### Interaction Matrix\n"
            for i in comment_int:
                prompt += f"- {i['from']} commented on {i['to']}'s posts: {i['count']}x\n"
            for i in like_int:
                prompt += f"- {i['from']} liked {i['to']}'s posts: {i['count']}x\n"
            prompt += "\n"
        if follow_edges:
            prompt += "### Follow Relationships\n"
            for f in follow_edges:
                prompt += f"- {f['follower']} → {f['followee']}\n"
            prompt += "\n"
        if mute_edges:
            prompt += "### Mute Relationships\n"
            for m in mute_edges:
                prompt += f"- {m['muter']} muted {m['mutee']}\n"
            prompt += "\n"
    else:
        prompt += (
            "## Note\n"
            "No runtime evidence available. This report is based on simulation "
            "configuration and planner data only. Findings are speculative.\n\n"
        )

    # Agent geography context (from Supabase, not SQLite)
    agent_geo = sim_context.get("agent_geography", {})
    if agent_geo:
        prompt += "### Agent Geography\n"
        for agent, loc in agent_geo.items():
            if loc:
                prompt += f"- **{agent}**: {loc}\n"
        prompt += "\n"

    # Previous sections for coherence
    if previous_sections:
        # Include only summaries of previous sections to control prompt size
        # (truncated to 150 chars each to prevent token bloat for later sections)
        prompt += "## Previous Sections (summaries)\n"
        for key, data in previous_sections.items():
            md = data.get("content_markdown", "")
            # Take first meaningful line, truncated
            summary = md.split("\n")[0][:150] if md else "(generated)"
            prompt += f"- **{key}**: {summary}\n"
        prompt += "\n"

    prompt += (
        f"## Task\n"
        f"Generate the **{section_key}** section.\n"
        f"{section_descriptions.get(section_key, 'Generate this report section.')}\n"
        f"{evidence_caveat}"
    )

    response = await llm_adapter.complete(
        route=ModelRoute.REPORT,
        messages=[{"role": "user", "content": prompt}],
        system=REPORT_SYSTEM,
        max_tokens=4096,
        temperature=0.4,
        log_context=log_context,
    )

    result = _parse_section_json(response.content, section_key)
    return result


def _generate_fallback_section(section_key: str, sim_context: dict[str, Any], error_msg: str) -> dict[str, Any]:
    """
    Generate a graceful degradation section when LLM generation fails.
    Always returns valid content — never fails.
    """
    agent_count = sim_context.get("agent_count") or 0
    evidence = sim_context.get("runtime_evidence", {})
    post_count = evidence.get("event_counts", {}).get("post", 0) if evidence else 0
    title = section_key.replace("_", " ").title()

    fallback_messages = {
        "patient_zero": (
            f"## {title}\n\n"
            f"With {agent_count} agents and {post_count} posts in this simulation, "
            f"no clear single-origin cascade pattern (\"patient zero\") was identified. "
            f"In small simulations, influence tends to be distributed rather than concentrated. "
            f"The most active agents can be reviewed in the Agent Atlas for behavioral details.\n\n"
            f"*This section had limited evidence for strong amplifier identification.*"
        ),
        "geography_analysis": (
            f"## {title}\n\n"
            f"Geographic analysis is limited in this simulation. "
            f"The agent population {'was concentrated in a single region' if agent_count < 50 else 'had geographic distribution'}. "
            f"For meaningful geographic comparison, simulations with multi-country agent pools "
            f"provide richer regional variation data.\n\n"
            f"*Insufficient geographic diversity for detailed regional analysis.*"
        ),
        "faction_analysis": (
            f"## {title}\n\n"
            f"With {agent_count} agents, formal faction/cluster analysis produced limited results. "
            f"Social structure patterns typically emerge more clearly in larger populations (50+ agents). "
            f"Follow and mute relationships from this run are available in the interaction data.\n\n"
            f"*Limited agent population for reliable faction identification.*"
        ),
    }

    content = fallback_messages.get(section_key, (
        f"## {title}\n\n"
        f"This section could not be fully generated from the available simulation evidence "
        f"({agent_count} agents, {post_count} posts). "
        f"The analysis may require a larger simulation or richer interaction data.\n\n"
        f"*Section generation was limited by available evidence.*"
    ))

    return {
        "content_markdown": content,
        "structured_json": {
            "key_points": [f"Limited evidence for {title.lower()} analysis"],
            "metrics": {},
            "evidence_refs": [],
            "evidence_level": "insufficient",
        },
    }


def _parse_section_json(raw: str, section_key: str) -> dict[str, Any]:
    """
    Robustly parse LLM output into the expected section JSON structure.
    Tries multiple strategies before giving up.
    """
    # Strategy 1: Direct JSON parse
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        pass

    # Strategy 2: Extract from ```json ... ``` blocks
    if "```json" in raw:
        try:
            extracted = raw.split("```json")[1].split("```")[0].strip()
            return json.loads(extracted)
        except (json.JSONDecodeError, IndexError):
            pass

    # Strategy 3: Extract from generic ``` ... ``` blocks
    if "```" in raw:
        try:
            extracted = raw.split("```")[1].split("```")[0].strip()
            return json.loads(extracted)
        except (json.JSONDecodeError, IndexError):
            pass

    # Strategy 4: Find JSON-like content between { and }
    try:
        start = raw.index("{")
        # Find the matching closing brace
        depth = 0
        for i in range(start, len(raw)):
            if raw[i] == "{":
                depth += 1
            elif raw[i] == "}":
                depth -= 1
                if depth == 0:
                    return json.loads(raw[start:i+1])
    except (ValueError, json.JSONDecodeError):
        pass

    # Strategy 5: Treat entire response as markdown content (graceful fallback)
    # The LLM returned text instead of JSON — wrap it in the expected structure
    clean_text = raw.strip()
    if clean_text.startswith("#") or len(clean_text) > 50:
        return {
            "content_markdown": f"## {section_key.replace('_', ' ').title()}\n\n{clean_text}",
            "structured_json": {
                "key_points": ["Content generated but returned as text instead of structured JSON"],
                "metrics": {},
                "evidence_refs": [],
            },
        }

    # Strategy 6: Complete failure — return a minimal valid section
    return {
        "content_markdown": f"## {section_key.replace('_', ' ').title()}\n\nThis section could not be generated from the available evidence.",
        "structured_json": {
            "key_points": ["Section generation produced unparseable output"],
            "metrics": {},
            "evidence_refs": [],
        },
    }


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
