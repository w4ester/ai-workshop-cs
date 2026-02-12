/**
 * Cloudflare Worker — Groq API Proxy + Feedback Endpoint
 *
 * Routes:
 *   GET  /health          → Service health + config check
 *   POST /llm             → Groq chat completions (model-validated, KV rate-limited)
 *   POST /feedback        → Passphrase-gated feedback → KV storage
 *   GET  /feedback/pull   → Retrieve pending feedback (passphrase-gated)
 *   POST /feedback/ack    → Acknowledge pulled feedback items
 *
 * Secrets (set via `wrangler secret put`):
 *   GROQ_API_KEY         — Groq API key
 *   FEEDBACK_PASSPHRASE  — The human-only feedback gate passphrase
 *
 * KV Namespaces:
 *   FEEDBACK_KV  — stores feedback as pending:{id} keys
 *   RATE_LIMITS  — per-IP RPM/RPD counters (auto-expiring)
 */

const LLM_API_BASE = 'https://api.groq.com/openai/v1';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders }
	});
}

// --- Client IP ---
function getClientIP(request) {
	return request.headers.get('CF-Connecting-IP') ||
		request.headers.get('X-Forwarded-For')?.split(',')[0] ||
		'unknown';
}

// --- KV-based Rate Limiting (persistent across Worker instances) ---
async function checkRateLimit(env, clientIP) {
	if (!env.RATE_LIMITS) {
		return { allowed: true, rpm: 0, rpd: 0 };
	}

	const now = new Date();
	const minute = now.toISOString().slice(0, 16); // "2026-02-11T17:30"
	const day = now.toISOString().slice(0, 10);     // "2026-02-11"

	const rpmKey = `rpm:${clientIP}:${minute}`;
	const rpdKey = `rpd:${clientIP}:${day}`;

	const rpmLimit = parseInt(env.RPM_LIMIT) || 25;
	const rpdLimit = parseInt(env.RPD_LIMIT) || 900;

	const [rpmCount, rpdCount] = await Promise.all([
		env.RATE_LIMITS.get(rpmKey).then(v => parseInt(v) || 0),
		env.RATE_LIMITS.get(rpdKey).then(v => parseInt(v) || 0),
	]);

	if (rpmCount >= rpmLimit) {
		return {
			allowed: false, rpm: rpmCount, rpd: rpdCount,
			message: `Rate limit exceeded (${rpmCount}/${rpmLimit} per minute). Please wait.`,
			retryAfter: 60
		};
	}

	if (rpdCount >= rpdLimit) {
		return {
			allowed: false, rpm: rpmCount, rpd: rpdCount,
			message: `Daily limit reached (${rpdCount}/${rpdLimit}). Try again tomorrow.`,
			retryAfter: 86400
		};
	}

	// Fire-and-forget KV writes for speed
	env.RATE_LIMITS.put(rpmKey, String(rpmCount + 1), { expirationTtl: 120 });
	env.RATE_LIMITS.put(rpdKey, String(rpdCount + 1), { expirationTtl: 90000 });

	return { allowed: true, rpm: rpmCount + 1, rpd: rpdCount + 1 };
}

