import { Node } from '../index.js';

/**
 * FormatResponse — Converts LLM text to display-ready HTML
 */
export class FormatResponseNode extends Node {
	constructor() {
		super('FormatResponse');
	}

	prep(shared) {
		return { llmResult: shared.llmResult };
	}

	async run({ llmResult }) {
		const text = llmResult.response || '';

		// Safe markdown-ish conversion
		let html = text
			.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/\*([^*]+)\*/g, '<em>$1</em>')
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br>');

		html = '<p>' + html + '</p>';

		return { html, text, isError: false, backend: llmResult.backend };
	}

	post(shared, prepResult, runResult) {
		shared.formattedResponse = runResult;
		return 'default';
	}
}
