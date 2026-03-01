<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title class="font-display py-8 flex justify-center">
			<Skeleton class="w-32 h-6 rounded-lg inline-block" />
		</Card.Title>
	</Card.Header>
</Card.Root>
