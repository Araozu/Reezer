<script lang="ts">
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";
	import favicon from "$lib/assets/favicon.svg";
	import { browser } from "$app/environment";
	import {
		QueryClient,
		QueryClientProvider,
	} from "@tanstack/svelte-query";
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				refetchInterval: 5 * 60 * 1000,
				refetchOnWindowFocus: false,
			},
		},
	});

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
	<SvelteQueryDevtools />
</QueryClientProvider>
<ModeWatcher />
