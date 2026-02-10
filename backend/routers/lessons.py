"""Lessons API — Generate and retrieve AI-aligned lessons"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class LessonRequest(BaseModel):
    grade_band: str  # "K-2", "3-5", "6-8", "9-12"
    ai_category: Optional[str] = None  # "A" through "E" or None for auto-suggest
    duration_minutes: int = 45
    context: Optional[str] = None  # What teacher already covers
    output_format: str = "markdown"  # markdown, html, json


@router.post("/generate")
async def generate_lesson(request: LessonRequest):
    """Generate a new AI-aligned lesson via the agent"""
    # TODO: Wire to agent pipeline — Phase 1
    return {
        "status": "pending",
        "message": "Lesson generation agent not yet connected — Phase 1",
        "request": request.model_dump()
    }


@router.get("/")
async def list_lessons():
    """List previously generated lessons"""
    return {"lessons": [], "message": "Lesson storage not yet implemented — Phase 2"}
