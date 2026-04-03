<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import CheckIcon from "@lucide/svelte/icons/check";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		children: childrenProp,
		...restProps
	}: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
		children?: Snippet;
	} = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:ref
	bind:checked
	bind:indeterminate
	data-slot="dropdown-menu-checkbox-item"
	class={cn(
		"focus:bg-glass-bg-hover focus:text-accent-foreground gap-2 rounded-lg py-1.5 pe-2.5 ps-8 text-sm [&_svg:not([class*='size-'])]:size-4 touch-action-manipulation relative flex cursor-default items-center outline-hidden transition-all duration-150 select-none [-webkit-tap-highlight-color:transparent] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className,
	)}
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<span class="start-2 size-3.5 pointer-events-none absolute flex items-center justify-center">
			{#if indeterminate}
				<MinusIcon class="size-4" />
			{:else}
				<CheckIcon class={cn("size-4", !checked && "text-transparent")} />
			{/if}
		</span>
		{@render childrenProp?.()}
	{/snippet}
</DropdownMenuPrimitive.CheckboxItem>
