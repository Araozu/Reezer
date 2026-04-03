<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import CheckIcon from "@lucide/svelte/icons/check";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		indeterminate = $bindable(false),
		children: childrenProp,
		...restProps
	}: WithoutChildrenOrChild<MenubarPrimitive.CheckboxItemProps> & {
		children?: Snippet;
	} = $props();
</script>

<MenubarPrimitive.CheckboxItem
	bind:ref
	bind:checked
	bind:indeterminate
	data-slot="menubar-checkbox-item"
	class={cn(
		"focus:bg-accent focus:text-accent-foreground rounded-sm gap-2 py-1.5 pe-2 ps-8 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
</MenubarPrimitive.CheckboxItem>
