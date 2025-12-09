<script lang="ts">
	import { Card, CardContent, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { ArrowRight } from "lucide-svelte";
	import { getContext } from "svelte";
	import type { IAudioBackend } from "~/player2/interfaces/IAudioBackend";

	const audioBackend: IAudioBackend = getContext("audio");
</script>

<button
	class="h-screen w-screen flex items-center justify-center"
	onclick={() => audioBackend.Init()}
>
	<Card>
		<CardContent class="p-6">
			<CardTitle class="mb-4">Let's go</CardTitle>
			<Button class="w-full">
				<ArrowRight class="w-4 h-4" />
			</Button>
		</CardContent>
	</Card>
</button>
