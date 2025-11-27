<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<Card.Root class="w-full">
	<Card.Content>
		<Skeleton
			class="rounded-xl w-full aspect-square object-cover"
		/>
	</Card.Content>
	<Card.Header>
		<Card.Title class="font-display">
			<Skeleton class="inline-block w-32 h-4 rounded-lg" />
		</Card.Title>
		<Card.Description>
			<Skeleton class="inline-block w-24 h-4 rounded-lg" />
		</Card.Description>
	</Card.Header>
</Card.Root>
