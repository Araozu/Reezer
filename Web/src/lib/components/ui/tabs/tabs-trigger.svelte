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
		"data-[state=active]:bg-primary/20 data-[state=active]:text-foreground data-[state=active]:border-primary text-muted-foreground h-8 gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium ease-out hover:text-foreground hover:bg-glass-bg focus-visible:ring-ring/50 [&_svg:not([class*='size-'])]:size-4 touch-action-manipulation inline-flex flex-1 items-center justify-center border border-transparent whitespace-nowrap transition-all duration-300 [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 data-[state=active]:shadow-[0_2px_8px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)] [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className,
	)}
	{...restProps}
/>
