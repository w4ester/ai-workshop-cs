<script>
	import '../app.css';
	import Chat from '$lib/components/Chat.svelte';

	let { children } = $props();
	let mobileMenuOpen = $state(false);
</script>

<div class="min-h-screen bg-gray-50 dark:bg-slate-900">
	<nav class="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between h-14">
				<a href="/" class="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
					<span class="text-blue-600">AI</span> Workshop CS
				</a>
				<!-- Desktop nav -->
				<div class="hidden sm:flex items-center gap-4 text-sm">
					<a href="/playground" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Playground</a>
					<a href="/standards" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Standards</a>
					<a href="/lessons" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Lessons</a>
					<a href="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">About</a>
				</div>
				<!-- Mobile hamburger -->
				<button
					class="sm:hidden p-2 -mr-2 text-gray-600 dark:text-gray-300"
					onclick={() => mobileMenuOpen = !mobileMenuOpen}
					aria-label="Toggle navigation menu"
					aria-expanded={mobileMenuOpen}
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						{#if mobileMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			</div>
		</div>
		<!-- Mobile menu panel -->
		{#if mobileMenuOpen}
			<div class="sm:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 space-y-1">
				<a href="/playground" onclick={() => mobileMenuOpen = false} class="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Playground</a>
				<a href="/standards" onclick={() => mobileMenuOpen = false} class="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Standards</a>
				<a href="/lessons" onclick={() => mobileMenuOpen = false} class="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Lessons</a>
				<a href="/about" onclick={() => mobileMenuOpen = false} class="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">About</a>
			</div>
		{/if}
	</nav>

	<main>
		{@render children()}
	</main>

	<Chat />
</div>
