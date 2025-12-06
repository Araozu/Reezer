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
		"data-[state=active]:bg-primary/20 data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:shadow-[0_2px_8px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)] text-muted-foreground inline-flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-out hover:text-foreground hover:bg-glass-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 touch-action-manipulation [-webkit-tap-highlight-color:transparent]",
		className,
	)}
	{...restProps}
/>
