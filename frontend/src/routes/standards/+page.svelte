<script>
	/**
	 * Standards Crosswalk Browser
	 * Filterable view of MSDE CS Standards ↔ CSTA AI Priority alignments
	 */
	let { data } = $props();

	const gradeBands = ['K-2', '3-5', '6-8', '9-12'];
	const categories = [
		{ id: 'A', name: 'Humans and AI', short: 'A. Humans & AI' },
		{ id: 'B', name: 'Representation and Reasoning', short: 'B. Representation' },
		{ id: 'C', name: 'Machine Learning', short: 'C. Machine Learning' },
		{ id: 'D', name: 'Ethical AI', short: 'D. Ethical AI' },
		{ id: 'E', name: 'Societal Impacts', short: 'E. Societal Impacts' }
	];
	const strengths = ['strong', 'partial', 'extension', 'gap'];

	// Filter state
	let selectedGrade = $state('');
	let selectedCategory = $state('');
	let selectedStrength = $state('');
	let searchText = $state('');

	// Flatten all alignments + gaps into a single list
	let allItems = $derived.by(() => {
		const items = [];
		for (const band of data.crosswalk.mappings) {
			for (const a of band.alignments) {
				items.push({ ...a, grade_band: band.grade_band });
			}
			for (const g of band.gaps) {
				items.push({
					grade_band: band.grade_band,
					alignment_strength: 'gap',
					csta_ai_priority: g.csta_ai_priority,
					msde_standard: null,
					teaching_notes: g.gap_notes
				});
			}
		}
		return items;
	});

	// Filtered results
	let filtered = $derived.by(() => {
		let results = allItems;
		if (selectedGrade) {
			results = results.filter(i => i.grade_band === selectedGrade);
		}
		if (selectedCategory) {
			results = results.filter(i =>
				i.csta_ai_priority.category?.startsWith(selectedCategory + '.')
			);
		}
		if (selectedStrength) {
			results = results.filter(i => i.alignment_strength === selectedStrength);
		}
		if (searchText.trim()) {
			const q = searchText.toLowerCase();
			results = results.filter(i =>
				(i.msde_standard?.text || '').toLowerCase().includes(q) ||
				(i.msde_standard?.code || '').toLowerCase().includes(q) ||
				i.csta_ai_priority.text.toLowerCase().includes(q) ||
				i.csta_ai_priority.subtopic.toLowerCase().includes(q) ||
				(i.teaching_notes || '').toLowerCase().includes(q)
			);
		}
		return results;
	});

	// Stats
	let stats = $derived.by(() => {
		const items = allItems;
		return {
			total: items.length,
			strong: items.filter(i => i.alignment_strength === 'strong').length,
			partial: items.filter(i => i.alignment_strength === 'partial').length,
			extension: items.filter(i => i.alignment_strength === 'extension').length,
			gap: items.filter(i => i.alignment_strength === 'gap').length
		};
	});

	// Expanded cards state
	let expandedCards = $state(new Set());

	function toggleCard(index) {
		const next = new Set(expandedCards);
		if (next.has(index)) next.delete(index);
		else next.add(index);
		expandedCards = next;
	}

	function clearFilters() {
		selectedGrade = '';
		selectedCategory = '';
		selectedStrength = '';
		searchText = '';
	}

	function strengthColor(s) {
		return {
			strong: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
			partial: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
			extension: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
			gap: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
		}[s] || '';
	}

	function strengthDot(s) {
		return { strong: 'bg-emerald-500', partial: 'bg-amber-500', extension: 'bg-blue-500', gap: 'bg-purple-500' }[s] || '';
	}
</script>

<svelte:head>
	<title>Skills + Standards Explorer | AI Workshop CS</title>
</svelte:head>

<!-- Header -->
<section class="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 text-white py-12">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<h1 class="text-3xl font-extrabold tracking-tight mb-2">Skills + Standards Explorer</h1>
		<p class="text-blue-100 max-w-2xl">
			See where Maryland CS skills already connect to AI learning priorities, and find natural starting points for hands-on, entrepreneurial projects that put AI and technology to work.
		</p>
	</div>
</section>

