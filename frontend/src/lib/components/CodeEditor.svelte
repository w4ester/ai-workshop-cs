<script>
	/**
	 * CodeEditor — Reusable Python code editor with Mac-style toolbar
	 * Props: code (bindable), filename, onRun, onReset, isRunning, output
	 */
	let {
		code = $bindable(''),
		filename = 'script.py',
		onRun = () => {},
		onReset = () => {},
		isRunning = false,
		output = ''
	} = $props();

	function handleKeydown(e) {
		// Ctrl/Cmd + Enter to run
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			onRun();
		}
		// Tab inserts spaces instead of changing focus
		if (e.key === 'Tab') {
			e.preventDefault();
			const textarea = e.target;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			code = code.substring(0, start) + '    ' + code.substring(end);
			// Restore cursor position after Svelte re-renders
			requestAnimationFrame(() => {
				textarea.selectionStart = textarea.selectionEnd = start + 4;
			});
		}
	}
</script>

<div class="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
	<!-- Mac-style toolbar -->
	<div class="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
		<div class="flex items-center gap-2">
			<div class="flex gap-1.5">
				<span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
				<span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
				<span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
			</div>
			<span class="text-xs text-gray-500 dark:text-gray-400 font-semibold ml-1">{filename}</span>
		</div>
		<div class="flex gap-2">
			<button
				onclick={onReset}
				disabled={isRunning}
				class="px-2.5 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-300 dark:border-slate-600 rounded transition-colors disabled:opacity-40"
			>
				Reset
			</button>
			<button
				onclick={onRun}
				disabled={isRunning}
				class="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
			>
				{#if isRunning}
					<span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					Running...
				{:else}
					<span>&#9654;</span> Run
				{/if}
			</button>
		</div>
	</div>

	<!-- Code textarea -->
	<textarea
		bind:value={code}
		onkeydown={handleKeydown}
		spellcheck="false"
		class="w-full min-h-[220px] p-4 font-mono text-sm leading-relaxed bg-[#1e1e2e] text-[#cdd6f4] placeholder-[#585b70] border-none outline-none resize-y"
		style="tab-size: 4;"
	></textarea>

	<!-- Output panel -->
	{#if output || isRunning}
		<div
			class="border-t border-gray-200 dark:border-slate-700 px-4 py-3 font-mono text-sm leading-relaxed bg-[#11111b] max-h-60 overflow-y-auto whitespace-pre-wrap break-words"
			class:text-[#a6e3a1]={output && !output.startsWith('Error') && !output.startsWith('Traceback')}
			class:text-[#f38ba8]={output && (output.startsWith('Error') || output.startsWith('Traceback'))}
			class:text-[#89b4fa]={isRunning && !output}
		>
			{#if isRunning && !output}
				Loading Python engine...
			{:else}
				{output}
			{/if}
		</div>
	{/if}
</div>
