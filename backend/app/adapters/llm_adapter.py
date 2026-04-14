"""
Raktio — LLM Adapter
Provider-agnostic interface for all LLM calls in the platform.

MODEL ROUTING POLICY
====================
PLANNING route  → Claude Sonnet (Anthropic)
    - brief understanding
    - ontology / entity / topic extraction
    - simulation planning & config generation
    - audience, geography, platform recommendations

RUNTIME route   → DeepSeek
    - agent inference during OASIS simulation
    - repeated high-volume action decisions
    - cost-efficient live simulation behavior

REPORT route    → Claude Sonnet (Anthropic)
    - final premium report generation
    - deeper reasoning over simulation evidence
    - insight synthesis and recommendation writing

Usage:
    from app.adapters.llm_adapter import llm_adapter, ModelRoute
    response = await llm_adapter.complete(
        route=ModelRoute.PLANNING,
        messages=[{"role": "user", "content": "..."}],
        system="...",
    )
"""

from __future__ import annotations

import asyncio
from typing import Any, AsyncIterator

from app.config import ModelRoute, settings


class LLMResponse:
    def __init__(self, content: str, model: str, usage: dict):
        self.content = content
        self.model = model
        self.usage = usage


# ── Cost estimation constants (per 1M tokens, USD) ────────────────────
# These are approximate list prices for cost tracking, not for billing.
_COST_PER_1M_INPUT: dict[str, float] = {
    "claude-sonnet-4-6": 3.0,
    "deepseek-chat": 0.14,
}
_COST_PER_1M_OUTPUT: dict[str, float] = {
    "claude-sonnet-4-6": 15.0,
    "deepseek-chat": 0.28,
}


def _estimate_cost_usd(model: str, input_tokens: int, output_tokens: int) -> float:
    """Estimate USD cost from token counts. For analytics only."""
    input_cost = input_tokens * _COST_PER_1M_INPUT.get(model, 1.0) / 1_000_000
    output_cost = output_tokens * _COST_PER_1M_OUTPUT.get(model, 5.0) / 1_000_000
    return round(input_cost + output_cost, 6)