<!-- Entrepreneurial framing -->
<section class="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
	<div class="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
		<h2 class="font-bold text-gray-900 dark:text-white mb-2">From Standards to Student Projects</h2>
		<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
			Every connection below is a chance for students to build something real. The skills Maryland students are already developing in CS classrooms map naturally to AI and technology projects where they can create, prototype, and solve problems like entrepreneurs.
		</p>
		<div class="grid sm:grid-cols-3 gap-3 text-sm">
			<div class="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3">
				<div class="font-bold text-emerald-700 dark:text-emerald-400 mb-1">Build on What's There</div>
				<div class="text-gray-600 dark:text-gray-400 text-xs">Strong and partial connections are ready-made project springboards. Students already have the skills.</div>
			</div>
			<div class="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3">
				<div class="font-bold text-blue-700 dark:text-blue-400 mb-1">Extend with AI</div>
				<div class="text-gray-600 dark:text-gray-400 text-xs">Extension connections invite students to layer AI onto existing work through design sprints and prototypes.</div>
			</div>
			<div class="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3">
				<div class="font-bold text-purple-700 dark:text-purple-400 mb-1">Explore New Ground</div>
				<div class="text-gray-600 dark:text-gray-400 text-xs">Open spaces are creative opportunities. Students can pioneer new projects that bring AI into the classroom.</div>
			</div>
		</div>
	</div>
</section>

