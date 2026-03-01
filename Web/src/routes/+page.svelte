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

<div class="gap-6 p-6 md:p-10 flex min-h-svh flex-col items-center justify-center">
	<div class="gap-6 flex w-full flex-col items-center justify-center">
		<div class="gap-2 font-medium flex items-center self-center">
			<div
				class="bg-primary text-primary-foreground size-6 rounded-lg flex items-center justify-center"
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
