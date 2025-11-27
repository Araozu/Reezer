<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		"bg-white/10 text-muted-foreground backdrop-blur-xl inline-flex h-10 w-fit items-center justify-center rounded-2xl p-1 border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
		className,
	)}
	{...restProps}
/>
