"""
Raktio Service — Knowledge & Source Processing

Handles source upload, text extraction, and LLM-based structured
extraction (entities, topics, key claims) that feed into simulation
brief understanding and planning.

Supported formats:
  - Plain text (.txt, .md)
  - PDF (.pdf) — via PyPDF2
  - DOCX (.docx) — via python-docx
  - Raw text paste (no file)

Extraction pipeline:
  1. Upload/paste → store raw text in sources.raw_text
  2. Parse file → extract plain text
  3. LLM extraction → entities, topics, key claims, summary
  4. Store in source_extractions
  5. Link to simulation via source_links
  6. Feed into brief understanding via get_source_context_for_simulation()
"""

from __future__ import annotations

import io
import json
import uuid
from typing import Any, Optional

from fastapi import HTTPException, UploadFile, status

from app.adapters.llm_adapter import llm_adapter
from app.config import ModelRoute
from app.repositories import sources as source_repo


SOURCE_EXTRACTION_SYSTEM = """You are the Source Extraction module of Raktio, a social reaction simulation platform.

Analyze an uploaded document and extract structured information for grounding simulation briefs.

Output valid JSON:
{
  "summary": "2-3 paragraph summary of the document",
  "entities": [
    {"name": "Entity", "type": "person|company|product|place|concept", "relevance": "why it matters"}
  ],
  "topics": ["topic1", "topic2"],
  "key_claims": [
    {"claim": "Main argument or fact", "source_context": "Where this appears"}
  ],
  "language": "en",
  "document_type": "press_release|report|article|analysis|brief|other",
  "simulation_relevance": "How this helps ground a simulation"
}

Rules:
- Always output valid JSON
- Extract real entities from content, not generic ones
- Be specific and grounded in the actual document
"""


def _extract_text_from_file(file_content: bytes, mime_type: str, file_name: str) -> str:
    """Extract plain text from uploaded file."""
    if mime_type in ("text/plain", "text/markdown", "application/x-markdown"):
        return file_content.decode("utf-8", errors="replace")

    if mime_type == "application/pdf" or file_name.lower().endswith(".pdf"):
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(file_content))
            return "\n\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Failed to parse PDF: {exc}")

    if file_name.lower().endswith(".docx"):
        try:
            from docx import Document
            doc = Document(io.BytesIO(file_content))
            return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Failed to parse DOCX: {exc}")

    try:
        return file_content.decode("utf-8", errors="replace")
    except Exception:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {mime_type}")


async def upload_source(
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    title: str,
    file: Optional[UploadFile] = None,
    raw_text: Optional[str] = None,
    description: Optional[str] = None,
) -> dict[str, Any]:
    """Upload a source document or paste raw text."""
    if not file and not raw_text:
        raise HTTPException(status_code=400, detail="Either file or raw_text must be provided")

    if file:
        file_content = await file.read()
        mime_type = file.content_type or "application/octet-stream"
        file_name = file.filename or "unknown"
        extracted_text = _extract_text_from_file(file_content, mime_type, file_name)
        source_type = "document"
    else:
        extracted_text = raw_text
        mime_type = "text/plain"
        file_name = None
        file_content = None
        source_type = "text"

    # Cap text length for DB and LLM
    if extracted_text and len(extracted_text) > 50000:
        extracted_text = extracted_text[:50000] + "\n\n[... truncated ...]"

    source = source_repo.insert_source({
        "workspace_id": str(workspace_id),
        "uploaded_by_user_id": str(user_id),
        "source_type": source_type,
        "title": title,
        "description": description,
        "file_name": file_name,
        "file_size_bytes": len(file_content) if file_content else len(extracted_text.encode()) if extracted_text else 0,
        "mime_type": mime_type,
        "raw_text": extracted_text,
        "parse_status": "parsed",
    })

    source_id = source["source_id"]

    try:
        extraction = await _extract_source_context(source_id, extracted_text or "")
        source["extraction"] = extraction
    except Exception as exc:
        source_repo.update_source(source_id, {"parse_status": "failed"})
        source["extraction"] = {"status": "failed", "error": str(exc)[:200]}

    return source


async def _extract_source_context(source_id: str, text: str) -> dict[str, Any]:
    """Run LLM extraction on source text."""
    llm_text = text[:20000]

    response = await llm_adapter.complete(
        route=ModelRoute.PLANNING,
        messages=[{
            "role": "user",
            "content": f"Analyze this document:\n\n{llm_text}",
        }],
        system=SOURCE_EXTRACTION_SYSTEM,
        max_tokens=4096,
        temperature=0.3,
        log_context={
            "service_module": "knowledge_service",
            "call_purpose": "source_extraction",
        },
    )

    try:
        data = json.loads(response.content)
    except json.JSONDecodeError:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        data = json.loads(content)

    return source_repo.insert_extraction({
        "source_id": source_id,
        "extraction_version": 1,
        "summary_json": {"summary": data.get("summary", "")},
        "entity_json": data.get("entities", []),
        "topic_json": data.get("topics", []),
        "key_claims_json": data.get("key_claims", []),
        "word_count": len(text.split()),
        "language": data.get("language", "en"),
    })


def get_source_context_for_simulation(simulation_id: str) -> Optional[dict[str, Any]]:
    """
    Get aggregated source context for a simulation.
    Injected into brief understanding to ground the simulation in real documents.
    """
    extractions = source_repo.get_extractions_for_entity("simulation", simulation_id)
    if not extractions:
        return None

    combined: dict[str, Any] = {
        "source_count": len(extractions),
        "summaries": [],
        "entities": [],
        "topics": set(),
        "key_claims": [],
    }

    for ext in extractions:
        summary = ext.get("summary_json", {})
        if isinstance(summary, dict) and summary.get("summary"):
            combined["summaries"].append(summary["summary"][:300])
        entities = ext.get("entity_json", [])
        if isinstance(entities, list):
            combined["entities"].extend(entities[:10])
        topics = ext.get("topic_json", [])
        if isinstance(topics, list):
            combined["topics"].update(topics)
        claims = ext.get("key_claims_json", [])
        if isinstance(claims, list):
            combined["key_claims"].extend(claims[:5])

    combined["topics"] = sorted(combined["topics"])
    return combined


async def link_source_to_simulation(
    source_id: uuid.UUID,
    simulation_id: uuid.UUID,
    workspace_id: uuid.UUID,
) -> dict[str, Any]:
    """Link a source to a simulation for grounding."""
    source = source_repo.find_source_by_id(str(source_id), str(workspace_id))
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source_repo.link_source(str(source_id), "simulation", str(simulation_id))


async def get_source(source_id: uuid.UUID, workspace_id: uuid.UUID) -> dict[str, Any]:
    source = source_repo.find_source_by_id(str(source_id), str(workspace_id))
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    extraction = source_repo.get_latest_extraction(str(source_id))
    if extraction:
        source["extraction"] = extraction
    return source


async def list_sources(workspace_id: uuid.UUID, limit: int = 50, offset: int = 0) -> dict[str, Any]:
    sources, total = source_repo.list_sources(str(workspace_id), limit, offset)
    return {"items": sources, "total": total}
