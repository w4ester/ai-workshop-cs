<script>
	import { submitFeedback } from '$lib/api.js';

	let { open = $bindable(false) } = $props();

	const TYPES = [
		{ value: 'general', label: 'General', icon: '💬' },
		{ value: 'suggestion', label: 'Suggestion', icon: '💡' },
		{ value: 'bug', label: 'Bug Report', icon: '🐛' },
		{ value: 'question', label: 'Question', icon: '❓' },
	];

	let feedbackType = $state('general');
	let message = $state('');
	let honeypot = $state('');
	let openedAt = $state(0);
	let submitting = $state(false);
	let error = $state('');
	let success = $state(false);
	let piiRedacted = $state(false);

	$effect(() => {
		if (open) {
			openedAt = Date.now() / 1000;
			// Reset on re-open
			message = '';
			error = '';
			success = false;
			piiRedacted = false;
			feedbackType = 'general';
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();
		if (submitting || !message.trim()) return;

		submitting = true;
		error = '';

		try {
			const res = await submitFeedback({
				message: message.trim(),
				page_url: typeof window !== 'undefined' ? window.location.pathname : '',
				feedback_type: feedbackType,
				honeypot,
				opened_at: openedAt,
			});
			success = true;
			piiRedacted = res.pii_redacted || false;
		} catch (err) {
			error = err.message || 'Failed to submit feedback.';
		} finally {
			submitting = false;
		}
	}

	function handleClose() {
		open = false;
	}

	function handleBackdrop(e) {
		if (e.target === e.currentTarget) handleClose();
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') handleClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
<div
	class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
	onclick={handleBackdrop}
	role="dialog"
	aria-modal="true"
	aria-label="Send feedback"
	tabindex="-1"
>
	<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
		<!-- Header -->
		<div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
			<h2 class="text-lg font-bold text-gray-900 dark:text-white">Send Feedback</h2>
			<button
				onclick={handleClose}
				class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
				aria-label="Close feedback"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		{#if success}
			<!-- Success state -->
			<div class="px-5 py-8 text-center">
				<div class="text-4xl mb-3">✅</div>
				<h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Thank you!</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Your feedback has been recorded.</p>
				{#if piiRedacted}
					<p class="text-xs text-amber-600 dark:text-amber-400 mt-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
						Personal information was automatically removed before storage.
					</p>
				{/if}
				<button
					onclick={handleClose}
					class="mt-6 px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
				>
					Done
				</button>
			</div>
		{:else}
			<!-- Form -->
			<form onsubmit={handleSubmit} class="px-5 py-4 space-y-4">
				<!-- Honeypot (hidden from humans) -->
				<div class="absolute -left-[9999px]" aria-hidden="true">
					<label>
						Leave empty
						<input type="text" bind:value={honeypot} tabindex="-1" autocomplete="off" />
					</label>
				</div>

				<!-- Type selector -->
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
					<div class="grid grid-cols-4 gap-2">
						{#each TYPES as t}
							<button
								type="button"
								onclick={() => feedbackType = t.value}
								class="flex flex-col items-center gap-1 px-2 py-2.5 text-xs rounded-lg border transition-colors
									{feedbackType === t.value
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
										: 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500'}"
							>
								<span class="text-base">{t.icon}</span>
								{t.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Message -->
				<div>
					<label for="feedback-message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Message
					</label>
					<textarea
						id="feedback-message"
						bind:value={message}
						placeholder="What's on your mind? Share ideas, report issues, or ask questions..."
						rows="4"
						class="w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder-gray-400 dark:placeholder-gray-500 resize-none"
					></textarea>
				</div>

				<!-- Privacy notice -->
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Feedback is stored securely. Any personal information (emails, phone numbers) is automatically redacted before storage.
				</p>

				{#if error}
					<div class="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
						{error}
					</div>
				{/if}

				<!-- Submit -->
				<button
					type="submit"
					disabled={submitting || !message.trim()}
					class="w-full px-4 py-2.5 text-sm font-bold rounded-lg transition-colors bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if submitting}
						Sending...
					{:else}
						Send Feedback
					{/if}
				</button>
			</form>
		{/if}
	</div>
</div>
{/if}
