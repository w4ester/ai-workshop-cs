import { Node } from '../index.js';

/**
 * CallLLM — Routes to the appropriate LLM backend
 * Supports: WebLLM (browser), Groq (via CF Worker), Ollama (local)
 */
export class CallLLMNode extends Node {
	constructor() {
		super('CallLLM');
	}

	prep(shared) {
		return {
			messages: shared.messages,
			backend: shared.backend || 'groq',
			config: shared.llmConfig || {}
		};
	}

	async run({ messages, backend, config }) {
		switch (backend) {
			case 'webllm':
				return await this.callWebLLM(messages, config);
			case 'groq':
				return await this.callGroq(messages, config);
			case 'ollama':
				return await this.callOllama(messages, config);
			default:
				throw new Error(`Unknown backend: ${backend}`);
		}
	}

	async callWebLLM(messages, config) {
		const engine = config.webllmEngine;
		if (!engine) {
			throw new Error('WebLLM engine not initialized. Call initWebLLM() first.');
		}
		const response = await engine.chat.completions.create({
			messages,
			temperature: config.temperature || 0.7,
			max_tokens: config.maxTokens || 500
		});
		return {
			success: true,
			response: response.choices[0].message.content,
			backend: 'webllm'
		};
	}

	async callGroq(messages, config) {
		const workerUrl = config.groqWorkerUrl || '/api/llm';
		const res = await fetch(workerUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages,
				model: config.groqModel || 'qwen-qwq-32b',
				temperature: config.temperature || 0.7,
				max_tokens: config.maxTokens || 500
			})
		});
		if (!res.ok) {
			const errText = await res.text();
			throw new Error(`Groq API error: ${res.status} - ${errText}`);
		}
		const data = await res.json();
		return {
			success: true,
			response: data.choices[0].message.content,
			backend: 'groq'
		};
	}

	async callOllama(messages, config) {
		const ollamaUrl = config.ollamaUrl || 'http://127.0.0.1:11434/api/chat';
		const res = await fetch(ollamaUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: config.ollamaModel || 'gemma2:2b',
				messages,
				stream: false
			})
		});
		if (!res.ok) {
			throw new Error(`Ollama error: ${res.status}`);
		}
		const data = await res.json();
		return {
			success: true,
			response: data.message.content,
			backend: 'ollama'
		};
	}

	post(shared, prepResult, runResult) {
		shared.llmResult = runResult;
		return runResult.success ? 'default' : 'error';
	}
}
