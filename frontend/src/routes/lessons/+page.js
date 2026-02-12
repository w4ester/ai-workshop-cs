/** Lessons — load CSTA AI priorities for category/subtopic selection */
export const prerender = true;

export async function load({ fetch }) {
	const csta = await fetch('/data/csta-ai-priorities.json').then(r => r.json());
	return { csta };
}
