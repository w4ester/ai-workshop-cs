# AI Workshop CS — Maryland AI-Aligned Lesson Builder

A full-stack platform for Maryland CS educators to create, explore, and deliver AI-aligned lessons mapped to MSDE K-12 CS Standards and CSTA AI Learning Priorities.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  BROWSER (Student / Educator)                           │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │  SvelteKit + Tailwind│  │  PocketFlow Agent       │  │
│  │  (Vite)              │  │  ┌───────┐ ┌─────────┐  │  │
│  │  - Lesson Viewer     │  │  │WebLLM │ │Nav Agent│  │  │
│  │  - Code Playground   │  │  │(Qwen) │ │(5-node) │  │  │
│  │  - Standards Browser │  │  └───────┘ └─────────┘  │  │
│  └──────────┬───────────┘  └──────────┬──────────────┘  │
│             │                         │                  │
└─────────────┼─────────────────────────┼──────────────────┘
              │ API calls               │ (browser-only)
              ▼                         │
┌─────────────────────────┐             │
│  FastAPI Backend         │             │
│  - /api/lessons         │             │
│  - /api/standards       │             │
│  - /api/search (vector) │             │
│  - /api/translate       │             │
│                         │             │
│  ┌───────────────────┐  │             │
│  │  pgvector          │  │             │
│  │  (Gemma embeddings)│  │             │
│  └───────────────────┘  │             │
│  ┌───────────────────┐  │             │
│  │  Ollama            │  │             │
│  │  - gemma:embed     │  │             │
│  │  - gemma:translate │  │             │
│  └───────────────────┘  │             │
└─────────────────────────┘             │
                                        │
┌───────────────────────────────────────┘
│  Cloudflare Worker (LLM Proxy)
│  - Groq free tier → Qwen model
│  - Rate limiting
│  - API key management
└───────────────────────────────────────┘
```

## Quick Start

### Frontend (SvelteKit + Tailwind + Vite)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Database (pgvector)
```bash
docker compose up -d postgres
```

### Cloudflare Worker (Groq Proxy)
```bash
cd workers
npm install
npx wrangler dev --ip 127.0.0.1
```

## Project Structure

```
ai-workshop-cs/
├── frontend/               # SvelteKit + Tailwind + Vite
│   ├── src/
│   │   ├── lib/
│   │   │   ├── pocketflow/ # PocketFlow agent engine
│   │   │   ├── webllm/     # WebLLM browser inference
│   │   │   └── components/ # Svelte components
│   │   └── routes/         # SvelteKit pages
│   └── static/             # Static assets
├── backend/                # FastAPI
│   ├── services/           # Embeddings, translate, vectordb
│   ├── routers/            # API routes
│   └── models/             # Pydantic models
├── workers/                # Cloudflare Worker → Groq
├── docs/                   # PRD, index.html (GitHub Pages)
├── p1-llm-addon/           # P1: LLM integration planning
├── p2-specifics/           # P2: Vector DB + embeddings specifics
└── docker-compose.yml      # pgvector, ollama
```

## Priorities

| Priority | Scope | Status |
|----------|-------|--------|
| **P0** | Project scaffold, SvelteKit + Tailwind + Vite, FastAPI shell, GitHub Pages PRD | In Progress |
| **P1** | LLM add-ons — PocketFlow agent, WebLLM, Groq via CF Worker | Planned |
| **P2** | pgvector, Gemma embeddings (Ollama), Gemma translate, vector search | Planned |

## Standards

- **MSDE K-12 CS Standards (2018)** — Maryland's current CS curriculum framework
- **CSTA AI Learning Priorities (2025)** — 5 categories, ~60 AI outcomes for K-12
- **SB0980 (2024)** — Maryland legislation mandating AI in CS standards

## License

MIT
