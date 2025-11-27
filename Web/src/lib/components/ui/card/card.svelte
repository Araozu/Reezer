<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		"bg-card/60 text-card-foreground backdrop-blur-xl flex flex-col gap-6 rounded-2xl border border-glass-border py-6 shadow-[0_8px_32px_-8px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)] transition-all duration-300",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
