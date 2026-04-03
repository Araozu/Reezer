<script lang="ts">
	import { Skeleton } from "~/lib/components/ui/skeleton";
</script>

<div
	class="
		gap-3 rounded-xl bg-glass-bg border-glass-border backdrop-blur-xl
		flex w-full flex-col
		overflow-hidden
		border
		shadow-[0_2px_12px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]
	"
>
	<Skeleton class="aspect-video w-full" />

	<div class="px-3 pb-3 space-y-2">
		<Skeleton class="h-5 w-3/4" />
		<Skeleton class="h-4 w-1/2" />
	</div>
</div>
