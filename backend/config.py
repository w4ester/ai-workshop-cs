"""Configuration — loaded from environment variables"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://workshop:workshop_dev@127.0.0.1:5432/ai_workshop"
)

# Ollama
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "gemma2:2b")
OLLAMA_TRANSLATE_MODEL = os.getenv("OLLAMA_TRANSLATE_MODEL", "gemma2:2b")

# API
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://aiworkshop.edinfinite.com,http://127.0.0.1:5173").split(",")
