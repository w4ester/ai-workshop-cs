/**
 * Cloudflare Worker — Groq API Proxy + Feedback Endpoint
 *
 * Routes:
 *   POST /llm      → Groq chat completions (Qwen model)
 *   POST /feedback  → Passphrase-gated feedback → GitHub Issue
 *
 * Secrets (set via `wrangler secret put`):
 *   GROQ_API_KEY         — Groq API key
 *   GITHUB_TOKEN         — GitHub PAT with repo:issues scope
 *   FEEDBACK_PASSPHRASE  — The human-only feedback gate passphrase
 */

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip) {
	const now = Date.now();
	const key = `feedback:${ip}`;
	const record = rateLimits.get(key);

	if (!record || (now - record.start) > RATE_LIMIT_WINDOW) {
		rateLimits.set(key, { start: now, count: 1 });
		return true;
	}
	if (record.count >= RATE_LIMIT_MAX) {
		return false;
	}
	record.count++;
	return true;
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

// --- Route: /feedback ---
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

	// 4. Rate limiting
	const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
	if (!checkRateLimit(clientIP)) {
		return jsonResponse({ success: false, error: 'Rate limit exceeded. Max 5 feedback per hour.' }, 429);
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

	// 8. Create GitHub Issue
	const feedbackTypeLabel = feedback_type || 'general';
	const issueTitle = `Dogfood ${feedbackTypeLabel}: ${safeMessage.slice(0, 60)}${safeMessage.length > 60 ? '...' : ''}`;
	const issueBody = [
		'## Feedback Details',
		'',
		'| Field | Value |',
		'|-------|-------|',
		`| BEADS ID | \`${beadsId}\` |`,
		`| Type | ${feedbackTypeLabel} |`,
		`| Page | ${page_url || 'not specified'} |`,
		`| Submitted | ${now.toISOString()} |`,
		piiRedacted.length > 0 ? `| PII Redacted | ${piiRedacted.join(', ')} |` : '',
		'',
		'---',
		'',
		'## User Message',
		'',
		safeMessage,
		'',
		'---',
		'',
		'## Triage Checklist',
		'',
		'- [ ] Categorize: actionable bug / feature request / question / praise',
		'- [ ] Assess priority (P0-P3)',
		'- [ ] Link to existing issue if duplicate',
		'- [ ] Create implementation issue if actionable',
		'',
		'---',
		`*Auto-generated from dogfood feedback. BEADS ID: ${beadsId}. w4ester & ai orchestration.*`
	].filter(Boolean).join('\n');

	const labels = ['dogfood', 'feedback', feedbackTypeLabel];

	try {
		const ghResponse = await fetch('https://api.github.com/repos/w4ester/ai-workshop-cs/issues', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
				'Accept': 'application/vnd.github+json',
				'User-Agent': 'ai-workshop-cs-feedback',
				'X-GitHub-Api-Version': '2022-11-28'
			},
			body: JSON.stringify({
				title: issueTitle,
				body: issueBody,
				labels
			})
		});

		if (!ghResponse.ok) {
			const errText = await ghResponse.text();
			console.error('GitHub Issue creation failed:', errText);
			// Still return success to user — we don't expose GitHub errors
			return jsonResponse({
				success: true,
				id: beadsId,
				message: 'Feedback received. Thank you!',
				pii_redacted: piiRedacted,
				note: 'Issue tracking temporarily unavailable — feedback logged.'
			});
		}

		const ghData = await ghResponse.json();

		return jsonResponse({
			success: true,
			id: beadsId,
			message: 'Feedback received and tracked. Thank you!',
			pii_redacted: piiRedacted,
			issue_url: ghData.html_url
		});

	} catch (err) {
		return jsonResponse({
			success: true,
			id: beadsId,
			message: 'Feedback received. Thank you!',
			pii_redacted: piiRedacted
		});
	}
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

		if (request.method !== 'POST') {
			return jsonResponse({ error: 'Method not allowed' }, 405);
		}

		const url = new URL(request.url);
		const path = url.pathname;

		try {
			if (path === '/feedback') {
				return await handleFeedback(request, env);
			}
			if (path === '/llm' || path === '/') {
				return await handleLLM(request, env);
			}
			return jsonResponse({ error: 'Not found' }, 404);
		} catch (err) {
			return jsonResponse({ error: err.message }, 500);
		}
	}
};
