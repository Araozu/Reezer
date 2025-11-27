<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type {
		HTMLAnchorAttributes,
		HTMLButtonAttributes,
	} from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium outline-none transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default:
					"bg-primary/20 text-foreground backdrop-blur-xl border border-primary/30 shadow-[0_4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)] hover:bg-primary/30 hover:border-primary/40 hover:shadow-[0_8px_32px_-4px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)] active:scale-[0.98] active:bg-primary/25",
				destructive:
					"bg-destructive/20 text-foreground backdrop-blur-xl border border-destructive/30 shadow-[0_4px_24px_-4px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)] hover:bg-destructive/30 hover:border-destructive/40 hover:shadow-[0_8px_32px_-4px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)] active:scale-[0.98]",
				outline:
					"bg-transparent text-foreground backdrop-blur-md border border-glass-border hover:bg-glass-bg-hover hover:border-glass-border-hover active:scale-[0.98]",
				secondary:
					"bg-glass-bg text-foreground backdrop-blur-lg border border-glass-border shadow-[inset_0_1px_1px_var(--glass-highlight)] hover:bg-glass-bg-hover hover:border-glass-border-hover active:scale-[0.98]",
				ghost:
					"text-foreground/80 hover:bg-glass-bg-hover hover:text-foreground backdrop-blur-sm active:scale-[0.98]",
				link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
			},
			size: {
				default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
				sm: "h-8 gap-1.5 rounded-xl px-3.5 has-[>svg]:px-2.5 text-xs",
				lg: "h-12 rounded-2xl px-7 has-[>svg]:px-5 text-base",
				icon: "size-10 rounded-xl",
				"icon-sm": "size-8 rounded-lg",
				"icon-lg": "size-12 rounded-2xl",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<
		typeof buttonVariants
	>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
