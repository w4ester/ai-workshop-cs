"""Gemma Embeddings via Ollama — generates vector embeddings for standards and lessons"""
import httpx
from config import OLLAMA_URL, OLLAMA_EMBED_MODEL


async def get_embedding(text: str) -> list[float]:
    """Generate an embedding vector for the given text using Ollama Gemma"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{OLLAMA_URL}/api/embeddings",
            json={
                "model": OLLAMA_EMBED_MODEL,
                "prompt": text
            },
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data["embedding"]


async def get_batch_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts"""
    embeddings = []
    for text in texts:
        emb = await get_embedding(text)
        embeddings.append(emb)
    return embeddings
