<script lang="ts">
	import { Skeleton } from "~/lib/components/ui/skeleton";
</script>

<div
	class="
		w-full flex items-center gap-4 p-3 rounded-xl
		bg-glass-bg border border-glass-border
		backdrop-blur-xl
		shadow-[0_2px_12px_-2px_var(--glass-shadow),inset_0_1px_1px_var(--glass-highlight)]
	"
>
	<Skeleton class="w-28 h-16 flex-shrink-0 rounded-lg" />

	<div class="flex-1 space-y-2 min-w-0">
		<Skeleton class="h-5 w-3/4" />
		<Skeleton class="h-4 w-1/2" />
	</div>
</div>
