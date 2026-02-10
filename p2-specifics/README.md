# P2: Specifics — Vector DB + Embeddings + Translation

## Scope

Set up the data infrastructure that powers semantic search over standards, crosswalk mappings, and generated lessons.

## Components

### 1. pgvector (PostgreSQL + Vector Extension)

**Location:** `docker-compose.yml` → `postgres` service, `backend/init.sql`

**Purpose:** Store and search vector embeddings of standards, crosswalk entries, and lessons.

**Status:** Docker config and SQL schema created.

**TODO:**
- [ ] `docker compose up -d postgres` — start pgvector
- [ ] Verify init.sql runs on first boot
- [ ] Test vector operations: INSERT, cosine similarity search
- [ ] Tune IVFFlat index parameters for dataset size
- [ ] Wire asyncpg connection pool in FastAPI
- [ ] Implement `vectordb.py` search functions

### 2. Gemma Embeddings (via Ollama)

**Location:** `docker-compose.yml` → `ollama` service, `backend/services/embeddings.py`

**Purpose:** Convert standards text and lesson content into 768-dimensional vectors for semantic search.

**Status:** Service stub created. Ollama container configured.

**TODO:**
- [ ] `docker compose up -d ollama`
- [ ] `docker exec ai-workshop-ollama ollama pull gemma2:2b`
- [ ] Test embedding generation: `POST /api/embeddings`
- [ ] Benchmark embedding speed (per-document)
- [ ] Embed all MSDE standards (~180 entries)
- [ ] Embed all CSTA AI Priorities (~60 entries)
- [ ] Embed crosswalk bridge notes
- [ ] Build `/api/search` endpoint with real vector queries

### 3. Gemma Translate (via Ollama)

**Location:** `backend/services/translate.py`

**Purpose:** Translate lesson content for multilingual access (Spanish, etc.).

**Status:** Service stub created.

**TODO:**
- [ ] Test translation quality with Gemma 2B
- [ ] If quality insufficient, evaluate larger model or dedicated translation API
- [ ] Build `/api/translate` endpoint
- [ ] Add language selector to frontend
- [ ] Cache translations to avoid re-generation

## Data Pipeline

```
PDF Standards Documents
        │
        ▼
  Extract to JSON (Phase 1 task)
        │
        ▼
  Generate Embeddings (Gemma via Ollama)
        │
        ▼
  Store in pgvector
        │
        ▼
  Expose via /api/search (FastAPI)
        │
        ▼
  Frontend semantic search + agent RAG
```

## Infrastructure

| Service | Container | Port | Notes |
|---------|-----------|------|-------|
| PostgreSQL + pgvector | `ai-workshop-pgvector` | `127.0.0.1:5432` | Persistent volume |
| Ollama | `ai-workshop-ollama` | `127.0.0.1:11434` | Pull gemma2:2b on first run |

All ports bound to `127.0.0.1` (hardened localhost).
