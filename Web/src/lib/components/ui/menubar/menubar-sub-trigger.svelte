<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { cn, type WithoutChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		inset = undefined,
		children,
		...restProps
	}: WithoutChild<MenubarPrimitive.SubTriggerProps> & {
		inset?: boolean;
	} = $props();
</script>

<MenubarPrimitive.SubTrigger
	bind:ref
	data-slot="menubar-sub-trigger"
	data-inset={inset}
	class={cn(
		"focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground rounded-sm px-2 py-1.5 text-sm data-[inset]:ps-8 flex cursor-default items-center outline-none select-none",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronRightIcon class="size-4 ms-auto" />
</MenubarPrimitive.SubTrigger>
