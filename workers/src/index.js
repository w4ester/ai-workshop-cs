/**
 * Cloudflare Worker — Groq API Proxy
 * Proxies LLM requests to Groq's free tier (Qwen model)
 * Handles rate limiting and API key management
 */

export default {
	async fetch(request, env) {
		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400'
				}
			});
		}

		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: 'Method not allowed' }), {
				status: 405,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		try {
			const body = await request.json();
			const { messages, model, temperature, max_tokens } = body;

			if (!messages || !Array.isArray(messages)) {
				return new Response(JSON.stringify({ error: 'messages array required' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			// Call Groq API
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
				return new Response(JSON.stringify({
					error: `Groq API error: ${groqResponse.status}`,
					details: errText
				}), {
					status: groqResponse.status,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}

			const data = await groqResponse.json();

			return new Response(JSON.stringify(data), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});

		} catch (err) {
			return new Response(JSON.stringify({ error: err.message }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}
	}
};