// --- PII Redaction ---
const PII_PATTERNS = [
	{ name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, replace: '[EMAIL REDACTED]' },
	{ name: 'phone', pattern: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, replace: '[PHONE REDACTED]' },
	{ name: 'ssn', pattern: /\b[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{4}\b/g, replace: '[SSN REDACTED]' },
	{ name: 'card', pattern: /\b(?:[0-9]{4}[-\s]?){3}[0-9]{4}\b/g, replace: '[CARD REDACTED]' },
];

function redactPII(text) {
	let result = text;
	const redacted = [];
	for (const { name, pattern, replace } of PII_PATTERNS) {
		if (pattern.test(result)) {
			redacted.push(name);
			result = result.replace(pattern, replace);
		}
		pattern.lastIndex = 0;
	}
	return { text: result, redacted };
}

// --- Content Quality Check ---
function checkContentQuality(message) {
	if (!message || message.length < 10) return 'Message must be at least 10 characters';
	if (message.length > 2000) return 'Message must be under 2000 characters';
	const uniqueChars = new Set(message.toLowerCase().replace(/\s/g, '')).size;
	if (uniqueChars < 3) return 'Message appears to be spam';
	const words = message.trim().split(/\s+/);
	if (words.length < 2) return 'Please provide more detail';
	return null;
}

// --- Route: GET /health ---
function handleHealth(env) {
	return jsonResponse({
		status: 'ok',
		service: 'ai-workshop-groq-proxy',
		timestamp: new Date().toISOString(),
		models: (env.ALLOWED_MODELS || 'llama-3.3-70b-versatile').split(','),
		rateLimiting: env.RATE_LIMITS ? 'kv' : 'disabled',
		apiKeySet: !!env.GROQ_API_KEY
	});
}

// --- Route: POST /llm ---
async function handleLLM(request, env) {
	// Check API key configured
	if (!env.GROQ_API_KEY) {
		return jsonResponse({ error: 'Service not configured. Contact administrator.' }, 500);
	}

	// KV-based rate limiting
	const clientIP = getClientIP(request);
	const rateCheck = await checkRateLimit(env, clientIP);
	if (!rateCheck.allowed) {
		return jsonResponse(
			{ error: rateCheck.message, retry_after: rateCheck.retryAfter },
			429,
			{ 'Retry-After': String(rateCheck.retryAfter) }
		);
	}

	// Parse request
	let body;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
	}

	const { messages, model, temperature, max_tokens } = body;

	if (!messages || !Array.isArray(messages)) {
		return jsonResponse({ error: 'messages array required' }, 400);
	}

	// Model whitelist validation
	const allowedModels = (env.ALLOWED_MODELS || 'llama-3.3-70b-versatile').split(',').map(m => m.trim());
	const requestedModel = model || env.GROQ_MODEL || 'llama-3.3-70b-versatile';
	if (!allowedModels.includes(requestedModel)) {
		return jsonResponse({ error: `Model not available. Use one of: ${allowedModels.join(', ')}` }, 400);
	}

	// Forward to Groq
	const startTime = Date.now();

	try {
		const groqResponse = await fetch(`${LLM_API_BASE}/chat/completions`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.GROQ_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: requestedModel,
				messages,
				temperature: temperature || 0.7,
				max_tokens: max_tokens || parseInt(env.MAX_TOKENS || '500')
			})
		});

		const responseTime = Date.now() - startTime;
		let responseBody = await groqResponse.text();

		// Strip <think>...</think> blocks from thinking models (e.g. Qwen3)
		if (groqResponse.ok) {
			try {
				const parsed = JSON.parse(responseBody);
				if (parsed.choices) {
					for (const choice of parsed.choices) {
						if (choice.message?.content) {
							choice.message.content = choice.message.content
								.replace(/<think>[\s\S]*?<\/think>\s*/g, '')
								.trim();
						}
					}
					responseBody = JSON.stringify(parsed);
				}
			} catch { /* pass through unparseable responses */ }
		}

		return new Response(responseBody, {
			status: groqResponse.status,
			headers: {
				'Content-Type': 'application/json',
				'X-Response-Time': `${responseTime}ms`,
				'X-RateLimit-RPM': String(rateCheck.rpm),
				'X-RateLimit-RPD': String(rateCheck.rpd),
				...CORS_HEADERS
			}
		});
	} catch {
		return jsonResponse({ error: 'Service temporarily unavailable. Please try again.' }, 502);
	}
}

