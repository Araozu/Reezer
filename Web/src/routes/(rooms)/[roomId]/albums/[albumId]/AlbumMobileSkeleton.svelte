<script lang="ts">
	import { Disc } from "lucide-svelte";
	import { Skeleton } from "~/lib/components/ui/skeleton";
	import AlbumCover from "~/components/album-cover.svelte";

	interface Props {
		albumId: string;
	}

	let { albumId }: Props = $props();
</script>

<div class="relative">
	<AlbumCover {albumId} albumName="Loading..." class="rounded-none" />
</div>

<div class="px-4 py-2 -translate-y-8 w-full transform">
	<div
		class="py-1 font-display text-3xl font-bold backdrop-blur-xl bg-glass-bg border-glass-border rounded-2xl shadow-[0_4px_24px_-4px_var(--glass-shadow) inset_0_1px_1px_var(--glass-highlight)]
		border text-center"
	>
		&nbsp;
	</div>

	<div class="mt-2 gap-2 flex justify-center">
		<Skeleton class="h-10 w-28 rounded-md" />
		<Skeleton class="h-10 w-32 rounded-md" />
		<Skeleton class="h-10 w-10 rounded-md" />
	</div>
</div>

<div class="py-6">
	<div class="mb-6">
		<div class="gap-2 px-3 py-2 mb-2 text-muted-foreground flex items-center">
			<Disc class="size-4" />
			<span class="text-sm font-medium">Disc 1</span>
		</div>
		{#each [1, 2, 3, 4] as track (track)}
			<div class="rounded-xl px-3 py-3 grid grid-cols-[auto_2.5rem_2.5rem]">
				<div class="gap-4 grid grid-cols-[2rem_auto] items-center">
					<div class="h-6 text-muted-foreground inline-flex items-center justify-center">
						<span class="tabular-nums">{track}</span>
					</div>
					<Skeleton class="h-5 w-32 rounded-md" />
				</div>
			</div>
		{/each}
	</div>
</div>
