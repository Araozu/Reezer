<script lang="ts">
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	let {
		totalCount,
		pageSize,
		requestPage = $bindable(),
	}: {
		totalCount: number;
		pageSize: number;
		requestPage: number;
	} = $props();

	let cachedPageNumber = $state(requestPage);

	function UpdateUrlQuery(requestPage: number)
	{
		let query = page.url.searchParams;
		query.set("page", requestPage.toString());
		goto(`?${query.toString()}`);
	}

	$effect(() =>
	{
		if (requestPage == cachedPageNumber) return;

		UpdateUrlQuery(requestPage);
		cachedPageNumber = requestPage;
	});
</script>

<div class="py-4">
	<Pagination.Root
		bind:page={requestPage}
		count={totalCount}
		perPage={pageSize}
		siblingCount={2}
	>
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === "ellipsis"}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link
								{page}
								isActive={currentPage ===
									page.value}
							>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</div>
