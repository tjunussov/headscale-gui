<script lang="ts">
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import SortFilterBar from '$lib/parts/SortFilterBar.svelte';
	import CardListPage from '$lib/cards/CardListPage.svelte';
	import CardListItem from '$lib/cards/CardListItem.svelte';
	import CardTilePage from '$lib/cards/CardTilePage.svelte';
	import CardTile from '$lib/cards/CardTile.svelte';
	import CardTileEntry from '$lib/cards/CardTileEntry.svelte';
	import UserCreate from '$lib/cards/user/UserCreate.svelte';
	import UserInfo from '$lib/cards/user/UserInfo.svelte';
	import OnlineUserIndicator from '$lib/parts/OnlineUserIndicator.svelte';
	import { getSortedFilteredUsers, onlineCounts, openDrawer, dateToStr } from '$lib/common/funcs';
	import { getUserDisplay, type Direction, type OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';

	let showCreate = $state(false);
	let sortMethod = $state('id');
	let sortDirection = $state<Direction>('up');
	let filterOnlineStatus = $state<OnlineStatus>('all');
	let filterString = $state('');

	const users = $derived(getSortedFilteredUsers(App.users.value, filterString, sortMethod, sortDirection, filterOnlineStatus));
	const nodeCount = (id: string) => App.nodes.value.filter((n) => n.user.id === id).length;
</script>

<Page>
	<PageHeader title="Users" layout={App.layoutUser} bind:show={showCreate} bind:filterString>
		{#snippet button()}<UserCreate bind:show={showCreate} />{/snippet}
		<SortFilterBar bind:sortMethod bind:sortDirection bind:filterOnlineStatus sorts={['ID', 'Name']} counts={onlineCounts(App.users.value, (u) => App.nodes.value.some((n) => n.online && n.user.id === u.id))} />
	</PageHeader>

	{#if App.layoutUser.value === 'list'}
		<CardListPage>
			{#each users as user (user.id)}
				<CardListItem id={user.id} label={getUserDisplay(user)}>
					{#snippet lead()}<OnlineUserIndicator {user} />{/snippet}
					<UserInfo {user} />
				</CardListItem>
			{/each}
		</CardListPage>
	{:else}
		<CardTilePage>
			{#each users as user (user.id)}
				<CardTile id={user.id} label={getUserDisplay(user)} onclick={() => openDrawer('userDrawer-' + user.id, user)}>
					{#snippet lead()}<OnlineUserIndicator {user} />{/snippet}
					<CardTileEntry title="Created:">{dateToStr(user.createdAt)}</CardTileEntry>
					<CardTileEntry title="Machines:">{nodeCount(user.id)}</CardTileEntry>
				</CardTile>
			{/each}
		</CardTilePage>
	{/if}
</Page>
