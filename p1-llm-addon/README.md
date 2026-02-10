# P1: LLM Add-Ons

## Scope

Wire up the AI backends that power the lesson builder agent and site navigation assistant.

## Components

### 1. PocketFlow Agent (Browser-Side)

**Location:** `frontend/src/lib/pocketflow/`

5-node agent flow:
```
GetContext → BuildPrompt → CallLLM → FormatResponse
                                ↓ (error)
                           ErrorHandler
```

**Status:** Scaffolded. Nodes implemented. Flow wired in Chat.svelte.

**TODO:**
- [ ] Test full flow end-to-end with Groq backend
- [ ] Add streaming response support (SSE from worker)
- [ ] Implement lesson generation flow (separate from chat)
- [ ] Add context from current page content (standards, crosswalk data)
- [ ] Build navigation suggestions node

### 2. WebLLM (Browser-Side Fallback)

**Location:** `frontend/src/lib/webllm/`

**Purpose:** Offline-capable AI assistant when Groq/internet unavailable.

**Status:** Engine wrapper scaffolded.

**TODO:**
- [ ] Test Qwen2-0.5B model loading and inference
- [ ] Add WebGPU detection and graceful fallback
- [ ] Implement model download progress UI
- [ ] Connect to PocketFlow as alternative backend
- [ ] Test on Chromebooks (WebGPU support varies)

### 3. Groq via Cloudflare Worker

**Location:** `workers/`

**Purpose:** Free-tier LLM inference for the primary chat and lesson generation.

**Status:** Worker scaffolded with Groq proxy, CORS, error handling.

**TODO:**
- [ ] Set Groq API key: `cd workers && npx wrangler secret put GROQ_API_KEY`
- [ ] Deploy worker: `npx wrangler deploy`
- [ ] Add rate limiting (per-IP, per-minute)
- [ ] Add request validation and sanitization
- [ ] Test with qwen-qwq-32b model
- [ ] Configure frontend to use worker URL

## Architecture Decision: Backend Priority

1. **Groq (via CF Worker)** — Primary. Fast, free tier, reliable.
2. **Ollama (local)** — Development + teachers with local setup.
3. **WebLLM (browser)** — Fallback for offline/restricted networks.

The PocketFlow `CallLLMNode` handles the routing between these three backends transparently.
