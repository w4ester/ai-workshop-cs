<script>
	/**
	 * Chat — Floating chat widget powered by PocketFlow agent
	 * Follows chat-design-best-practices: minimal chrome, asymmetric styling
	 */
	import { Flow } from '$lib/pocketflow/index.js';
	import { POCKETFLOW_CONFIG } from '$lib/pocketflow/config.js';
	import { GetContextNode } from '$lib/pocketflow/nodes/get-context.js';
	import { BuildPromptNode } from '$lib/pocketflow/nodes/build-prompt.js';
	import { CallLLMNode } from '$lib/pocketflow/nodes/call-llm.js';
	import { FormatResponseNode } from '$lib/pocketflow/nodes/format-response.js';
	import { ErrorHandlerNode } from '$lib/pocketflow/nodes/error-handler.js';
	import { chatBridge, consumeMessage } from '$lib/stores/chat-bridge.svelte.js';
	import { untrack } from 'svelte';

	let isOpen = $state(false);
	let messages = $state([]);
	let inputText = $state('');
	let isThinking = $state(false);

	// Build the PocketFlow agent
	const getContext = new GetContextNode();
	const buildPrompt = new BuildPromptNode();
	const callLLM = new CallLLMNode();
	const formatResponse = new FormatResponseNode();
	const errorHandler = new ErrorHandlerNode();

	getContext.on('default', buildPrompt);
	buildPrompt.on('default', callLLM);
	callLLM.on('default', formatResponse);
	callLLM.on('error', errorHandler);

	const agentFlow = new Flow('ChatAgent').start(getContext);

	async function sendMessage() {
		const text = inputText.trim();
		if (!text || isThinking) return;

		// Add user message
		messages = [...messages, { role: 'user', content: text }];
		inputText = '';
		isThinking = true;

		try {
			const shared = {
				userMessage: text,
				history: messages.slice(0, -1),
				currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
				backend: POCKETFLOW_CONFIG.defaultBackend,
				llmConfig: {}
			};

			const result = await agentFlow.process(shared);
			const response = result.formattedResponse;

			messages = [...messages, {
				role: 'assistant',
				content: response?.text || 'No response',
				html: response?.html || ''
			}];
		} catch (err) {
			messages = [...messages, {
				role: 'assistant',
				content: 'Something went wrong. Try again!',
				html: '<p>Something went wrong. Try again!</p>'
			}];
		}

		isThinking = false;
	}

	// Watch chat-bridge for programmatic messages from other pages
	$effect(() => {
		if (chatBridge.shouldOpen) {
			isOpen = true;
			const msg = consumeMessage();
			if (msg) {
				untrack(() => {
					inputText = msg;
					sendMessage();
				});
			}
		}
	});

	function handleKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<!-- Floating Action Button -->
<button
	class="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 hover:scale-105 transition-all flex items-center justify-center"
	onclick={toggle}
	aria-label="Toggle chat assistant"
>
	{#if isOpen}
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	{:else}
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
		</svg>
	{/if}
</button>

<!-- Chat Panel -->
{#if isOpen}
<div class="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 h-[calc(100dvh-6rem)] sm:h-[520px] max-h-[520px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
	<!-- Header -->
	<div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
		<div class="font-bold text-sm text-gray-900 dark:text-white">AI Workshop Assistant</div>
		<div class="text-xs text-gray-500 dark:text-gray-400">Ask about standards, lessons, or the playground</div>
	</div>

	<!-- Messages -->
	<div class="flex-1 overflow-y-auto px-4 py-4 space-y-4" role="log" aria-live="polite">
		{#if messages.length === 0}
			<div class="text-center text-gray-400 text-sm py-8">
				<p class="mb-2">Hi! I'm the AI Workshop assistant.</p>
				<p>Ask me about MSDE standards, CSTA AI Priorities, or how to create a lesson.</p>
			</div>
		{/if}

		{#each messages as msg}
			{#if msg.role === 'user'}
				<div class="flex justify-end">
					<div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl px-4 py-2 max-w-[85%] text-sm text-gray-900 dark:text-blue-100">
						{msg.content}
					</div>
				</div>
			{:else}
				<div class="chat-markdown text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
					{@html msg.html || msg.content}
				</div>
			{/if}
		{/each}

		{#if isThinking}
			<div class="text-blue-500 text-lg animate-pulse">&#10042;</div>
		{/if}
	</div>

	<!-- Composer -->
	<div class="border-t border-gray-200 dark:border-slate-700 px-3 py-2 flex gap-2 bg-white dark:bg-slate-800">
		<textarea
			bind:value={inputText}
			onkeydown={handleKeydown}
			placeholder="Ask about standards, lessons..."
			rows="1"
			aria-label="Chat message"
			class="flex-1 resize-none border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-400 transition-colors"
		></textarea>
		<button
			onclick={sendMessage}
			disabled={isThinking || !inputText.trim()}
			class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			Send
		</button>
	</div>
</div>
{/if}

<style>
	/* Scoped styles for rendered markdown inside chat */
	.chat-markdown :global(p) {
		margin-bottom: 0.5rem;
	}
	.chat-markdown :global(p:last-child) {
		margin-bottom: 0;
	}
	.chat-markdown :global(strong) {
		font-weight: 700;
	}
	.chat-markdown :global(h3),
	.chat-markdown :global(h4) {
		font-weight: 700;
		font-size: 0.875rem;
		margin-top: 0.75rem;
		margin-bottom: 0.25rem;
	}
	.chat-markdown :global(ul),
	.chat-markdown :global(ol) {
		margin: 0.25rem 0 0.5rem 1.25rem;
	}
	.chat-markdown :global(ul) {
		list-style-type: disc;
	}
	.chat-markdown :global(ol) {
		list-style-type: decimal;
	}
	.chat-markdown :global(li) {
		margin-bottom: 0.125rem;
	}
	.chat-markdown :global(pre) {
		background: #1e293b;
		color: #e2e8f0;
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin: 0.5rem 0;
		overflow-x: auto;
		font-size: 0.75rem;
		line-height: 1.5;
	}
	.chat-markdown :global(code) {
		background: #f1f5f9;
		color: #0f172a;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.8em;
	}
	:global(.dark) .chat-markdown :global(code) {
		background: #334155;
		color: #e2e8f0;
	}
	.chat-markdown :global(pre code) {
		background: none;
		color: inherit;
		padding: 0;
	}
</style>
