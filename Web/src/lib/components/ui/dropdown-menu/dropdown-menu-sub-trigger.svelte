<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		children,
		...restProps
	}: DropdownMenuPrimitive.SubTriggerProps & {
		inset?: boolean;
	} = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
	bind:ref
	data-slot="dropdown-menu-sub-trigger"
	data-inset={inset}
	class={cn(
		"data-highlighted:bg-glass-bg-hover data-highlighted:text-accent-foreground data-[state=open]:bg-glass-bg-active data-[state=open]:text-accent-foreground outline-hidden [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150 data-[disabled]:pointer-events-none data-[inset]:ps-8 data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 touch-action-manipulation [-webkit-tap-highlight-color:transparent]",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronRightIcon class="ms-auto size-4" />
</DropdownMenuPrimitive.SubTrigger>
