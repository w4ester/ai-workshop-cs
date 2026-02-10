/**
 * WebLLM Engine — Browser-based LLM inference
 * Loads a small model (Qwen2-0.5B or Phi-3.5-mini) via WebGPU
 * Used as a fallback when Groq/Ollama are unavailable
 */

let engine = null;
let isLoading = false;
let loadPromise = null;

/**
 * Initialize WebLLM engine (lazy — only loads when first called)
 * @param {function} onProgress - Progress callback: ({text, progress}) => void
 * @param {string} modelId - Model to load (default: small, fast model)
 * @returns {Promise<object>} The MLCEngine instance
 */
export async function initWebLLM(onProgress, modelId) {
	if (engine) return engine;
	if (isLoading) return loadPromise;

	isLoading = true;
	const selectedModel = modelId || 'Qwen2-0.5B-Instruct-q4f16_1-MLC';

	loadPromise = (async () => {
		try {
			const { CreateMLCEngine } = await import('https://esm.run/@mlc-ai/web-llm');

			engine = await CreateMLCEngine(selectedModel, {
				initProgressCallback: (progress) => {
					if (onProgress) {
						onProgress({
							text: progress.text || 'Loading model...',
							progress: progress.progress || 0
						});
					}
				}
			});

			isLoading = false;
			return engine;
		} catch (err) {
			isLoading = false;
			engine = null;
			throw err;
		}
	})();

	return loadPromise;
}

/**
 * Chat with the WebLLM engine
 * @param {Array} messages - OpenAI-format messages array
 * @param {object} options - temperature, max_tokens, etc.
 * @returns {Promise<string>} The assistant's response text
 */
export async function chat(messages, options = {}) {
	if (!engine) {
		throw new Error('WebLLM not initialized. Call initWebLLM() first.');
	}

	const response = await engine.chat.completions.create({
		messages,
		temperature: options.temperature || 0.7,
		max_tokens: options.maxTokens || 500,
		...options
	});

	return response.choices[0].message.content;
}

/**
 * Check if WebGPU is available in this browser
 */
export function isWebGPUAvailable() {
	return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/**
 * Get the current engine status
 */
export function getStatus() {
	return {
		ready: !!engine,
		loading: isLoading,
		webGPU: isWebGPUAvailable()
	};
}
