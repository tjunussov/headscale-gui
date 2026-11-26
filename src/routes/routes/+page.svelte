<script lang="ts">
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import SortFilterBar from '$lib/parts/SortFilterBar.svelte';
	import CardListPage from '$lib/cards/CardListPage.svelte';
	import CardListItem from '$lib/cards/CardListItem.svelte';
	import CardTilePage from '$lib/cards/CardTilePage.svelte';
	import CardTile from '$lib/cards/CardTile.svelte';
	import NodeRoutes from '$lib/cards/node/NodeRoutes.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import { getSortedFilteredNodes, onlineCounts } from '$lib/common/funcs';
	import type { Direction, OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';
	import { uiLoad, uiSave } from '$lib/common/ui';

	const saved = uiLoad('routes', { sortMethod: 'id', sortDirection: 'up' as Direction, filterOnlineStatus: 'all' as OnlineStatus, filterString: '' });
	let sortMethod = $state(saved.sortMethod);
	let sortDirection = $state<Direction>(saved.sortDirection);
	let filterOnlineStatus = $state<OnlineStatus>(saved.filterOnlineStatus);
	let filterString = $state(saved.filterString);
	$effect(() => uiSave('routes', { sortMethod, sortDirection, filterOnlineStatus, filterString }));

	const nodes = $derived(getSortedFilteredNodes(App.nodes.value, filterString, sortMethod, sortDirection, filterOnlineStatus, true));
</script>

<Page>
	<PageHeader title="Routes" layout={App.layoutRoute} bind:filterString>
		<SortFilterBar bind:sortMethod bind:sortDirection bind:filterOnlineStatus sorts={['ID', 'Name']} counts={onlineCounts(App.nodes.value.filter((n) => n.availableRoutes.length), (n) => n.online)} />
	</PageHeader>

	{#if App.layoutRoute.value === 'list'}
		<!-- upstream: route items open by default -->
		<CardListPage open={App.nodes.value.map((n) => n.id)}>
			{#each nodes as node (node.id)}
				<CardListItem id={node.id} label={node.givenName}>
					{#snippet lead()}<OnlineNodeIndicator {node} />{/snippet}
					<NodeRoutes {node} />
				</CardListItem>
			{/each}
		</CardListPage>
	{:else}
		<CardTilePage>
			{#each nodes as node (node.id)}
				<CardTile id={node.id} label={node.givenName}>
					{#snippet lead()}<OnlineNodeIndicator {node} />{/snippet}
					<NodeRoutes {node} />
				</CardTile>
			{/each}
		</CardTilePage>
	{/if}
</Page>
