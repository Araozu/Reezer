<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import XIcon from "@lucide/svelte/icons/x";
	import type { Snippet } from "svelte";
	import * as Dialog from "./index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		children: Snippet;
		showCloseButton?: boolean;
	} = $props();
</script>

<Dialog.Portal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			"bg-background/80 backdrop-blur-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 gap-4 rounded-2xl border-glass-border p-6 sm:max-w-lg fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border shadow-[0_16px_64px_-16px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)] duration-300",
			className,
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close
				class="rounded-xl end-4 top-4 p-1.5 text-foreground/60 hover:text-foreground hover:bg-glass-bg-hover focus-visible:ring-ring/50 [&_svg:not([class*='size-'])]:size-4 absolute transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0"
			>
				<XIcon />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</Dialog.Portal>
