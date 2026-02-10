"""Search API — Vector similarity search over standards and lessons"""
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/")
async def vector_search(
    q: str = Query(..., description="Natural language search query"),
    limit: int = Query(10, ge=1, le=50)
):
    """Semantic search across standards, crosswalk, and lessons using pgvector"""
    # TODO: Wire to pgvector + Gemma embeddings — Phase 2
    return {
        "query": q,
        "results": [],
        "message": "Vector search not yet connected — Phase 2 (pgvector + Gemma embeddings)"
    }
