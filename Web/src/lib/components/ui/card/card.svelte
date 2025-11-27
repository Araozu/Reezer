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
		"bg-card/40 text-card-foreground backdrop-blur-xl flex flex-col gap-6 rounded-2xl border border-white/15 py-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
