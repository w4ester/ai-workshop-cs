# AI Workshop CS — Project Context

Single platform for Maryland AI-aligned CS education.
Deployed to: **aiworkshop.edinfinite.com**

## Stack

- **Frontend**: SvelteKit 5 + Tailwind 4 (static adapter → nginx)
- **Backend**: FastAPI + pgvector + Gemma embeddings
- **Agent**: PocketFlow 5-node browser agent (chat widget)
- **Workers**: Cloudflare Worker → Groq free tier
- **DB**: PostgreSQL 16 + pgvector
- **Deploy**: OrbStack demo-box, zero-downtime via `./scripts/deploy.sh`

## Key Data

- `data/crosswalk.json` — MSDE ↔ CSTA AI priorities mapping
- `data/csta-ai-priorities.json` — 60 AI learning outcomes, K-12
- `data/msde-standards.json` — Maryland CS standards

## Commands

```bash
# Frontend dev
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Deploy
./scripts/deploy.sh all       # Full deploy
./scripts/deploy.sh frontend  # Frontend only
./scripts/deploy.sh api       # API only

# Docker
docker compose up -d           # Start all services
docker compose logs -f api     # Watch API logs
```

## Architecture Rules

1. This is the SINGLE folder for the platform — no sibling repos
2. Skills live in WF-AI-Platform (`.wf-ai/skills/`), not here
3. Local git commits only until explicitly asked to push
4. Deploy target is aiworkshop.edinfinite.com via OrbStack demo-box
