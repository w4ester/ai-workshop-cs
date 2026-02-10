import { Node } from '../index.js';

/**
 * BuildPrompt — Constructs the system + user prompt for the LLM
 */
export class BuildPromptNode extends Node {
	constructor() {
		super('BuildPrompt');
	}

	prep(shared) {
		return {
			context: shared.context,
			history: shared.history || [],
			userMessage: shared.userMessage
		};
	}

	async run({ context, history, userMessage }) {
		const systemPrompt = `You are the AI Workshop CS assistant — a helpful guide for Maryland CS educators and students exploring AI-aligned computer science education.

CURRENT CONTEXT:
- User is on: ${context.currentPage} (${context.pageContext})
- Conversation length: ${context.conversationLength} messages

YOUR ROLE:
- Help navigate the site and explain features
- Answer questions about MSDE CS Standards, CSTA AI Priorities, and their alignment
- Guide teachers through creating AI-aligned lessons
- Help students understand AI concepts through the interactive playground
- Be encouraging, clear, and education-focused

KEY KNOWLEDGE:
- Maryland has 2018 CS standards with only 1 AI mention (12.AP.A.01)
- CSTA AI Priorities (2025) define 5 categories: Humans & AI, Representation & Reasoning, Machine Learning, Ethical AI, Societal Impacts
- SB0980 (2024) mandates AI in MD CS standards
- The platform bridges this gap with AI-aligned lesson generation

STYLE:
- Keep responses concise (2-4 sentences for simple questions)
- Use examples when explaining concepts
- Suggest next actions ("Try the Playground", "Check the Standards page")
- If asked about code, provide Python examples students can run`;

		const messages = [{ role: 'system', content: systemPrompt }];

		const recentHistory = history.slice(-10);
		for (const msg of recentHistory) {
			messages.push(msg);
		}
		messages.push({ role: 'user', content: userMessage });

		return { messages };
	}

	post(shared, prepResult, runResult) {
		shared.messages = runResult.messages;
		return 'default';
	}
}
