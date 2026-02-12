<script>
	// Home page — AI Workshop CS landing
</script>

<svelte:head>
	<title>AI Workshop CS — Maryland AI-Aligned Lesson Builder</title>
</svelte:head>

<section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 text-white">
	<div class="absolute inset-0 opacity-20">
		<div class="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
		<div class="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
	</div>
	<div class="relative max-w-4xl mx-auto px-6 py-20 text-center">
		<div class="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-white/10 border border-white/20 rounded-full backdrop-blur">
			Maryland CS Educators
		</div>
		<h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
			AI-Aligned Lesson Builder
		</h1>
		<p class="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
			Create standards-aligned lessons that bridge Maryland's CS Standards and the CSTA AI Learning Priorities — powered by AI, delivered in the format you choose.
		</p>
		<div class="flex flex-wrap justify-center gap-3">
			<a href="/playground"
				class="px-6 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors">
				Try the Playground
			</a>
			<a href="/lessons"
				class="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg border border-blue-400 hover:bg-blue-500 transition-colors">
				Build a Lesson
			</a>
		</div>
	</div>
</section>

<section class="max-w-5xl mx-auto px-6 py-16">
	<div class="grid md:grid-cols-3 gap-6">
		<div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
			<div class="text-3xl mb-3">&#9654;</div>
			<h3 class="font-bold text-lg mb-2">Interactive Playground</h3>
			<p class="text-gray-600 dark:text-gray-300 text-sm">
				Run Python code in your browser. Five AI-themed activities mapped to CSTA AI Priorities — no install, no login.
			</p>
		</div>
		<div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
			<div class="text-3xl mb-3">&#128218;</div>
			<h3 class="font-bold text-lg mb-2">Standards Crosswalk</h3>
			<p class="text-gray-600 dark:text-gray-300 text-sm">
				Browse the mapping between MSDE CS Standards and CSTA AI Priorities. See gaps, extensions, and alignment strength.
			</p>
		</div>
		<div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
			<div class="text-3xl mb-3">&#9881;</div>
			<h3 class="font-bold text-lg mb-2">AI Lesson Agent</h3>
			<p class="text-gray-600 dark:text-gray-300 text-sm">
				Tell the agent your grade band and topic. Get a complete, dual-aligned lesson in your chosen format in minutes.
			</p>
		</div>
	</div>
</section>

<section class="max-w-5xl mx-auto px-6 pb-16">
	<h2 class="text-2xl font-bold mb-6">The Gap We're Bridging</h2>
	<div class="grid sm:grid-cols-4 gap-4 text-center">
		<div class="bg-white dark:bg-slate-800 border rounded-xl p-5">
			<div class="text-3xl font-extrabold text-red-600">1</div>
			<div class="text-sm text-gray-500 mt-1">AI mention in MSDE's 55-page CS Standards</div>
		</div>
		<div class="bg-white dark:bg-slate-800 border rounded-xl p-5">
			<div class="text-3xl font-extrabold text-blue-600">~60</div>
			<div class="text-sm text-gray-500 mt-1">AI outcomes in CSTA AI Priorities (2025)</div>
		</div>
		<div class="bg-white dark:bg-slate-800 border rounded-xl p-5">
			<div class="text-3xl font-extrabold text-orange-500">42%</div>
			<div class="text-sm text-gray-500 mt-1">of CS teachers feel equipped to teach AI</div>
		</div>
		<div class="bg-white dark:bg-slate-800 border rounded-xl p-5">
			<div class="text-3xl font-extrabold text-emerald-600">70%</div>
			<div class="text-sm text-gray-500 mt-1">are already teaching AI anyway</div>
		</div>
	</div>
</section>
