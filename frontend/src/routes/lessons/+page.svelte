<script>
	/**
	 * Lessons — AI Lesson Builder form
	 * Composes a structured prompt and sends it to the Chat panel via chat-bridge
	 */
	import { sendToChat } from '$lib/stores/chat-bridge.svelte.js';

	let { data } = $props();

	const gradeBands = [
		{ id: 'K-2', label: 'K-2', desc: 'Early elementary', icon: '&#127793;' },
		{ id: '3-5', label: '3-5', desc: 'Upper elementary', icon: '&#127891;' },
		{ id: '6-8', label: '6-8', desc: 'Middle school', icon: '&#128218;' },
		{ id: '9-12', label: '9-12', desc: 'High school', icon: '&#127941;' }
	];

	const cstaCategories = [
		{ id: 'A', name: 'Humans and AI', desc: 'What makes humans different from AI?', color: 'pink' },
		{ id: 'B', name: 'Representation & Reasoning', desc: 'How does AI represent and reason about data?', color: 'blue' },
		{ id: 'C', name: 'Machine Learning', desc: 'How do machines learn from examples?', color: 'emerald' },
		{ id: 'D', name: 'Ethical AI', desc: 'How do we design fair, transparent AI?', color: 'amber' },
		{ id: 'E', name: 'Societal Impacts', desc: 'How does AI affect communities and society?', color: 'purple' }
	];

	const durations = [
		{ min: 20, label: '20 min' },
		{ min: 30, label: '30 min' },
		{ min: 45, label: '45 min' },
		{ min: 60, label: '60 min' },
		{ min: 0, label: 'Multi-day' }
	];

	// Form state
	let selectedGrade = $state('');
	let selectedCategory = $state('');
	let selectedDuration = $state(45);
	let context = $state('');
	let isSending = $state(false);

	// Category color helpers
	function catBg(color, selected) {
		if (selected) return `bg-${color}-100 dark:bg-${color}-900/30 border-${color}-500 ring-2 ring-${color}-400`;
		return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-400';
	}

	// Compose prompt from selections
	let prompt = $derived(() => {
		if (!selectedGrade || !selectedCategory) return '';
		const cat = cstaCategories.find(c => c.id === selectedCategory);
		const durText = selectedDuration === 0 ? 'a multi-day unit' : `a ${selectedDuration}-minute lesson`;
		let p = `Create ${durText} for grade band ${selectedGrade} aligned to CSTA AI Priority Category ${selectedCategory}: ${cat?.name}.`;
		p += ` The lesson should connect to Maryland CS standards where possible.`;
		if (context.trim()) {
			p += `\n\nStudent context: ${context.trim()}`;
		}
		p += `\n\nPlease include: learning objectives, materials needed, step-by-step activities, assessment ideas, and standards alignment notes.`;
		return p;
	});

	function generateLesson() {
		const p = prompt();
		if (!p) return;
		isSending = true;
		sendToChat(p);
		// Brief delay so user sees the transition
		setTimeout(() => { isSending = false; }, 500);
	}

	// Quick-start examples
	const examples = [
		{ grade: 'K-2', cat: 'A', dur: 20, ctx: 'Students can follow multi-step directions.' },
		{ grade: '6-8', cat: 'C', dur: 45, ctx: 'Students have experience with variables and loops in Scratch.' },
		{ grade: '9-12', cat: 'D', dur: 60, ctx: 'Students have completed AP CSP Unit 4 (Data).' }
	];

	function applyExample(ex) {
		selectedGrade = ex.grade;
		selectedCategory = ex.cat;
		selectedDuration = ex.dur;
		context = ex.ctx;
	}
</script>

<svelte:head>
	<title>Lesson Builder — AI Workshop CS</title>
</svelte:head>

