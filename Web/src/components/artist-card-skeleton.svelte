<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title class="font-display flex justify-center py-8">
			<Skeleton class="inline-block w-32 h-6 rounded-lg" />
		</Card.Title>
	</Card.Header>
</Card.Root>
