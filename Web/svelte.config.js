import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: "index.html",
		}),
		alias: {
			"~": "src",
		},
		paths: {
			relative: false, // Required for PostHog session replay to work correctly
		},
	},
};

export default config;
