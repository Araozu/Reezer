<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	class={cn(
		"data-[state=active]:bg-white/20 data-[state=active]:text-foreground data-[state=active]:border-white/25 data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.3)] text-muted-foreground inline-flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-out hover:text-foreground hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className,
	)}
	{...restProps}
/>
