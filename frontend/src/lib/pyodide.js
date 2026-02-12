/**
 * Pyodide — ES module wrapper for browser-based Python execution
 * Singleton pattern: one Pyodide instance reused across all runs
 */

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/';

let pyodide = null;
let loadPromise = null;

/**
 * Lazy-load Pyodide from CDN. Returns the same instance on subsequent calls.
 * @param {(progress: {status: string, pct: number}) => void} [onProgress]
 * @returns {Promise<object>} Pyodide instance
 */
export async function initPyodide(onProgress) {
	if (pyodide) return pyodide;
	if (loadPromise) return loadPromise;

	loadPromise = (async () => {
		onProgress?.({ status: 'Loading Python engine...', pct: 10 });

		// Dynamically load the Pyodide script
		if (typeof globalThis.loadPyodide === 'undefined') {
			await new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = `${PYODIDE_CDN}pyodide.js`;
				script.crossOrigin = 'anonymous';
				script.onload = resolve;
				script.onerror = () => reject(new Error('Failed to load Pyodide script'));
				document.head.appendChild(script);
			});
		}

		onProgress?.({ status: 'Initializing Python...', pct: 50 });

		pyodide = await globalThis.loadPyodide({
			indexURL: PYODIDE_CDN
		});

		onProgress?.({ status: 'Ready!', pct: 100 });
		return pyodide;
	})();

	try {
		return await loadPromise;
	} catch (err) {
		pyodide = null;
		loadPromise = null; // Allow retry on failure
		throw err;
	}
}

/**
 * Run Python code, capturing stdout and stderr.
 * @param {string} code - Python source code
 * @param {(progress: {status: string, pct: number}) => void} [onProgress]
 * @returns {Promise<{success: boolean, output: string}>}
 */
export async function runPython(code, onProgress) {
	try {
		const py = await initPyodide(onProgress);

		let output = '';
		py.setStdout({ batched: (text) => { output += text + '\n'; } });
		py.setStderr({ batched: (text) => { output += text + '\n'; } });

		await py.runPythonAsync(code);
		return { success: true, output: output.trim() || '(No output)' };
	} catch (error) {
		return { success: false, output: error.message };
	}
}
