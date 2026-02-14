# ONE-TIME TRANSITION CONTEXT — Read then delete this file

This project was consolidated from two separate repos into one:

- `msde-csta` (deleted) → crosswalk data, PRD, prototype HTML, lesson docs
- `ai-workshop-cs` (THIS repo) → full-stack platform, now the single source of truth

## What happened:
1. All unique content from msde-csta was merged here (docs/, screenshots/)
2. The standalone index.html prototype is replaced by the SvelteKit app
3. Chat.svelte dark mode font colors were fixed
4. Two skills were created in WF-AI-Platform: `ollama-setup` and `file-crud`
5. Lesson 01 (building your first AI skill with Ollama) was added to docs/

## This is now the ONLY folder for this platform.

## Project architecture:
```
ai-workshop-cs/
├── frontend/          SvelteKit 5 + Tailwind (static adapter → nginx)
│   └── src/lib/
│       ├── components/  Chat.svelte, CodeEditor.svelte
│       ├── pocketflow/  5-node browser agent (GetContext→BuildPrompt→CallLLM→FormatResponse→ErrorHandler)
│       ├── webllm/      Browser-side LLM fallback
│       └── stores/      Chat bridge (reactive state)
├── backend/           FastAPI + pgvector + embeddings
├── workers/           Cloudflare Worker (Groq proxy)
├── data/              crosswalk.json, csta-ai-priorities.json, msde-standards.json
├── docs/              PDFs, PRD, lessons, screenshots, landing page
├── scripts/           deploy.sh (OrbStack → demo-box, zero-downtime)
└── docker-compose.yml postgres + api + frontend + optional ollama
```

## Deployment target: aiworkshop.edinfinite.com
- Deploy via: `./scripts/deploy.sh all`
- Frontend: SvelteKit static → nginx (port 4793)
- API: FastAPI (port 9793)
- DB: pgvector/pg16 (port 5493)
- CORS: configured for aiworkshop.edinfinite.com

## After reading this, delete this file:
```bash
rm .claude/transition-context.md
```
This file exists only to orient the first session after the merge.
