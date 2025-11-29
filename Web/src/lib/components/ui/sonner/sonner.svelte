<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	toastOptions={{
		classes: {
			toast: "bg-glass-bg backdrop-blur-xl border-glass-border shadow-[0_8px_32px_-8px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)] rounded-2xl",
			title: "text-foreground",
			description: "text-muted-foreground",
			actionButton: "bg-primary/20 text-foreground border-primary/30",
			cancelButton: "bg-glass-bg text-foreground border-glass-border",
		},
	}}
	style="--normal-bg: var(--glass-bg); --normal-text: var(--foreground); --normal-border: var(--glass-border);"
	{...restProps}
/>
