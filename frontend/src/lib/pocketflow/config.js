/**
 * PocketFlow Configuration
 *
 * Single source of truth for external service URLs and settings.
 * Update these values after deploying your Cloudflare Worker.
 */

export const POCKETFLOW_CONFIG = {
	/**
	 * Groq Proxy Worker URL
	 * Deploy workers/src/index.js via `wrangler deploy` and update this URL
	 *
	 * Example: 'https://ai-workshop-groq-proxy.your-subdomain.workers.dev'
	 */
	groqWorkerUrl: 'https://ai-workshop-groq-proxy.howdy-1bc.workers.dev',

	/**
	 * Default LLM model
	 */
	groqModel: 'llama-3.3-70b-versatile',

	/**
	 * Default backend: 'groq' | 'webllm' | 'ollama'
	 */
	defaultBackend: 'groq',

	/**
	 * LLM generation settings
	 */
	temperature: 0.7,
	maxTokens: 500,

	/**
	 * Ollama URL (for local dev with --profile local-llm)
	 */
	ollamaUrl: 'http://127.0.0.1:11434/api/chat',
	ollamaModel: 'gemma2:2b'
};
