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

<div class="w-full px-4 py-2 transform -translate-y-8">
	<div class="py-1 font-display text-3xl font-bold text-center backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl
		shadow-[0_4px_24px_-4px_var(--glass-shadow) inset_0_1px_1px_var(--glass-highlight)]">
		&nbsp;
	</div>

	<div class="mt-2 flex justify-center gap-2">
		<Skeleton class="h-10 w-28 rounded-md" />
		<Skeleton class="h-10 w-32 rounded-md" />
	</div>
</div>

<div class="py-6">
	<div class="mb-6">
		<div class="flex items-center gap-2 px-3 py-2 mb-2 text-muted-foreground">
			<Disc class="size-4" />
			<span class="text-sm font-medium">Disc 1</span>
		</div>
		{#each [1, 2, 3, 4] as track (track)}
			<div class="grid grid-cols-[auto_2.5rem_2.5rem] rounded-xl px-3 py-3">
				<div class="grid grid-cols-[2rem_auto] gap-4 items-center">
					<div class="inline-flex items-center justify-center h-6 text-muted-foreground">
						<span class="tabular-nums">{track}</span>
					</div>
					<Skeleton class="h-5 w-32 rounded" />
				</div>
			</div>
		{/each}
	</div>
</div>
