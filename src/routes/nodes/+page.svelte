<script lang="ts">
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import SortFilterBar from '$lib/parts/SortFilterBar.svelte';
	import CardListPage from '$lib/cards/CardListPage.svelte';
	import CardListItem from '$lib/cards/CardListItem.svelte';
	import CardTilePage from '$lib/cards/CardTilePage.svelte';
	import CardTile from '$lib/cards/CardTile.svelte';
	import CardTileEntry from '$lib/cards/CardTileEntry.svelte';
	import NodeCreate from '$lib/cards/node/NodeCreate.svelte';
	import NodeInfo from '$lib/cards/node/NodeInfo.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import OnlineUserIndicator from '$lib/parts/OnlineUserIndicator.svelte';
	import { getSortedFilteredNodes, openDrawer, dateToStr, lastSeenText } from '$lib/common/funcs';
	import type { Direction, OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';

	let showCreate = $state(false);
	let sortMethod = $state('id');
	let sortDirection = $state<Direction>('up');
	let filterOnlineStatus = $state<OnlineStatus>('all');
	let filterString = $state('');

	const nodes = $derived(getSortedFilteredNodes(App.nodes.value, filterString, sortMethod, sortDirection, filterOnlineStatus));
	const ipv4 = (ips: string[]) => ips.find((s) => /^\d+\.\d+\.\d+\.\d+$/.test(s));
</script>

<Page>
	<PageHeader title="Nodes" layout={App.layoutNode} bind:show={showCreate} bind:filterString>
		{#snippet button()}<NodeCreate bind:show={showCreate} />{/snippet}
	</PageHeader>

	<SortFilterBar bind:sortMethod bind:sortDirection bind:filterOnlineStatus sorts={['ID', 'Name', 'Last Seen']} />

	{#if App.layoutNode.value === 'list'}
		<CardListPage>
			{#each nodes as node (node.id)}
				<CardListItem id={node.id} label={node.givenName}>
					{#snippet lead()}<OnlineNodeIndicator {node} />{/snippet}
					<NodeInfo {node} />
				</CardListItem>
			{/each}
		</CardListPage>
	{:else}
		<CardTilePage>
			{#each nodes as node (node.id)}
				<CardTile id={node.id} label={node.givenName} onclick={() => openDrawer('nodeDrawer-' + node.id, node)}>
					{#snippet lead()}<OnlineNodeIndicator {node} />{/snippet}
					<CardTileEntry title="Created:">{dateToStr(node.createdAt)}</CardTileEntry>
					<CardTileEntry title="Last Seen:">{lastSeenText(node)}</CardTileEntry>
					<CardTileEntry title="User:">{node.user.name}<OnlineUserIndicator user={node.user} /></CardTileEntry>
					<CardTileEntry title="IPv4 Address:">{ipv4(node.ipAddresses)}</CardTileEntry>
					<CardTileEntry title="Routes:">{node.availableRoutes.length}</CardTileEntry>
				</CardTile>
			{/each}
		</CardTilePage>
	{/if}
</Page>
