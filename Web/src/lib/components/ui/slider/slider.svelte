<script lang="ts">
	import { Slider as SliderPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		orientation = "horizontal",
		class: className,
		...restProps
	}: WithoutChildrenOrChild<SliderPrimitive.RootProps> = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="slider"
	{orientation}
	class={cn(
		"relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50",
		className,
	)}
	{...restProps}
>
	{#snippet children({ thumbs })}
		<span
			data-orientation={orientation}
			data-slot="slider-track"
			class={cn("bg-glass-bg backdrop-blur-sm border border-glass-border relative grow overflow-hidden rounded-full shadow-[inset_0_1px_2px_var(--glass-shadow)] data-[orientation=horizontal]:h-2 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-2")}
		>
			<SliderPrimitive.Range
				data-slot="slider-range"
				class={cn("bg-primary/80 backdrop-blur-sm absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")}
			/>
		</span>
		{#each thumbs as thumb (thumb)}
			<SliderPrimitive.Thumb
				data-slot="slider-thumb"
				index={thumb}
				class="bg-background/90 backdrop-blur-lg border-glass-border ring-ring/50 focus-visible:outline-hidden block size-5 shrink-0 rounded-full border-2 shadow-[0_2px_8px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)] transition-all duration-300 hover:ring-4 hover:scale-110 focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
