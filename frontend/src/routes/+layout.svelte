<script>
	import '../app.css';
	import Chat from '$lib/components/Chat.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50 dark:bg-slate-900">
	<nav class="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between h-14">
				<a href="/" class="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
					<span class="text-blue-600">AI</span> Workshop CS
				</a>
				<div class="flex items-center gap-4 text-sm">
					<a href="/playground" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
						Playground
					</a>
					<a href="/standards" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
						Standards
					</a>
					<a href="/lessons" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
						Lessons
					</a>
					<a href="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
						About
					</a>
				</div>
			</div>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>

	<Chat />
</div>
