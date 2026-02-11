/**
 * Cloudflare Worker — Groq API Proxy + Feedback Endpoint
 *
 * Routes:
 *   POST /llm            → Groq chat completions (Qwen model)
 *   POST /feedback        → Passphrase-gated feedback → KV storage
 *   GET  /feedback/pull   → Retrieve pending feedback (passphrase-gated)
 *   POST /feedback/ack    → Acknowledge pulled feedback items
 *
 * Secrets (set via `wrangler secret put`):
 *   GROQ_API_KEY         — Groq API key
 *   FEEDBACK_PASSPHRASE  — The human-only feedback gate passphrase
 *
 * KV Namespace:
 *   FEEDBACK_KV — stores feedback as pending:{id} keys
 */

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
	});
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
		pattern.lastIndex = 0; // reset regex state
	}
	return { text: result, redacted };
}

// --- Rate Limiting (in-memory, per-worker-instance) ---
const rateLimits = new Map();

function checkRateLimit(ip, env) {
	const maxPerMinute = parseInt(env.RATE_LIMIT_PER_MINUTE || '20');
	const now = Date.now();
	const key = `feedback:${ip}`;
	const record = rateLimits.get(key);

	if (!record || (now - record.start) > 60000) {
		rateLimits.set(key, { start: now, count: 1 });
		return { allowed: true, limit: maxPerMinute };
	}
	if (record.count >= maxPerMinute) {
		return { allowed: false, limit: maxPerMinute };
	}
	record.count++;
	return { allowed: true, limit: maxPerMinute };
}

// --- Content Quality Check ---
function checkContentQuality(message) {
	if (!message || message.length < 10) return 'Message must be at least 10 characters';
	if (message.length > 2000) return 'Message must be under 2000 characters';
	const uniqueChars = new Set(message.toLowerCase().replace(/\s/g, '')).size;
	if (uniqueChars < 3) return 'Message appears to be spam';
	const words = message.trim().split(/\s+/);
	if (words.length < 2) return 'Please provide more detail';
	return null; // passes
}

// --- Route: POST /feedback ---
async function handleFeedback(request, env) {
	const body = await request.json();
	const { message, feedback_type, page_url, passphrase, honeypot, opened_at } = body;

	// 1. Honeypot check (hidden field must be empty)
	if (honeypot) {
		return jsonResponse({ success: false, error: 'Invalid submission' }, 400);
	}

	// 2. Timing check (must wait 3+ seconds after opening form)
	if (opened_at) {
		const elapsed = Date.now() - opened_at;
		if (elapsed < 3000) {
			return jsonResponse({ success: false, error: 'Please take a moment before submitting' }, 400);
		}
	}

	// 3. Passphrase validation (server-side — the real gate)
	if (!passphrase || passphrase !== env.FEEDBACK_PASSPHRASE) {
		return jsonResponse({ success: false, error: 'Invalid passphrase. Only authorized reviewers can submit feedback.' }, 403);
	}

	// 4. Rate limiting (reads RATE_LIMIT_PER_MINUTE from env binding)
	const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
	const rateCheck = checkRateLimit(clientIP, env);
	if (!rateCheck.allowed) {
		return jsonResponse({ success: false, error: `Rate limit exceeded. Max ${rateCheck.limit} per minute.` }, 429);
	}

	// 5. Content quality
	const qualityError = checkContentQuality(message);
	if (qualityError) {
		return jsonResponse({ success: false, error: qualityError }, 400);
	}

	// 6. PII redaction
	const { text: safeMessage, redacted: piiRedacted } = redactPII(message);

	// 7. Generate BEADS issue ID
	const now = new Date();
	const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
	const randomPart = Math.random().toString(16).slice(2, 5);
	const beadsId = `fb${datePart}${randomPart}`;

	// 8. Build BEADS-compatible issue and store in KV
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
			{ expirationTtl: 90 * 24 * 60 * 60 } // 90-day TTL
		);

		return jsonResponse({
			success: true,
			id: beadsId,
			message: 'Feedback received and tracked. Thank you!',
			pii_redacted: piiRedacted
		});
	} catch (err) {
		console.error('KV write failed:', err.message);
		return jsonResponse({
			success: false,
			error: 'Failed to store feedback. Please try again.'
		}, 500);
	}
}

// --- Route: GET /feedback/pull ---
async function handleFeedbackPull(request, env) {
	const url = new URL(request.url);
	const passphrase = url.searchParams.get('passphrase');

	if (!passphrase || passphrase !== env.FEEDBACK_PASSPHRASE) {
		return jsonResponse({ success: false, error: 'Invalid passphrase' }, 403);
	}

	// List all pending: keys
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
		// Only process pending: keys
		if (!key.startsWith('pending:')) continue;

		const value = await env.FEEDBACK_KV.get(key);
		if (value) {
			const ackedKey = key.replace('pending:', 'acked:');
			await env.FEEDBACK_KV.put(ackedKey, value, {
				expirationTtl: 90 * 24 * 60 * 60
			});
			await env.FEEDBACK_KV.delete(key);
			acked.push(key);
		}
	}

	return jsonResponse({ success: true, acked_count: acked.length, acked });
}

// --- Route: /llm ---
async function handleLLM(request, env) {
	const body = await request.json();
	const { messages, model, temperature, max_tokens } = body;

	if (!messages || !Array.isArray(messages)) {
		return jsonResponse({ error: 'messages array required' }, 400);
	}

	const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.GROQ_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: model || env.GROQ_MODEL || 'qwen-qwq-32b',
			messages,
			temperature: temperature || 0.7,
			max_tokens: max_tokens || parseInt(env.MAX_TOKENS || '500')
		})
	});

	if (!groqResponse.ok) {
		const errText = await groqResponse.text();
		return jsonResponse({ error: `Groq API error: ${groqResponse.status}`, details: errText }, groqResponse.status);
	}

	return jsonResponse(await groqResponse.json());
}

// --- Main Router ---
export default {
	async fetch(request, env) {
		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}

		const url = new URL(request.url);
		const path = url.pathname;

		try {
			// GET routes
			if (request.method === 'GET') {
				if (path === '/feedback/pull') {
					return await handleFeedbackPull(request, env);
				}
				return jsonResponse({ error: 'Not found' }, 404);
			}

			// POST routes
			if (request.method === 'POST') {
				if (path === '/feedback') {
					return await handleFeedback(request, env);
				}
				if (path === '/feedback/ack') {
					return await handleFeedbackAck(request, env);
				}
				if (path === '/llm' || path === '/') {
					return await handleLLM(request, env);
				}
				return jsonResponse({ error: 'Not found' }, 404);
			}

			return jsonResponse({ error: 'Method not allowed' }, 405);
		} catch (err) {
			return jsonResponse({ error: err.message }, 500);
		}
	}
};
