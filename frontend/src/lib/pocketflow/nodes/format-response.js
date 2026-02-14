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
			// Escape HTML entities first to prevent XSS
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			// Code blocks (before other transforms)
			.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
			// Inline code
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			// Bold
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			// Italic (but not inside words)
			.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>')
			// Headings (### h3, ## h2, # h1)
			.replace(/^### (.+)$/gm, '<h4>$1</h4>')
			.replace(/^## (.+)$/gm, '<h3>$1</h3>')
			.replace(/^# (.+)$/gm, '<h3>$1</h3>');

		// Convert list blocks: consecutive lines starting with - or numbered
		html = html.replace(/((?:^[ \t]*[-•] .+\n?)+)/gm, (block) => {
			const items = block.trim().split('\n')
				.map(line => '<li>' + line.replace(/^[ \t]*[-•] /, '') + '</li>')
				.join('');
			return '<ul>' + items + '</ul>';
		});
		html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
			const items = block.trim().split('\n')
				.map(line => '<li>' + line.replace(/^\d+\. /, '') + '</li>')
				.join('');
			return '<ol>' + items + '</ol>';
		});

		// Paragraphs (double newline) and line breaks
		html = html
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br>');

		html = '<p>' + html + '</p>';

		// Clean up empty paragraphs and bad nesting
		html = html
			.replace(/<p>\s*<\/p>/g, '')
			.replace(/<p>(<(?:ul|ol|h[34]|pre))/g, '$1')
			.replace(/(<\/(?:ul|ol|h[34]|pre)>)<\/p>/g, '$1');

		return { html, text, isError: false, backend: llmResult.backend };
	}

	post(shared, prepResult, runResult) {
		shared.formattedResponse = runResult;
		return 'default';
	}
}
