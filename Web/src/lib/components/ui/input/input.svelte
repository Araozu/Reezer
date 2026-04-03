<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"selection:bg-primary selection:text-primary-foreground bg-glass-bg backdrop-blur-lg border-glass-border placeholder:text-muted-foreground h-10 min-w-0 rounded-xl px-4 pt-2 text-sm font-medium ease-out flex w-full border shadow-[inset_0_1px_1px_var(--glass-highlight)] transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50",
			"hover:bg-glass-bg-hover hover:border-glass-border-hover",
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:bg-glass-bg-active focus-visible:ring-2",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className,
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"selection:bg-primary selection:text-primary-foreground bg-glass-bg backdrop-blur-lg border-glass-border placeholder:text-muted-foreground h-10 min-w-0 rounded-xl px-4 py-2 text-base ease-out md:text-sm flex w-full border shadow-[inset_0_1px_1px_var(--glass-highlight)] transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50",
			"hover:bg-glass-bg-hover hover:border-glass-border-hover",
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:bg-glass-bg-active focus-visible:ring-2",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className,
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
