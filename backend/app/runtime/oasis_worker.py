"""
Raktio Runtime — OASIS Worker

Executes a real OASIS simulation using env.step() loop.

This module is the bridge between the Raktio product layer and the
OASIS runtime engine. It:
  1. Imports OASIS from the local oasis-main/ directory
  2. Creates camel-ai model backends (DeepSeek for RUNTIME route)
  3. Builds SocialAgent instances with UserInfo configs
  4. Constructs AgentGraph
  5. Calls oasis.make() → env.reset() → env.step() loop → env.close()
  6. Updates simulation/run status in Supabase during execution

Execution model:
  Currently runs synchronously in-process. In production, this should
  be dispatched to an ARQ background worker to avoid blocking the API.

OASIS requirements (confirmed in Step 7.5A):
  - Python path must include oasis-main/
  - Model must be created via camel.models.ModelFactory.create()
  - SocialAgent needs integer agent_id, UserInfo, model, AgentGraph
  - DefaultPlatformType.REDDIT or .TWITTER
  - env.step() takes {agent: LLMAction()} dict
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
    available_actions = [
        ActionType.CREATE_POST,
        ActionType.CREATE_COMMENT,
        ActionType.LIKE_POST,
        ActionType.DISLIKE_POST,
        ActionType.FOLLOW,
        ActionType.UNFOLLOW,
        ActionType.MUTE,
        ActionType.REPOST,
        ActionType.QUOTE_POST,
        ActionType.SEARCH_POSTS,
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
        for step_num in range(1, duration_steps + 1):
            logger.info(f"Step {step_num}/{duration_steps}")

            # All agents perform LLM actions
            all_llm_actions = {
                agent: LLMAction()
                for _, agent in env.agent_graph.get_agents()
            }

            await env.step(all_llm_actions)

            execution_summary["steps_completed"] = step_num

            # Update progress every step
            simulated_time = f"{step_num}h"
            _update_progress(run_id, step_num, duration_steps, simulated_time)

            logger.info(f"Step {step_num}/{duration_steps} completed")

    except Exception as exc:
        error_msg = f"OASIS step failed at step {execution_summary['steps_completed']}: {exc}"
        logger.error(error_msg)
        execution_summary["errors"].append(error_msg)

    # ── 8. Close environment ──
    try:
        await env.close()
        logger.info("Environment closed")
    except Exception as exc:
        logger.warning(f"Error closing environment: {exc}")

    # ── 9. Determine final status ──
    if execution_summary["errors"]:
        final_status = "failed"
        failure_reason = "; ".join(execution_summary["errors"])
        _finalize_run(simulation_id, workspace_id, run_id, "failed", failure_reason)
    else:
        _finalize_run(simulation_id, workspace_id, run_id, "completed", None)
        final_status = "completed"

    execution_summary["final_status"] = final_status
    execution_summary["sqlite_path"] = sqlite_path

    logger.info(f"Run finished: {final_status}, {execution_summary['steps_completed']}/{duration_steps} steps")
    return execution_summary


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
    """Finalize the run after OASIS execution completes."""
    import uuid as uuid_mod
    now = datetime.now(timezone.utc).isoformat()

    run_update: dict[str, Any] = {"status": status}
    if status == "completed":
        run_update["completed_at"] = now
        sim_status = "completing"
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