class LLMAdapter:
    """
    Provider-agnostic LLM adapter.

    Internally routes to:
    - Anthropic SDK  → for PLANNING and REPORT routes (Claude Sonnet)
    - DeepSeek API   → for RUNTIME route (via OpenAI-compatible client)

    All routing decisions are driven by ModelRoute enum + settings.
    Admin panel can override model IDs at runtime via settings.
    """

    def _get_model_id(self, route: ModelRoute) -> str:
        mapping = {
            ModelRoute.PLANNING: settings.model_planning,
            ModelRoute.RUNTIME:  settings.model_runtime,
            ModelRoute.REPORT:   settings.model_report,
        }
        return mapping[route]

    def _is_anthropic_route(self, route: ModelRoute) -> bool:
        return route in (ModelRoute.PLANNING, ModelRoute.REPORT)

    async def complete(
        self,
        route: ModelRoute,
        messages: list[dict[str, str]],
        system: str = "",
        max_tokens: int = 4096,
        temperature: float = 0.7,
        stream: bool = False,
        log_context: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> LLMResponse:
        """
        Send a completion request to the appropriate provider.

        Args:
            route:       ModelRoute.PLANNING | RUNTIME | REPORT
            messages:    List of {role, content} dicts
            system:      System prompt
            max_tokens:  Maximum output tokens
            temperature: Sampling temperature
            stream:      Whether to stream
            log_context: Optional dict with context IDs for usage logging:
                         simulation_id, run_id, report_id, compare_id,
                         agent_id, organization_id, workspace_id, user_id,
                         service_module, call_purpose
        """
        import time
        model_id = self._get_model_id(route)
        t0 = time.time()

        if self._is_anthropic_route(route):
            response = await self._call_anthropic(
                model_id=model_id,
                system=system,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs,
            )
            provider = "anthropic"
        else:
            response = await self._call_deepseek(
                model_id=model_id,
                system=system,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs,
            )
            provider = "deepseek"

        duration_ms = round((time.time() - t0) * 1000)

        # Log usage (fire-and-forget, don't block the response)
        self._log_usage(
            provider=provider,
            model=response.model,
            route=route.value,
            input_tokens=response.usage.get("input_tokens", 0),
            output_tokens=response.usage.get("output_tokens", 0),
            duration_ms=duration_ms,
            log_context=log_context or {},
        )

        return response

    def _log_usage(
        self,
        provider: str,
        model: str,
        route: str,
        input_tokens: int,
        output_tokens: int,
        duration_ms: int,
        log_context: dict[str, Any],
    ) -> None:
        """Log LLM usage to the database. Best-effort, never raises."""
        try:
            from app.repositories import llm_usage as usage_repo

            row = {
                "provider": provider,
                "model": model,
                "route": route,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "estimated_cost_usd": _estimate_cost_usd(model, input_tokens, output_tokens),
                "duration_ms": duration_ms,
                # Context IDs (all optional)
                "simulation_id": log_context.get("simulation_id"),
                "run_id": log_context.get("run_id"),
                "report_id": log_context.get("report_id"),
                "compare_id": log_context.get("compare_id"),
                "agent_id": log_context.get("agent_id"),
                "organization_id": log_context.get("organization_id"),
                "workspace_id": log_context.get("workspace_id"),
                "user_id": log_context.get("user_id"),
                "service_module": log_context.get("service_module"),
                "call_purpose": log_context.get("call_purpose"),
            }
            # Remove None values (Supabase doesn't like explicit nulls for FK columns)
            row = {k: v for k, v in row.items() if v is not None}

            usage_repo.insert_usage(row)
        except Exception:
            pass  # Best-effort logging — never block the LLM call path

    async def stream_complete(
        self,
        route: ModelRoute,
        messages: list[dict[str, str]],
        system: str = "",
        max_tokens: int = 4096,
        temperature: float = 0.7,
        **kwargs: Any,
    ) -> AsyncIterator[str]:
        """
        Streaming completion — used for progressive report generation.
        Yields text chunks as they arrive.
        """
        # TODO: implement streaming for both Anthropic and DeepSeek
        raise NotImplementedError("Streaming not yet implemented")

    # ------------------------------------------------------------------
    # Private: Anthropic (Claude Sonnet) — PLANNING and REPORT routes
    # ------------------------------------------------------------------

    async def _call_anthropic(
        self,
        model_id: str,
        system: str,
        messages: list[dict],
        max_tokens: int,
        temperature: float,
        **kwargs,
    ) -> LLMResponse:
        """
        Call Anthropic API using the official anthropic Python SDK.
        """
        import anthropic

        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not configured")

        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

        api_kwargs: dict[str, Any] = {
            "model": model_id,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages,
        }
        if system:
            api_kwargs["system"] = system

        response = await client.messages.create(**api_kwargs)

        content_text = ""
        for block in response.content:
            if block.type == "text":
                content_text += block.text

        return LLMResponse(
            content=content_text,
            model=response.model,
            usage={
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
        )

    # ------------------------------------------------------------------
    # Private: DeepSeek — RUNTIME route
    # ------------------------------------------------------------------

    async def _call_deepseek(
        self,
        model_id: str,
        system: str,
        messages: list[dict],
        max_tokens: int,
        temperature: float,
        **kwargs,
    ) -> LLMResponse:
        """
        Call DeepSeek API (OpenAI-compatible endpoint).
        Used exclusively for high-volume agent inference during OASIS runtime.
        """
        from openai import AsyncOpenAI

        if not settings.deepseek_api_key:
            raise RuntimeError("DEEPSEEK_API_KEY is not configured")

        client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
        )

        # Build messages with system prompt prepended
        api_messages = []
        if system:
            api_messages.append({"role": "system", "content": system})
        api_messages.extend(messages)

        response = await client.chat.completions.create(
            model=model_id,
            messages=api_messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        choice = response.choices[0]
        return LLMResponse(
            content=choice.message.content or "",
            model=response.model,
            usage={
                "input_tokens": response.usage.prompt_tokens if response.usage else 0,
                "output_tokens": response.usage.completion_tokens if response.usage else 0,
            },
        )


# Singleton instance used across all services
llm_adapter = LLMAdapter()
