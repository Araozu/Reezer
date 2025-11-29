<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldSeparator,
	} from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { CircleArrowRight, LoaderCircle } from "lucide-svelte";
	import Disc_3 from "lucide-svelte/icons/disc-3";

	let { loading, loggedIn }: { loading: boolean; loggedIn: boolean } =
		$props();
	const id = $props.id();

	let loadingLogin = $state(false);
	let spinnerClass = $derived(loadingLogin ? "opacity-100" : "opacity-0");

	function handleGoogleLogin()
	{
		const returnUrl = encodeURIComponent(`${window.location.origin}/`);
		loadingLogin = true;
		window.location.href = `/api/auth/google?returnUrl=${returnUrl}`;
	}
</script>

<Card.Root class="w-sm h-120">
	{#if loading}
		<Card.Content
			class="flex flex-col gap-2 justify-center items-center h-full w-full"
		>
			<LoaderCircle class="animate-spin" />
			<p>Loading session state</p>
		</Card.Content>
	{:else if loggedIn}
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Welcome back</Card.Title>
		</Card.Header>
		<Card.Content
			class="flex flex-col gap-6 justify-center items-center h-full w-full"
		>
			<p class="text-center">
				You are logged in.
				<br />
				Use the Room form to join
			</p>
			<CircleArrowRight class="opacity-75" size={48} />
		</Card.Content>
	{:else}
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Welcome back</Card.Title>
		</Card.Header>
		<Card.Content>
			<form>
				<FieldGroup>
					<Field>
						<Button
							variant="outline"
							type="button"
							onclick={handleGoogleLogin}
						>
							<Disc_3 class={`animate-spin transition-opacity ${spinnerClass}`} />
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
							>
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
							Login with Google
						</Button>
					</Field>
					<FieldSeparator
						class="*:data-[slot=field-separator-content]:bg-card"
					>
						Or continue with
					</FieldSeparator>
					<Field>
						<FieldLabel for="email-{id}">
							Email
						</FieldLabel>
						<Input
							id="email-{id}"
							type="email"
							placeholder="m@example.com"
							required
							disabled
						/>
					</Field>
					<Field>
						<div class="flex items-center">
							<FieldLabel
								for="password-{id}"
							>
								Password
							</FieldLabel>
						</div>
						<Input
							id="password-{id}"
							type="password"
							required
							disabled
						/>
					</Field>
					<Field>
						<Button type="submit" disabled
							>Login</Button
						>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	{/if}
</Card.Root>
