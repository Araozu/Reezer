<script lang="ts">
	import { ChevronLeft } from "lucide-svelte";

	function goBack()
	{
		history.back();
	}
</script>

<button
	onclick={goBack}
	class="w-8 h-8 rounded-lg hover:bg-glass-bg-hover hover:border-glass-border-hover ease-out
		backdrop-blur-lg inline-flex
		items-center
		justify-center transition-all duration-300
		hover:shadow-[0_4px_12px_-2px_var(--glass-shadow-hover),inset_0_1px_1px_var(--glass-highlight)]
		active:scale-[0.98]"
	aria-label="Go back"
>
	<ChevronLeft class="w-5 h-5" />
</button>
