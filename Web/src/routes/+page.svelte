<script lang="ts">
	import LoginForm from "$lib/components/onboarding/login-form.svelte";
	import { Disc3 } from "lucide-svelte";
	import RoomPicker from "~/lib/components/onboarding/room-picker.svelte";
	import LavaBackground from "$lib/components/lava-background.svelte";
	import { useCurrentUser } from "./queries";

	const currentUser = useCurrentUser();

	const userLoading = $derived($currentUser.isLoading);
	const user = $derived($currentUser.data ?? null);
</script>

<svelte:head>
	<title>Reezer</title>
</svelte:head>

<LavaBackground />

<div
	class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
>
	<div class="flex w-full flex-col justify-center items-center gap-6">
		<div class="flex items-center gap-2 self-center font-medium">
			<div
				class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
			>
				<Disc3 class="size-4" />
			</div>
			Reezer
		</div>
		{#if user}
			<RoomPicker />
		{:else}
			<LoginForm loading={userLoading} loggedIn={!!user} />
		{/if}
	</div>
</div>
