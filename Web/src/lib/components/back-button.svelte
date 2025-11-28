<script lang="ts">
	import { ChevronLeft } from "lucide-svelte";

	function goBack() {
		history.back();
	}
</script>

<button
	onclick={goBack}
	class="inline-flex items-center justify-center w-8 h-8 rounded-lg
		hover:bg-glass-bg-hover hover:border-glass-border-hover
		active:scale-[0.98]
		transition-all duration-300 ease-out
		hover:shadow-[0_4px_12px_-2px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)]
		backdrop-blur-lg"
	aria-label="Go back"
>
	<ChevronLeft class="w-5 h-5" />
</button>
