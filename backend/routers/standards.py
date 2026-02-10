"""Standards API — Browse MSDE and CSTA standards and their crosswalk"""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/msde")
async def list_msde_standards(
    grade_band: Optional[str] = Query(None, description="K-2, 3-5, 6-8, or 9-12"),
    concept: Optional[str] = Query(None, description="Computing Systems, Networks, etc.")
):
    """List MSDE K-12 CS Standards, optionally filtered"""
    # TODO: Load from pgvector/JSON once crosswalk is built
    return {"standards": [], "message": "Standards data loading — Phase 1"}


@router.get("/csta")
async def list_csta_priorities(
    category: Optional[str] = Query(None, description="A through E"),
    grade_band: Optional[str] = Query(None)
):
    """List CSTA AI Learning Priorities"""
    return {"priorities": [], "message": "CSTA data loading — Phase 1"}


@router.get("/crosswalk")
async def get_crosswalk(
    msde_code: Optional[str] = Query(None),
    csta_category: Optional[str] = Query(None),
    alignment: Optional[str] = Query(None, description="strong, partial, gap, extension")
):
    """Get the MSDE-to-CSTA crosswalk mappings"""
    return {"crosswalk": [], "message": "Crosswalk not yet generated — Phase 1"}