<!-- Filter Bar -->
<section class="max-w-5xl mx-auto px-4 sm:px-6 py-6">
	<div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
		<!-- Grade band pills -->
		<div>
			<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Grade Band</span>
			<div class="flex flex-wrap gap-2 mt-1.5">
				{#each gradeBands as band}
					<button
						onclick={() => selectedGrade = selectedGrade === band ? '' : band}
						class="px-3 py-2 sm:py-1.5 text-sm font-semibold rounded-lg border transition-colors {selectedGrade === band ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-blue-400'}"
					>
						{band}
					</button>
				{/each}
			</div>
		</div>

		<!-- Category selector -->
		<div>
			<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">CSTA AI Category</span>
			<div class="flex flex-wrap gap-2 mt-1.5">
				{#each categories as cat}
					<button
						onclick={() => selectedCategory = selectedCategory === cat.id ? '' : cat.id}
						class="px-3 py-2 sm:py-1.5 text-sm font-semibold rounded-lg border transition-colors {selectedCategory === cat.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-emerald-400'}"
					>
						{cat.short}
					</button>
				{/each}
			</div>
		</div>

		<!-- Strength pills -->
		<div>
			<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Connection Level</span>
			<div class="flex flex-wrap gap-2 mt-1.5">
				{#each strengths as s}
					<button
						onclick={() => selectedStrength = selectedStrength === s ? '' : s}
						class="px-3 py-2 sm:py-1.5 text-sm font-semibold rounded-lg border transition-colors capitalize {selectedStrength === s ? strengthColor(s) + ' ring-2 ring-offset-1' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-gray-400'}"
					>
						<span class="inline-block w-2 h-2 rounded-full {strengthDot(s)} mr-1"></span>
						{s}
					</button>
				{/each}
			</div>
		</div>

		<!-- Text search -->
		<div>
			<input
				bind:value={searchText}
				type="search"
			aria-label="Search standards, topics, or teaching notes"
				placeholder="Search standards, topics, or teaching notes..."
				class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-400 transition-colors"
			/>
		</div>

		<!-- Active filter count + clear -->
		{#if selectedGrade || selectedCategory || selectedStrength || searchText}
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-500">
					Showing <strong class="text-gray-900 dark:text-white">{filtered.length}</strong> of {stats.total} connections
				</span>
				<button onclick={clearFilters} class="text-sm text-blue-600 hover:underline font-semibold">
					Clear all filters
				</button>
			</div>
		{/if}
	</div>
</section>

<!-- Stats Summary -->
<section class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
	<div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3">
		<div class="bg-white dark:bg-slate-800 border rounded-lg p-3 text-center">
			<div class="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total}</div>
			<div class="text-xs text-gray-500">Connections</div>
		</div>
		<div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
			<div class="text-2xl font-extrabold text-emerald-600">{stats.strong}</div>
			<div class="text-xs text-emerald-700 dark:text-emerald-400">Ready to Build</div>
		</div>
		<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
			<div class="text-2xl font-extrabold text-amber-600">{stats.partial}</div>
			<div class="text-xs text-amber-700 dark:text-amber-400">Add AI Lens</div>
		</div>
		<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
			<div class="text-2xl font-extrabold text-blue-600">{stats.extension}</div>
			<div class="text-xs text-blue-700 dark:text-blue-400">Extend</div>
		</div>
		<div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
			<div class="text-2xl font-extrabold text-purple-600">{stats.gap}</div>
			<div class="text-xs text-purple-700 dark:text-purple-400">New Ground</div>
		</div>
	</div>
</section>

<!-- Alignment Cards -->
<section class="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
	<div class="space-y-3">
		{#each filtered as item, idx}
			<div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
				<!-- Card header -->
				<button
					onclick={() => toggleCard(idx)}
					class="w-full px-5 py-4 text-left flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors"
				>
					<!-- Strength badge -->
					<span class="flex-shrink-0 mt-0.5 px-2.5 py-0.5 text-xs font-bold rounded-full border capitalize {strengthColor(item.alignment_strength)}">
						{item.alignment_strength}
					</span>

					<div class="flex-1 min-w-0">
						<!-- CSTA Priority -->
						<div class="flex items-center gap-2 flex-wrap">
							<span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
								CSTA {item.csta_ai_priority.id}
							</span>
							{#if item.csta_ai_priority.priority}
								<span class="text-xs font-semibold text-purple-600 dark:text-purple-400">Priority</span>
							{/if}
							<span class="text-xs text-gray-400">{item.grade_band}</span>
						</div>
						<p class="text-sm font-medium text-gray-900 dark:text-white mt-1">{item.csta_ai_priority.text}</p>

						<!-- MSDE Standard (if not a gap) -->
						{#if item.msde_standard}
							<div class="mt-2 flex items-center gap-2">
								<span class="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
									{item.msde_standard.code}
								</span>
								<span class="text-xs text-gray-400">{item.msde_standard.concept}</span>
							</div>
							<p class="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{item.msde_standard.text}</p>
						{:else}
							<div class="mt-2">
								<span class="text-xs font-bold text-purple-600 dark:text-purple-400">Open opportunity for project-based learning</span>
							</div>
						{/if}
					</div>

					<!-- Expand chevron -->
					<svg aria-hidden="true" class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform {expandedCards.has(idx) ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				<!-- Teaching notes (expanded) -->
				{#if expandedCards.has(idx) && item.teaching_notes}
					<div class="px-5 pb-4 pt-0 border-t border-gray-100 dark:border-slate-700">
						<div class="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mt-3">
							<h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
								{item.alignment_strength === 'gap' ? 'Project Opportunity' : 'Project Connection'}
							</h4>
							<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.teaching_notes}</p>
						</div>
					</div>
				{/if}
			</div>
		{/each}

		{#if filtered.length === 0}
			<div class="text-center py-12 text-gray-400">
				<p class="text-lg mb-2">No connections match your filters.</p>
				<button onclick={clearFilters} class="text-blue-600 hover:underline font-semibold">
					Clear all filters
				</button>
			</div>
		{/if}
	</div>
</section>

<!-- Legend -->
<section class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
	<div class="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
		<h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">What the Connection Levels Mean</h3>
		<div class="grid sm:grid-cols-2 gap-3 text-sm">
			<div class="flex items-start gap-2">
				<span class="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 flex-shrink-0"></span>
				<div>
					<strong class="text-emerald-700 dark:text-emerald-400">Strong</strong>
					<span class="text-gray-600 dark:text-gray-400">: students already have the skills. A great starting point for an AI-powered project or product prototype.</span>
				</div>
			</div>
			<div class="flex items-start gap-2">
				<span class="w-3 h-3 rounded-full bg-amber-500 mt-0.5 flex-shrink-0"></span>
				<div>
					<strong class="text-amber-700 dark:text-amber-400">Partial</strong>
					<span class="text-gray-600 dark:text-gray-400">: related skills are in place. Add an AI lens to an existing project or activity to strengthen the connection.</span>
				</div>
			</div>
			<div class="flex items-start gap-2">
				<span class="w-3 h-3 rounded-full bg-blue-500 mt-0.5 flex-shrink-0"></span>
				<div>
					<strong class="text-blue-700 dark:text-blue-400">Extension</strong>
					<span class="text-gray-600 dark:text-gray-400">: build on current work. Layer in AI concepts through an entrepreneurial challenge or design sprint.</span>
				</div>
			</div>
			<div class="flex items-start gap-2">
				<span class="w-3 h-3 rounded-full bg-purple-500 mt-0.5 flex-shrink-0"></span>
				<div>
					<strong class="text-purple-700 dark:text-purple-400">New Ground</strong>
					<span class="text-gray-600 dark:text-gray-400">: open space, open opportunity. These are places where a creative, project-based approach can introduce AI concepts from scratch.</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Project Ideas CTA -->
<section class="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
	<div class="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl p-6 text-center text-white">
		<h3 class="text-lg font-bold mb-2">Ready to Turn a Connection into a Project?</h3>
		<p class="text-blue-100 text-sm mb-4 max-w-xl mx-auto">
			Pick any connection above and head to the Lesson Builder. Choose your grade band and AI category, and the assistant will generate a skill-based lesson your students can use to build, create, and solve real problems.
		</p>
		<a href="/lessons" class="inline-block px-5 py-2.5 bg-white text-blue-800 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm">
			Build a Lesson
		</a>
	</div>
</section>
