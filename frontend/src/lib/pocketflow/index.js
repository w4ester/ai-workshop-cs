/**
 * PocketFlow — Minimal agent framework for browser-based AI flows
 * Based on the 5-node pattern from learn-python/js/tutor-flow.js
 *
 * Architecture: Node graph where each node has:
 *   prep(shared)     → read from shared store
 *   run(prepResult)  → do actual work
 *   post(shared, prepResult, runResult) → write to shared store, return next action
 */

export class Node {
	constructor(name) {
		this.name = name;
		this.connections = {};
	}

	/** Read from shared store */
	prep(shared) {
		return {};
	}

	/** Do the actual work (async) */
	async run(prepResult) {
		return {};
	}

	/** Write results, return action string for routing */
	post(shared, prepResult, runResult) {
		shared.lastResult = runResult;
		return 'default';
	}

	/** Connect this node to another via an action string */
	on(action, node) {
		this.connections[action] = node;
		return this;
	}

	/** Get the next node based on action */
	getNext(action) {
		return this.connections[action] || this.connections['default'] || null;
	}
}

export class Flow {
	constructor(name) {
		this.name = name;
		this.startNode = null;
	}

	/** Set the entry point */
	start(node) {
		this.startNode = node;
		return this;
	}

	/** Run the flow with a shared state object */
	async process(shared = {}) {
		let current = this.startNode;
		let steps = 0;
		const maxSteps = 20; // safety limit

		while (current && steps < maxSteps) {
			steps++;
			try {
				const prepResult = current.prep(shared);
				const runResult = await current.run(prepResult);
				const action = current.post(shared, prepResult, runResult);
				current = current.getNext(action);
			} catch (err) {
				shared.error = err;
				const errorNode = current.getNext('error');
				if (errorNode) {
					current = errorNode;
				} else {
					throw err;
				}
			}
		}

		return shared;
	}
}
