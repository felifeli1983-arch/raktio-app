"""
Raktio — Application Configuration
Loads environment variables and defines model routing policy.
"""

from enum import Enum
from pydantic_settings import BaseSettings


class ModelRoute(str, Enum):
    """
    Model routing policy for Raktio.

    PLANNING  → Claude Sonnet (Anthropic)
                Used for: brief understanding, ontology extraction, simulation planning,
                audience recommendation, geography/platform/stance config generation.

    RUNTIME   → DeepSeek
                Used for: high-volume agent inference during OASIS simulation execution.
                Cost-efficient for thousands of repeated agent actions per run.

    REPORT    → Claude Sonnet (Anthropic)
                Used for: final premium report generation, deeper reasoning over
                simulation results, evidence-backed insight synthesis.
    """
    PLANNING = "planning"
    RUNTIME  = "runtime"
    REPORT   = "report"


# Default model IDs per route — overridable via admin controls
MODEL_ROUTING: dict[ModelRoute, str] = {
    ModelRoute.PLANNING: "claude-sonnet-4-6",          # Anthropic
    ModelRoute.RUNTIME:  "deepseek-chat",               # DeepSeek
    ModelRoute.REPORT:   "claude-sonnet-4-6",           # Anthropic
}


class Settings(BaseSettings):
    # --- App ---
    app_name: str = "Raktio"
    app_env: str = "development"
    debug: bool = False

    # --- Anthropic (Claude Sonnet) ---
    anthropic_api_key: str = ""

    # --- DeepSeek ---
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"

    # --- Supabase ---
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""
    # JWT secret found in Supabase Dashboard → Settings → API → JWT Settings
    supabase_jwt_secret: str = ""

    # --- Redis (job queue) ---
    redis_url: str = "redis://localhost:6379"

    # --- Storage ---
    storage_provider: str = "supabase"     # supabase | s3 | r2
    storage_bucket_sources: str = "raktio-sources"
    storage_bucket_exports: str = "raktio-exports"

    # --- OASIS runtime ---
    oasis_path: str = "../oasis-main"
    oasis_run_workspace: str = "/tmp/raktio-runs"

    # --- Streaming ---
    stream_transport: str = "sse"          # sse | websocket

    # --- Model routing overrides (optional admin override) ---
    model_planning: str = MODEL_ROUTING[ModelRoute.PLANNING]
    model_runtime: str  = MODEL_ROUTING[ModelRoute.RUNTIME]
    model_report: str   = MODEL_ROUTING[ModelRoute.REPORT]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
