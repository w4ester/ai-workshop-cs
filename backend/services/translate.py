"""Gemma Translate via Ollama — translates lesson content for multilingual access"""
import httpx
from config import OLLAMA_URL, OLLAMA_TRANSLATE_MODEL


async def translate_text(text: str, target_language: str) -> str:
    """Translate text to the target language using Ollama Gemma"""
    prompt = f"Translate the following text to {target_language}. Only output the translation, nothing else.\n\nText: {text}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_TRANSLATE_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=60.0
        )
        response.raise_for_status()
        data = response.json()
        return data["response"]
