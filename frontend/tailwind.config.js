/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'md-blue': '#0066cc',
				'md-red': '#cc0000',
				'md-gold': '#e67700',
				'csta-green': '#00875a',
				'csta-purple': '#6b21a8'
			},
			fontFamily: {
				mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
			}
		}
	},
	plugins: []
};
