<script lang="ts">
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	type Props = WithElementRef<HTMLTextareaAttributes>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		"data-slot": dataSlot = "textarea",
		...restProps
	}: Props = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		"selection:bg-primary selection:text-primary-foreground bg-glass-bg backdrop-blur-lg border-glass-border placeholder:text-muted-foreground flex w-full min-w-0 rounded-xl border px-4 py-3 text-base outline-none transition-all duration-300 ease-out shadow-[inset_0_1px_1px_var(--glass-highlight)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y min-h-[120px]",
		"hover:bg-glass-bg-hover hover:border-glass-border-hover",
		"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:bg-glass-bg-active",
		"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
		className,
	)}
	bind:value
	{...restProps}
></textarea>
