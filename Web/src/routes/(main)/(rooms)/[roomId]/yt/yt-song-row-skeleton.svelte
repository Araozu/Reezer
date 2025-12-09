<script lang="ts">
	import { Skeleton } from "~/lib/components/ui/skeleton";
</script>

<div
	class="
		w-full flex flex-col gap-3 rounded-xl
		bg-glass-bg border border-glass-border
		backdrop-blur-xl
		shadow-[0_2px_12px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]
		overflow-hidden
	"
>
	<Skeleton class="w-full aspect-video" />

	<div class="px-3 pb-3 space-y-2">
		<Skeleton class="h-5 w-3/4" />
		<Skeleton class="h-4 w-1/2" />
	</div>
</div>
