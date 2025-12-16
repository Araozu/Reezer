<script lang="ts">
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";
	import favicon from "$lib/assets/favicon.svg";
	import { browser } from "$app/environment";
	import { beforeNavigate, afterNavigate } from "$app/navigation";
	import posthog from "posthog-js";
	import {
		QueryClient,
		QueryClientProvider,
	} from "@tanstack/svelte-query";
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
	import { Toaster } from "$lib/components/ui/sonner/index.js";

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				refetchInterval: 5 * 60 * 1000,
				refetchOnWindowFocus: false,
			},
		},
	});

	if (browser && "serviceWorker" in navigator) {
		navigator.serviceWorker.register("/sw.js");
	}

	if (browser) {
		beforeNavigate(() => posthog.capture('$pageleave'));
		afterNavigate(() => posthog.capture('$pageview'));
	}

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster />
<QueryClientProvider client={queryClient}>
	{@render children()}
	<SvelteQueryDevtools />
</QueryClientProvider>
<ModeWatcher />