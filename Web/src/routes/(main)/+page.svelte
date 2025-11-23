<script lang="ts">
	import LoginForm from "$lib/components/onboarding/login-form.svelte";
	import { Disc3 } from "lucide-svelte";
	import RoomPicker from "~/lib/components/onboarding/room-picker.svelte";
</script>

<svelte:head>
	<title>Reezer</title>
</svelte:head>

<div
	class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
>
	<div class="flex w-full flex-col gap-6">
		<div class="flex items-center gap-2 self-center font-medium">
			<div
				class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
			>
				<Disc3 class="size-4" />
			</div>
			Reezer
		</div>
		<div class="flex flex-row justify-center gap-4">
			<LoginForm />
			<RoomPicker />
		</div>
	</div>
</div>
