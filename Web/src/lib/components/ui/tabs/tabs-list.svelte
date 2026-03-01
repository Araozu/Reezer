<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		"bg-glass-bg text-muted-foreground backdrop-blur-xl h-10 rounded-2xl p-1 border-glass-border inline-flex w-fit items-center justify-center border shadow-[inset_0_1px_1px_var(--glass-highlight)]",
		className,
	)}
	{...restProps}
/>
