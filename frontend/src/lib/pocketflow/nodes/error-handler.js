import { Node } from '../index.js';

/**
 * ErrorHandler — Provides graceful fallback when LLM calls fail
 */
export class ErrorHandlerNode extends Node {
	constructor() {
		super('ErrorHandler');
	}

	prep(shared) {
		return {
			error: shared.error || shared.llmResult?.error,
			userMessage: shared.userMessage || ''
		};
	}

	async run({ error, userMessage }) {
		const lowerQ = userMessage.toLowerCase();

		const fallbacks = {
			'standard': 'Maryland adopted K-12 CS Standards in 2018. They cover Computing Systems, Networks, Data Analysis, Algorithms & Programming, and Impacts of Computing.',
			'csta': 'The CSTA AI Learning Priorities define 5 categories: A) Humans & AI, B) Representation & Reasoning, C) Machine Learning, D) Ethical AI System Design, E) Societal Impacts of AI.',
			'lesson': 'To create an AI-aligned lesson, pick a grade band and CSTA AI Priority category. The agent will map it to existing MSDE standards.',
			'playground': 'The Playground lets you run Python code right in your browser. Each tab maps to a CSTA AI Priority category.',
			'msde': 'MSDE stands for Maryland State Department of Education. Their 2018 CS standards have only one AI mention: 12.AP.A.01.'
		};

		for (const [keyword, response] of Object.entries(fallbacks)) {
			if (lowerQ.includes(keyword)) {
				return { html: `<p>${response}</p>`, text: response, isError: false, backend: 'fallback' };
			}
		}

		const errorMsg = error?.message || 'Something went wrong';
		return {
			html: `<p>I'm having trouble connecting right now. Try again in a moment, or explore the site directly!</p>`,
			text: errorMsg,
			isError: true,
			backend: 'error'
		};
	}

	post(shared, prepResult, runResult) {
		shared.formattedResponse = runResult;
		return 'done';
	}
}