// --- Route: POST /feedback ---
async function handleFeedback(request, env) {
	const body = await request.json();
	const { message, feedback_type, page_url, passphrase, honeypot, opened_at } = body;

	if (honeypot) {
		return jsonResponse({ success: false, error: 'Invalid submission' }, 400);
	}

	if (opened_at) {
		const elapsed = Date.now() - opened_at;
		if (elapsed < 3000) {
			return jsonResponse({ success: false, error: 'Please take a moment before submitting' }, 400);
		}
	}

	if (!passphrase || passphrase !== env.FEEDBACK_PASSPHRASE) {
		return jsonResponse({ success: false, error: 'Invalid passphrase.' }, 403);
	}

	// Feedback uses its own rate limiter (in-memory is fine for low-volume feedback)
	const clientIP = getClientIP(request);

	const qualityError = checkContentQuality(message);
	if (qualityError) {
		return jsonResponse({ success: false, error: qualityError }, 400);
	}

	const { text: safeMessage, redacted: piiRedacted } = redactPII(message);

	const now = new Date();
	const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
	const randomPart = Math.random().toString(16).slice(2, 5);
	const beadsId = `fb${datePart}${randomPart}`;

	const feedbackTypeLabel = feedback_type || 'general';
	const beadsIssue = {
		id: beadsId,
		title: `Dogfood ${feedbackTypeLabel}: ${safeMessage.slice(0, 60)}${safeMessage.length > 60 ? '...' : ''}`,
		description: safeMessage,
		status: 'open',
		priority: 'P2',
		issue_type: 'feedback',
		created_at: now.toISOString(),
		tags: ['dogfood', 'feedback', feedbackTypeLabel],
		source: {
			type: 'dogfood-form',
			page_url: page_url || 'not specified',
			pii_redacted: piiRedacted
		}
	};

	try {
		await env.FEEDBACK_KV.put(
			`pending:${beadsId}`,
			JSON.stringify(beadsIssue),
			{ expirationTtl: 90 * 24 * 60 * 60 }
		);

		return jsonResponse({
			success: true,
			id: beadsId,
			message: 'Feedback received and tracked. Thank you!',
			pii_redacted: piiRedacted
		});
	} catch (err) {
		return jsonResponse({ success: false, error: 'Failed to store feedback.' }, 500);
	}
}

// --- Route: GET /feedback/pull ---
async function handleFeedbackPull(request, env) {
	const url = new URL(request.url);
	const passphrase = url.searchParams.get('passphrase');

	if (!passphrase || passphrase !== env.FEEDBACK_PASSPHRASE) {
		return jsonResponse({ success: false, error: 'Invalid passphrase' }, 403);
	}

	const listed = await env.FEEDBACK_KV.list({ prefix: 'pending:' });
	const items = [];

	for (const key of listed.keys) {
		const value = await env.FEEDBACK_KV.get(key.name, { type: 'json' });
		if (value) {
			items.push({ key: key.name, issue: value });
		}
	}

	return jsonResponse({ success: true, count: items.length, items });
}

// --- Route: POST /feedback/ack ---
async function handleFeedbackAck(request, env) {
	const body = await request.json();
	const { passphrase, keys } = body;

	if (!passphrase || passphrase !== env.FEEDBACK_PASSPHRASE) {
		return jsonResponse({ success: false, error: 'Invalid passphrase' }, 403);
	}

	if (!keys || !Array.isArray(keys) || keys.length === 0) {
		return jsonResponse({ success: false, error: 'keys array required' }, 400);
	}

	const acked = [];
	for (const key of keys) {
		if (!key.startsWith('pending:')) continue;

		const value = await env.FEEDBACK_KV.get(key);
		if (value) {
			const ackedKey = key.replace('pending:', 'acked:');
			await env.FEEDBACK_KV.put(ackedKey, value, { expirationTtl: 90 * 24 * 60 * 60 });
			await env.FEEDBACK_KV.delete(key);
			acked.push(key);
		}
	}

	return jsonResponse({ success: true, acked_count: acked.length, acked });
}

// --- Main Router ---
export default {
	async fetch(request, env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		const url = new URL(request.url);
		const path = url.pathname;

		try {
			// GET routes
			if (request.method === 'GET') {
				if (path === '/health' || path === '/') return handleHealth(env);
				if (path === '/feedback/pull') return await handleFeedbackPull(request, env);
				return jsonResponse({ error: 'Not found' }, 404);
			}

			// POST routes
			if (request.method === 'POST') {
				if (path === '/llm') return await handleLLM(request, env);
				if (path === '/feedback') return await handleFeedback(request, env);
				if (path === '/feedback/ack') return await handleFeedbackAck(request, env);
				return jsonResponse({ error: 'Not found' }, 404);
			}

			return jsonResponse({ error: 'Method not allowed' }, 405);
		} catch (err) {
			return jsonResponse({ error: err.message }, 500);
		}
	}
};
