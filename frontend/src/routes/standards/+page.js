/** Standards Crosswalk — load all 3 JSON data files from static assets */
export const prerender = true;

export async function load({ fetch }) {
	const [crosswalk, csta, msde] = await Promise.all([
		fetch('/data/crosswalk.json').then(r => r.json()),
		fetch('/data/csta-ai-priorities.json').then(r => r.json()),
		fetch('/data/msde-standards.json').then(r => r.json())
	]);
	return { crosswalk, csta, msde };
}
