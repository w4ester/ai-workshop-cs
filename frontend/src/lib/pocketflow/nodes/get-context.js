import { Node } from '../index.js';

/**
 * GetContext — Gathers user context for the AI agent
 */
export class GetContextNode extends Node {
	constructor() {
		super('GetContext');
	}

	prep(shared) {
		return {
			currentPage: shared.currentPage || '/',
			userMessage: shared.userMessage || '',
			history: shared.history || []
		};
	}

	async run({ currentPage, userMessage, history }) {
		const pageContexts = {
			'/': 'Home page — overview of the AI Workshop CS platform',
			'/playground': 'Interactive Python playground with AI-themed coding activities',
			'/standards': 'Standards crosswalk browser — MSDE CS Standards vs CSTA AI Priorities',
			'/lessons': 'AI lesson builder — generate dual-aligned lessons',
			'/about': 'About the project, team, and Maryland CS education context'
		};

		return {
			pageContext: pageContexts[currentPage] || 'Unknown page',
			currentPage,
			userMessage,
			conversationLength: history.length
		};
	}

	post(shared, prepResult, runResult) {
		shared.context = runResult;
		return 'default';
	}
}
