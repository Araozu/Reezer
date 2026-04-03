<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<Card.Root class="w-full">
	<Card.Content>
		<Skeleton class="rounded-xl aspect-square w-full object-cover" />
	</Card.Content>
	<Card.Header>
		<Card.Title class="font-display">
			<Skeleton class="w-32 h-4 rounded-lg inline-block" />
		</Card.Title>
		<Card.Description>
			<Skeleton class="w-24 h-4 rounded-lg inline-block" />
		</Card.Description>
	</Card.Header>
</Card.Root>