<!-- Header -->
<section class="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 text-white py-12">
	<div class="max-w-5xl mx-auto px-6">
		<h1 class="text-3xl font-extrabold tracking-tight mb-2">AI Lesson Builder</h1>
		<p class="text-blue-100 max-w-2xl">
			Tell us your grade band and AI topic. Our assistant will generate a complete, dual-aligned lesson plan connecting MSDE CS Standards with CSTA AI Priorities.
		</p>
	</div>
</section>

<section class="max-w-5xl mx-auto px-6 py-8">
	<div class="grid lg:grid-cols-5 gap-8">
		<!-- Left column: Form (3 cols) -->
		<div class="lg:col-span-3 space-y-8">
			<!-- Grade Band -->
			<div>
				<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">1. Grade Band</h2>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each gradeBands as band}
						<button
							onclick={() => selectedGrade = selectedGrade === band.id ? '' : band.id}
							class="p-4 rounded-xl border-2 text-center transition-all {selectedGrade === band.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-400'}"
						>
							<div class="text-2xl mb-1">{@html band.icon}</div>
							<div class="font-bold text-lg">{band.label}</div>
							<div class="text-xs text-gray-500">{band.desc}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- CSTA Category -->
			<div>
				<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">2. AI Topic (CSTA Category)</h2>
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{#each cstaCategories as cat}
						<button
							onclick={() => selectedCategory = selectedCategory === cat.id ? '' : cat.id}
							class="p-4 rounded-xl border-2 text-left transition-all {selectedCategory === cat.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-400'}"
						>
							<div class="font-bold text-sm">{cat.id}. {cat.name}</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.desc}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Duration -->
			<div>
				<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">3. Duration</h2>
				<div class="flex flex-wrap gap-2">
					{#each durations as dur}
						<button
							onclick={() => selectedDuration = dur.min}
							class="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors {selectedDuration === dur.min ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-blue-400'}"
						>
							{dur.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Context -->
			<div>
				<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">4. Student Context <span class="text-sm font-normal text-gray-400">(optional)</span></h2>
				<textarea
					bind:value={context}
					placeholder="What do students already know? E.g., 'Students have experience with Scratch and can explain what an algorithm is.'"
					rows="3"
					class="w-full px-4 py-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-400 transition-colors resize-y"
				></textarea>
			</div>

			<!-- Generate button -->
			<button
				onclick={generateLesson}
				disabled={!selectedGrade || !selectedCategory || isSending}
				class="w-full py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
			>
				{#if isSending}
					<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					Sending to Assistant...
				{:else}
					&#129302; Generate Lesson
				{/if}
			</button>

			{#if !selectedGrade || !selectedCategory}
				<p class="text-sm text-gray-400 text-center -mt-4">Select a grade band and AI topic to continue</p>
			{/if}
		</div>

		<!-- Right column: Preview + info (2 cols) -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Prompt preview -->
			<div class="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
				<h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Prompt Preview</h3>
				{#if prompt()}
					<p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{prompt()}</p>
				{:else}
					<p class="text-sm text-gray-400 italic">Select options to see the generated prompt...</p>
				{/if}
			</div>

			<!-- How it works -->
			<div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
				<h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">How It Works</h3>
				<ol class="space-y-3 text-sm">
					<li class="flex items-start gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
						<span class="text-gray-600 dark:text-gray-300"><strong>Configure</strong> — Choose grade band, AI topic, and duration above</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
						<span class="text-gray-600 dark:text-gray-300"><strong>Generate</strong> — The AI assistant creates a dual-aligned lesson plan</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
						<span class="text-gray-600 dark:text-gray-300"><strong>Refine</strong> — Chat with the assistant to adjust the lesson to your needs</span>
					</li>
				</ol>
			</div>

			<!-- Quick-start examples -->
			<div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
				<h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Quick Start Examples</h3>
				<div class="space-y-2">
					{#each examples as ex}
						<button
							onclick={() => applyExample(ex)}
							class="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-blue-400 transition-colors text-sm"
						>
							<div class="font-semibold text-gray-900 dark:text-white">
								{ex.grade} / Category {ex.cat} / {ex.dur} min
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ex.ctx}</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
