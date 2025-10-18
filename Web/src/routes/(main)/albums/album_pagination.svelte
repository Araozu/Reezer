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

	let pageCount = $derived(Math.ceil(totalCount / pageSize));

	function UpdateUrlQuery() {
		let query = page.url.searchParams;
		query.set("page", requestPage.toString());
		goto(`?${query.toString()}`);
	}

	function PreviousPage() {
		if (requestPage > 1) {
			requestPage -= 1;
			UpdateUrlQuery();
		}
	}

	function NextPage() {
		if (requestPage < pageCount) {
			requestPage += 1;
			UpdateUrlQuery();
		}
	}

	function GoToPage(n: number) {
		requestPage = n;
		UpdateUrlQuery();
	}
</script>

<Pagination.Root bind:page={requestPage} count={totalCount} perPage={pageSize}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton onclick={PreviousPage} />
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
							onclick={() => {
								GoToPage(
									page.value,
								);
							}}
						>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton onclick={NextPage} />
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
