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
		"selection:bg-primary selection:text-primary-foreground bg-glass-bg backdrop-blur-lg border-glass-border placeholder:text-muted-foreground min-w-0 rounded-xl px-4 py-3 text-base ease-out md:text-sm flex min-h-[120px] w-full resize-y border shadow-[inset_0_1px_1px_var(--glass-highlight)] transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50",
		"hover:bg-glass-bg-hover hover:border-glass-border-hover",
		"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:bg-glass-bg-active focus-visible:ring-2",
		"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
		className,
	)}
	bind:value
	{...restProps}
></textarea>
