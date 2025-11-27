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
			"selection:bg-primary selection:text-primary-foreground bg-glass-bg backdrop-blur-lg border-glass-border placeholder:text-muted-foreground flex h-10 w-full min-w-0 rounded-xl border px-4 pt-2 text-sm font-medium outline-none transition-all duration-300 ease-out shadow-[inset_0_1px_1px_var(--glass-highlight)] disabled:cursor-not-allowed disabled:opacity-50",
			"hover:bg-glass-bg-hover hover:border-glass-border-hover",
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:bg-glass-bg-active",
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
			"selection:bg-primary selection:text-primary-foreground bg-glass-bg backdrop-blur-lg border-glass-border placeholder:text-muted-foreground flex h-10 w-full min-w-0 rounded-xl border px-4 py-2 text-base outline-none transition-all duration-300 ease-out shadow-[inset_0_1px_1px_var(--glass-highlight)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			"hover:bg-glass-bg-hover hover:border-glass-border-hover",
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:bg-glass-bg-active",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className,
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
