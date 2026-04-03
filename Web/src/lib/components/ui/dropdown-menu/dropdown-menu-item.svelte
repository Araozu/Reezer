<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		variant = "default",
		...restProps
	}: DropdownMenuPrimitive.ItemProps & {
		inset?: boolean;
		variant?: "default" | "destructive";
	} = $props();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	data-slot="dropdown-menu-item"
	data-inset={inset}
	data-variant={variant}
	class={cn(
		"data-highlighted:bg-glass-bg-hover data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/15 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground gap-2 rounded-lg px-2.5 py-1.5 text-sm data-[inset]:ps-8 [&_svg:not([class*='size-'])]:size-4 touch-action-manipulation relative flex cursor-default items-center outline-hidden transition-all duration-150 select-none [-webkit-tap-highlight-color:transparent] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className,
	)}
	{...restProps}
/>
