<script>
	import MainPage from "./main-page.svelte";
	import BackButton from "$lib/components/back-button.svelte";
</script>

<svelte:head>
	<title>Reezer - Random Albums</title>
</svelte:head>

<h1 class="font-display text-4xl font-semibold py-8 px-4 flex items-center gap-3">
	<BackButton />
	Random Albums
</h1>

<MainPage />
