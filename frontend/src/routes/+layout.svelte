<script>
	import '../app.css';
	import Chat from '$lib/components/Chat.svelte';

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	// Passcode gate state
	const PASSCODE_HASH = '2a3f4b950ef2e412a4496349786ef00099819c1d0376fb2911983b7341e98c6f';
	const STORAGE_KEY = 'aiworkshop-access';
	const LOCKOUT_KEY = 'aiworkshop-lockout';
	const MAX_ATTEMPTS = 3;
	const LOCKOUT_MINUTES = 15;

	let authenticated = $state(false);
	let passcode = $state('');
	let attempts = $state(0);
	let locked = $state(false);
	let error = $state('');
	let checking = $state(true); // true while we check localStorage

	$effect(() => {
		// Check existing auth
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem(STORAGE_KEY);
			if (token === PASSCODE_HASH) {
				authenticated = true;
			}

			// Check lockout
			const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
			if (lockoutUntil) {
				const remaining = parseInt(lockoutUntil) - Date.now();
				if (remaining > 0) {
					locked = true;
					attempts = MAX_ATTEMPTS;
					// Auto-unlock when cooldown expires
					setTimeout(() => {
						locked = false;
						attempts = 0;
						error = '';
						localStorage.removeItem(LOCKOUT_KEY);
					}, remaining);
				} else {
					localStorage.removeItem(LOCKOUT_KEY);
				}
			}

			checking = false;
		}
	});

	async function hashString(str) {
		const encoder = new TextEncoder();
		const data = encoder.encode(str);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (locked || !passcode.trim()) return;

		error = '';
		const hashed = await hashString(passcode.trim());

		if (hashed === PASSCODE_HASH) {
			localStorage.setItem(STORAGE_KEY, PASSCODE_HASH);
			authenticated = true;
		} else {
			attempts++;
			passcode = '';

			if (attempts >= MAX_ATTEMPTS) {
				locked = true;
				const lockoutUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
				localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
				error = 'Access locked. Please try again later.';
			} else {
				const remaining = MAX_ATTEMPTS - attempts;
				error = `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
			}
		}
	}
</script>

{#if checking}
	<!-- Blank screen while checking auth status to prevent flash -->
	<div class="min-h-screen bg-gray-50 dark:bg-slate-900"></div>
{:else if authenticated}
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
{:else}
<!-- Passcode gate -->
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">
	<!-- Decorative blur blobs -->
	<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
	<div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

	<div class="relative w-full max-w-sm">
		<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-white/10 p-8">
			<!-- Logo -->
			<div class="text-center mb-8">
				<div class="inline-flex items-center gap-2 mb-3">
					<span class="bg-blue-600 text-white text-lg font-extrabold px-2.5 py-1 rounded-lg">AI</span>
					<span class="text-xl font-bold text-gray-900 dark:text-white">Workshop CS</span>
				</div>
				<p class="text-sm text-gray-500 dark:text-gray-400">Enter your access code</p>
			</div>

			<!-- Form -->
			<form onsubmit={handleSubmit}>
				<div class="mb-4">
					<input
						type="text"
						bind:value={passcode}
						placeholder="Access code"
						disabled={locked}
						class="w-full px-4 py-3 text-sm border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 outline-none focus:border-blue-400 transition-colors placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
						style="-webkit-text-security: disc; text-security: disc;"
						autocomplete="off"
						autofocus
					/>
				</div>

				{#if error}
					<div class="mb-4 text-sm text-center {locked ? 'text-red-500 dark:text-red-400 font-medium' : 'text-red-500 dark:text-red-400'}">
						{error}
					</div>
				{/if}

				<button
					type="submit"
					disabled={locked || !passcode.trim()}
					class="w-full px-6 py-3 text-sm font-bold rounded-lg transition-colors bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if locked}
						Locked
					{:else}
						Enter Workshop
					{/if}
				</button>
			</form>

			<!-- Attempts indicator -->
			{#if attempts > 0 && !locked}
				<div class="mt-4 flex justify-center gap-1.5">
					{#each Array(MAX_ATTEMPTS) as _, i}
						<div class="w-2 h-2 rounded-full {i < attempts ? 'bg-red-400' : 'bg-gray-300 dark:bg-slate-600'}"></div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Private badge -->
		<div class="mt-6 flex justify-center">
			<div class="inline-flex items-center gap-2 text-xs text-white/60">
				<span class="w-2 h-2 rounded-full bg-emerald-400"></span>
				Private Access
			</div>
		</div>
	</div>
</div>
{/if}
