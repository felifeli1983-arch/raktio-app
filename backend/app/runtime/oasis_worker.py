"""
Raktio Runtime — OASIS Worker

Executes a real OASIS simulation using env.step() loop.

Status lifecycle (explicit and authoritative):

  SIMULATION STATUS (simulations.status):
    draft → cost_check → bootstrapping → running → completing → completed
                                                  ↘ failed
                                                  ↘ canceled (via supervisor)
    - cost_check:     set by launcher before credit reservation
    - bootstrapping:  set by launcher after run record created
    - running:        set by this worker when env.reset() succeeds
    - completing:     set by this worker when all env.step() finish
    - completed:      set by this worker after env.close() succeeds
    - failed:         set by this worker if any step throws
    - reporting:      set by report_service when report generation starts
    - canceled/paused: set by supervisor

  RUN STATUS (simulation_runs.status):
    bootstrapping → running → completed
                            ↘ failed
                            ↘ canceled / paused (via supervisor)
    - Run tracks the OASIS process state only.
    - Simulation status tracks the full product lifecycle.

Execution model:
  Currently runs synchronously in-process. In production, this should
  be dispatched to an ARQ background worker to avoid blocking the API.
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import settings
from app.repositories import billing as billing_repo
from app.repositories import simulations as sim_repo

logger = logging.getLogger("raktio.oasis_worker")


def _ensure_oasis_importable() -> None:
    """Add oasis-main/ to Python path if not already present."""
    oasis_path = os.path.abspath(settings.oasis_path)
    if oasis_path not in sys.path:
        sys.path.insert(0, oasis_path)


def _create_deepseek_model():
    """
    Create a camel-ai model backend for DeepSeek (RUNTIME route).
    Uses ModelFactory.create() with OPENAI_COMPATIBLE_MODEL platform.
    """
    from camel.models import ModelFactory
    from camel.types import ModelPlatformType

    if not settings.deepseek_api_key:
        raise RuntimeError("DEEPSEEK_API_KEY is not configured")

    return ModelFactory.create(
        model_platform=ModelPlatformType.OPENAI_COMPATIBLE_MODEL,
        model_type=settings.model_runtime,
        api_key=settings.deepseek_api_key,
        url=f"{settings.deepseek_base_url}/v1",
    )


async def run_oasis_simulation(
    runtime_config: dict[str, Any],
    simulation_id: str,
    workspace_id: str,
    run_id: str,
) -> dict[str, Any]:
    """
    Execute a full OASIS simulation run.

    Args:
        runtime_config: The config dict from config_builder.build_run_config()
        simulation_id: Raktio simulation UUID (string)
        workspace_id: Raktio workspace UUID (string)
        run_id: Raktio run UUID (string)

    Returns:
        Summary dict with execution results.

    Status transitions:
        bootstrapping → running → completing → completed (or failed)
    """
    _ensure_oasis_importable()

    import oasis
    from oasis import (
        ActionType, AgentGraph, LLMAction, SocialAgent, UserInfo,
    )

    agent_configs = runtime_config.get("agent_configs", [])
    duration_steps = runtime_config.get("duration_steps", 24)
    sqlite_path = runtime_config["sqlite_path"]
    platform_type_str = runtime_config.get("platform_type", "twitter")

    # Clean up old DB if exists
    if os.path.exists(sqlite_path):
        os.remove(sqlite_path)

    # Set OASIS env var for DB path resolution
    os.environ["OASIS_DB_PATH"] = os.path.abspath(sqlite_path)

    logger.info(
        f"Starting OASIS run: {len(agent_configs)} agents, "
        f"{duration_steps} steps, platform={platform_type_str}"
    )

    # ── 1. Create model backend ──
    model = _create_deepseek_model()

    # ── 2. Define available actions ──
    #
    # Full social action set. Excludes only internal OASIS mechanics
    # (REFRESH, SIGNUP, UPDATE_REC_TABLE, EXIT) and special actions
    # (INTERVIEW — triggered manually, PURCHASE_PRODUCT — not social).
    # Group actions (JOIN/LEAVE/SEND/CREATE/LISTEN_FROM_GROUP) are
    # deferred until group simulation features are implemented.
    #
    # This set covers: content creation, reactions, discovery,
    # relationships, moderation, and passive observation.
    available_actions = [
        # Content creation
        ActionType.CREATE_POST,
        ActionType.CREATE_COMMENT,
        ActionType.REPOST,
        ActionType.QUOTE_POST,
        # Post reactions
        ActionType.LIKE_POST,
        ActionType.UNLIKE_POST,
        ActionType.DISLIKE_POST,
        ActionType.UNDO_DISLIKE_POST,
        # Comment reactions
        ActionType.LIKE_COMMENT,
        ActionType.UNLIKE_COMMENT,
        ActionType.DISLIKE_COMMENT,
        ActionType.UNDO_DISLIKE_COMMENT,
        # Relationships
        ActionType.FOLLOW,
        ActionType.UNFOLLOW,
        ActionType.MUTE,
        ActionType.UNMUTE,
        # Discovery
        ActionType.SEARCH_POSTS,
        ActionType.SEARCH_USER,
        ActionType.TREND,
        # Moderation
        ActionType.REPORT_POST,
        # Passive
        ActionType.DO_NOTHING,
    ]

    # ── 3. Build AgentGraph + SocialAgents ──
    agent_graph = AgentGraph()

    for cfg in agent_configs:
        agent_index = cfg["agent_index"]
        profile_data = cfg.get("profile", {})

        user_info = UserInfo(
            user_name=cfg["user_name"],
            name=cfg["name"],
            description=cfg.get("description", ""),
            profile={
                "other_info": {
                    "user_profile": cfg.get("description", ""),
                    "gender": profile_data.get("gender", ""),
                    "age": str(profile_data.get("age", 30)),
                    "mbti": profile_data.get("mbti", ""),
                    "country": profile_data.get("country", ""),
                }
            },
            recsys_type=cfg.get("recsys_type", "reddit"),
        )

        agent = SocialAgent(
            agent_id=agent_index,
            user_info=user_info,
            agent_graph=agent_graph,
            model=model,
            available_actions=available_actions,
        )
        agent_graph.add_agent(agent)

    logger.info(f"Built AgentGraph with {len(agent_configs)} agents")

    # ── 4. Select OASIS platform type ──
    if platform_type_str == "reddit":
        platform = oasis.DefaultPlatformType.REDDIT
    else:
        platform = oasis.DefaultPlatformType.TWITTER

    # ── 5. Create environment ──
    env = oasis.make(
        agent_graph=agent_graph,
        platform=platform,
        database_path=sqlite_path,
    )

    # ── 6. Reset (sign up agents) ──
    logger.info("Resetting environment (signing up agents)...")
    _update_status(simulation_id, workspace_id, run_id, "running", step=0, total=duration_steps)
    await env.reset()
    logger.info("Agents signed up successfully")

    # ── 7. Execute step loop ──
    execution_summary = {
        "steps_completed": 0,
        "steps_total": duration_steps,
        "errors": [],
    }

    try:
        from app.runtime.temporal import select_active_agents, get_step_metadata

        for step_num in range(1, duration_steps + 1):
            # Temporal activity: select which agents act this step
            all_agents = list(env.agent_graph.get_agents())
            active_agents = select_active_agents(
                all_agents, step_num, start_hour=8, min_active=1,
            )
            step_meta = get_step_metadata(step_num, start_hour=8)

            logger.info(
                f"Step {step_num}/{duration_steps} "
                f"[{step_meta['daypart']} {step_meta['simulated_hour']:02d}:00] "
                f"— {len(active_agents)}/{len(all_agents)} agents active"
            )

            # Only active agents perform LLM actions this step
            step_actions = {
                agent: LLMAction()
                for _, agent in active_agents
            }

            await env.step(step_actions)

            # Influence exposure boost: inject high-influence agents' posts
            # into the rec table so more agents see them next step.
            # This directly increases exposure/reach for influential content.
            _boost_influence_exposure(sqlite_path, agent_configs)

            execution_summary["steps_completed"] = step_num

            simulated_time = f"{step_num}h"
            _update_progress(run_id, step_num, duration_steps, simulated_time)

            logger.info(f"Step {step_num}/{duration_steps} completed")

    except (SystemExit, KeyboardInterrupt, asyncio.CancelledError):
        raise  # Never swallow system-level signals
    except Exception as exc:
        error_msg = f"OASIS step failed at step {execution_summary['steps_completed']}: {type(exc).__name__}: {exc}"
        logger.error(error_msg)
        execution_summary["errors"].append(error_msg)

    # ── 8. Transition to completing ──
    if not execution_summary["errors"]:
        _update_status(simulation_id, workspace_id, run_id, "completing")
        logger.info("All steps done, completing...")

    # ── 9. Close environment ──
    try:
        await env.close()
        logger.info("Environment closed")
    except Exception as exc:
        logger.warning(f"Error closing environment: {exc}")

    # ── 10. Determine final status + settle credits ──
    if execution_summary["errors"]:
        final_status = "failed"
        failure_reason = "; ".join(execution_summary["errors"])
        _finalize_run(simulation_id, workspace_id, run_id, "failed", failure_reason)
        # Failed runs get full refund (handled by supervisor.cancel or here)
        _settle_credits(
            simulation_id, workspace_id,
            steps_completed=execution_summary["steps_completed"],
            steps_total=duration_steps,
            agent_count=len(agent_configs),
            duration_preset=runtime_config.get("duration_preset", "24h"),
            failed=True,
        )
    else:
        _finalize_run(simulation_id, workspace_id, run_id, "completed", None)
        final_status = "completed"
        # Successful runs settle based on actual execution
        _settle_credits(
            simulation_id, workspace_id,
            steps_completed=execution_summary["steps_completed"],
            steps_total=duration_steps,
            agent_count=len(agent_configs),
            duration_preset=runtime_config.get("duration_preset", "24h"),
            failed=False,
        )

    # ── 11. Memory transformation (successful runs only) ──
    if final_status == "completed":
        try:
            import uuid as uuid_mod
            from app.services.memory_service import transform_run_to_memory
            mem_result = await transform_run_to_memory(
                uuid_mod.UUID(simulation_id),
                uuid_mod.UUID(workspace_id),
            )
            execution_summary["memory_transformation"] = mem_result
            logger.info(f"Memory transformation: {mem_result.get('episodes_created', 0)} episodes")
        except Exception as exc:
            logger.warning(f"Memory transformation failed (non-blocking): {exc}")
            execution_summary["memory_transformation"] = {"status": "failed", "error": str(exc)[:200]}

    execution_summary["final_status"] = final_status
    execution_summary["sqlite_path"] = sqlite_path

    logger.info(f"Run finished: {final_status}, {execution_summary['steps_completed']}/{duration_steps} steps")
    return execution_summary



# ── Influence exposure boost ───────────────────────────────────────────

def _boost_influence_exposure(sqlite_path: str, agent_configs: list) -> None:
    """
    Directly inject high-influence agents' posts into the OASIS rec table.

    This ensures that high-influence agents' content appears in more agents'
    recommendation feeds, simulating the platform-level reach advantage
    that influential accounts have.

    Mechanism:
      - For each high-influence agent (influence_weight >= 2.0), find their posts
      - For each other agent who doesn't already have those posts in rec, add them
      - Probability of injection scales with influence_weight:
        weight >= 3.0: 90% chance per agent
        weight >= 2.0: 60% chance per agent
      - This is probabilistic, not deterministic

    This is a direct SQLite write — no OASIS API dependency.
    """
    import random
    import sqlite3

    if not sqlite_path or not os.path.exists(sqlite_path):
        return

    # Find high-influence agent indices
    high_influence = {}
    for cfg in agent_configs:
        weight = cfg.get("profile", {}).get("influence_weight", 1.0)
        if weight >= 2.0:
            high_influence[cfg["agent_index"]] = weight

    if not high_influence:
        return

    try:
        conn = sqlite3.connect(sqlite_path)
        cur = conn.cursor()

        # Get all user_ids
        cur.execute("SELECT user_id, agent_id FROM user")
        users = {row[1]: row[0] for row in cur.fetchall()}  # agent_id → user_id
        all_user_ids = list(users.values())

        for agent_idx, weight in high_influence.items():
            oasis_uid = users.get(agent_idx)
            if oasis_uid is None:
                continue

            # Find this agent's posts
            cur.execute("SELECT post_id FROM post WHERE user_id = ?", (oasis_uid,))
            post_ids = [row[0] for row in cur.fetchall()]
            if not post_ids:
                continue

            # Injection probability
            prob = 0.9 if weight >= 3.0 else 0.6

            # For each other user, probabilistically add recs
            for uid in all_user_ids:
                if uid == oasis_uid:
                    continue
                if random.random() > prob:
                    continue

                for pid in post_ids:
                    # Check if rec already exists (avoid duplicate PK violation)
                    cur.execute(
                        "SELECT 1 FROM rec WHERE user_id = ? AND post_id = ?",
                        (uid, pid)
                    )
                    if not cur.fetchone():
                        try:
                            cur.execute(
                                "INSERT INTO rec (user_id, post_id) VALUES (?, ?)",
                                (uid, pid)
                            )
                        except sqlite3.IntegrityError:
                            pass  # Concurrent insert — safe to ignore

        conn.commit()
        conn.close()

    except Exception as exc:
        logger.debug(f"Influence exposure boost skipped: {exc}")


# ── Status update helpers ──────────────────────────────────────────────

def _update_status(
    simulation_id: str,
    workspace_id: str,
    run_id: str,
    status: str,
    step: int = 0,
    total: int = 0,
) -> None:
    """Update simulation and run status."""
    import uuid as uuid_mod
    sim_repo.update(
        uuid_mod.UUID(simulation_id),
        uuid_mod.UUID(workspace_id),
        {"status": status},
    )
    sim_repo.update_run(run_id, {"status": status})


def _update_progress(run_id: str, step: int, total: int, simulated_time: str) -> None:
    """Update run progress during execution."""
    sim_repo.update_run(run_id, {
        "simulated_time_completed": simulated_time,
        "runtime_metadata_json": {
            "step": step,
            "total_steps": total,
            "progress_pct": round(step / total * 100, 1) if total > 0 else 0,
        },
    })


def _finalize_run(
    simulation_id: str,
    workspace_id: str,
    run_id: str,
    status: str,
    failure_reason: str | None,
) -> None:
    """
    Finalize the run after OASIS execution completes.

    Status mapping:
      run completed → sim completing → sim completed (all in one call)
      run failed    → sim failed
    """
    import uuid as uuid_mod
    now = datetime.now(timezone.utc).isoformat()

    run_update: dict[str, Any] = {"status": status}
    if status == "completed":
        run_update["completed_at"] = now
        # Simulation goes to completed. If report generation is triggered
        # later, report_service will temporarily set it to "reporting".
        sim_status = "completed"
    else:
        run_update["failed_at"] = now
        run_update["failure_reason"] = failure_reason
        sim_status = "failed"

    sim_repo.update_run(run_id, run_update)
    sim_repo.update(
        uuid_mod.UUID(simulation_id),
        uuid_mod.UUID(workspace_id),
        {"status": sim_status},
    )


def _settle_credits(
    simulation_id: str,
    workspace_id: str,
    steps_completed: int,
    steps_total: int,
    agent_count: int,
    duration_preset: str,
    failed: bool,
) -> None:
    """
    Settle credits after OASIS execution completes.

    Credit settlement logic:
      - On success (all steps completed): actual_cost = reserved_cost (no change)
      - On partial success (some steps completed): actual_cost = reserved × (steps/total)
      - On failure (0 steps): full refund
      - Partial refund = reserved - actual_cost

    Creates:
      - simulation_finalization ledger entry with actual cost
      - refund ledger entry if partial refund applies

    Updates:
      - credit_balances: reserved→0, available adjusted for refund
      - simulations.credit_final: set to actual cost
    """
    import uuid as uuid_mod

    org_id = sim_repo.get_workspace_org_id(uuid_mod.UUID(workspace_id))
    if not org_id:
        logger.warning(f"Cannot settle credits: no org for workspace {workspace_id}")
        return

    # Get the simulation to read credit_final (which is the reserved amount)
    sim = sim_repo.find_by_id(uuid_mod.UUID(simulation_id), uuid_mod.UUID(workspace_id))
    if not sim:
        logger.warning(f"Cannot settle credits: simulation {simulation_id} not found")
        return

    reserved = sim.get("credit_final", 0)
    if reserved == 0:
        return  # Nothing to settle

    # Calculate actual cost based on execution
    if failed and steps_completed == 0:
        actual_cost = 0
    elif steps_completed >= steps_total:
        actual_cost = reserved  # Full execution = full cost
    else:
        # Proportional cost for partial execution
        completion_ratio = steps_completed / steps_total if steps_total > 0 else 0
        actual_cost = max(1, round(reserved * completion_ratio))

    refund_amount = reserved - actual_cost

    # Get current balance
    balance = billing_repo.get_balance(org_id)
    if not balance:
        logger.warning(f"Cannot settle credits: no balance for org {org_id}")
        return

    current_available = balance["available_credits"]
    current_reserved = balance["reserved_credits"]

    # Settle: remove from reserved, refund difference to available
    new_reserved = max(0, current_reserved - reserved)
    new_available = current_available + refund_amount

    billing_repo.refund_credits(org_id, new_available, new_reserved)

    # Finalization ledger entry (the actual cost consumed)
    if actual_cost > 0:
        billing_repo.insert_ledger_entry({
            "organization_id": org_id,
            "workspace_id": workspace_id,
            "event_type": "simulation_finalization",
            "amount": -actual_cost,
            "balance_after": new_available,
            "linked_simulation_id": simulation_id,
            "note": (
                f"Credit finalization: {actual_cost} credits consumed "
                f"({steps_completed}/{steps_total} steps, {agent_count} agents)"
            ),
        })

    # Refund ledger entry if partial
    if refund_amount > 0:
        billing_repo.insert_ledger_entry({
            "organization_id": org_id,
            "workspace_id": workspace_id,
            "event_type": "refund",
            "amount": refund_amount,
            "balance_after": new_available,
            "linked_simulation_id": simulation_id,
            "note": (
                f"Partial refund: {refund_amount} credits returned "
                f"(ran {steps_completed}/{steps_total} steps)"
            ),
        })

    # Update simulation with actual cost
    sim_repo.update(
        uuid_mod.UUID(simulation_id),
        uuid_mod.UUID(workspace_id),
        {"credit_final": actual_cost},
    )

    logger.info(
        f"Credits settled: reserved={reserved}, actual={actual_cost}, "
        f"refund={refund_amount}, steps={steps_completed}/{steps_total}"
    )
