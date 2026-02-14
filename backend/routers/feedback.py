"""Feedback endpoint — collects user feedback with spam prevention + PII redaction."""
import os
import time
import hashlib
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel, Field
import asyncpg

from deps import get_db
from services.pii import redact_pii

router = APIRouter()

# ─── Rate limiting (in-memory, resets on restart) ──────────
_recent_ips: dict[str, float] = {}
RATE_LIMIT_SECONDS = 30

# ─── BEADS config ──────────────────────────────────────────
BEADS_DIR = Path(os.getenv("BEADS_DIR", "/app/beads"))
ISSUE_PREFIX = "ai-workshop-cs"


# ─── Models ────────────────────────────────────────────────
class FeedbackRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    page_url: str | None = None
    feedback_type: str = Field(default="general", pattern=r"^(general|suggestion|bug|question)$")
    honeypot: str = ""           # Should always be empty (bots fill it)
    opened_at: float = 0.0       # Timestamp when form opened (time-based check)


class FeedbackResponse(BaseModel):
    success: bool
    message: str
    beads_issue_id: str | None = None
    pii_redacted: bool = False


# ─── Spam prevention helpers ───────────────────────────────
def _check_honeypot(req: FeedbackRequest) -> str | None:
    if req.honeypot:
        return "Invalid submission."


def _check_timing(req: FeedbackRequest) -> str | None:
    if req.opened_at > 0:
        elapsed = time.time() - req.opened_at
        if elapsed < 3.0:
            return "Please take a moment to write your feedback."


def _check_rate_limit(ip: str) -> str | None:
    now = time.time()
    last = _recent_ips.get(ip, 0)
    if now - last < RATE_LIMIT_SECONDS:
        return "Please wait before submitting again."
    _recent_ips[ip] = now


def _check_min_length(message: str) -> str | None:
    if len(message.strip()) < 10:
        return "Please provide more detail (at least 10 characters)."


def _check_content_quality(message: str) -> str | None:
    words = message.split()
    real_words = [w for w in words if len(w) > 1]
    if len(real_words) < 3:
        return "Please write a more descriptive message."


# ─── BEADS issue file creation ─────────────────────────────
def _create_beads_issue(
    message: str,
    feedback_type: str,
    page_url: str | None,
    pii_types: list[str],
) -> str | None:
    """Write a BEADS .md file and return the issue ID, or None on failure."""
    try:
        BEADS_DIR.mkdir(parents=True, exist_ok=True)

        now = datetime.now(timezone.utc)
        slug = hashlib.sha256(f"{now.isoformat()}{message[:50]}".encode()).hexdigest()[:8]
        issue_id = f"{ISSUE_PREFIX}-{now.strftime('%Y%m%d')}-{slug}"
        filepath = BEADS_DIR / f"{issue_id}.md"

        type_map = {
            "bug": "Bug",
            "suggestion": "Enhancement",
            "question": "Question",
            "general": "Feedback",
        }
        category = type_map.get(feedback_type, "Feedback")

        pii_note = f"\nPII redacted: {', '.join(pii_types)}" if pii_types else ""

        content = f"""---
id: {issue_id}
type: {category}
source: web-feedback
status: triage
created: {now.strftime('%Y-%m-%dT%H:%M:%SZ')}
page: {page_url or 'unknown'}
---

# [{category}] User feedback from {page_url or 'unknown page'}

{message}

---
*Auto-created by BEADS feedback loop*{pii_note}
"""
        filepath.write_text(content)
        return issue_id
    except Exception:
        return None


# ─── Endpoint ──────────────────────────────────────────────
@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    body: FeedbackRequest,
    request: Request,
    db: asyncpg.Pool = Depends(get_db),
):
    # Layer 1: Honeypot
    if err := _check_honeypot(body):
        raise HTTPException(status_code=422, detail=err)

    # Layer 2: Time-based
    if err := _check_timing(body):
        raise HTTPException(status_code=422, detail=err)

    # Layer 3: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if err := _check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail=err)

    # Layer 4: Min length
    if err := _check_min_length(body.message):
        raise HTTPException(status_code=422, detail=err)

    # Layer 5: Content quality
    if err := _check_content_quality(body.message):
        raise HTTPException(status_code=422, detail=err)

    # PII redaction
    redacted_message, pii_types = redact_pii(body.message)

    # BEADS issue file
    beads_id = _create_beads_issue(
        redacted_message, body.feedback_type, body.page_url, pii_types
    )

    # Store in PostgreSQL
    user_agent = request.headers.get("user-agent", "")
    try:
        await db.execute(
            """
            INSERT INTO feedback (message, page_url, feedback_type, ip_address, user_agent, beads_issue_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            redacted_message,
            body.page_url,
            body.feedback_type,
            client_ip,
            user_agent,
            beads_id,
        )
    except Exception:
        # DB write failure should not block the user
        pass

    return FeedbackResponse(
        success=True,
        message="Thank you for your feedback!",
        beads_issue_id=beads_id,
        pii_redacted=len(pii_types) > 0,
    )
