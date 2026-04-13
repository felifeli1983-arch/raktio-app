"""
Raktio — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import (
    simulations,
    reports,
    compare,
    audiences,
    agents,
    knowledge,
    billing,
    team,
    admin,
    stream,
)

app = FastAPI(
    title="Raktio API",
    version="0.1.0",
    description="OASIS-powered social reaction simulation platform",
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Route registration ---
app.include_router(simulations.router, prefix="/api/simulations", tags=["simulations"])
app.include_router(reports.router,     prefix="/api/reports",     tags=["reports"])
app.include_router(compare.router,     prefix="/api/compare",     tags=["compare"])
app.include_router(audiences.router,   prefix="/api/audiences",   tags=["audiences"])
app.include_router(agents.router,      prefix="/api/agents",      tags=["agents"])
app.include_router(knowledge.router,   prefix="/api/knowledge",   tags=["knowledge"])
app.include_router(billing.router,     prefix="/api/billing",     tags=["billing"])
app.include_router(team.router,        prefix="/api/team",        tags=["team"])
app.include_router(admin.router,       prefix="/api/admin",       tags=["admin"])
app.include_router(stream.router,      prefix="/api/stream",      tags=["stream"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}
