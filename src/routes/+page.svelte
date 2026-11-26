<script lang="ts">
	import CardTileContainer from '$lib/cards/CardTileContainer.svelte';
	import CardTilePage from '$lib/cards/CardTilePage.svelte';
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { isExpired } from '$lib/common/funcs';

	import RawMdiDevices from '~icons/mdi/devices';
	import RawMdiRouter from '~icons/mdi/devices';
	import RawMdiUser from '~icons/mdi/user';

	import { App } from '$lib/States.svelte';

	type Summary = {
		title: string;
		value: any;
		icon: any;
		path: string;
	};

	const summaries = $derived<Summary[]>(
		[
			{
				title: 'Total Users',
				icon: RawMdiUser,
				value: App.users.value.length,
				path: '/users',
			},
			{
				title: 'Online Users',
				icon: RawMdiUser,
				value: App.users.value.filter((user) =>
					App.nodes.value
						.filter((node) => node.online)
						.some((node) => node.user.id === user.id),
				).length,
				path: '/users',
			},
			{
				title: 'Valid PreAuth Keys',
				icon: RawMdiDevices,
				value: App.preAuthKeys.value.filter(
					(pak) => !isExpired(pak.expiration) && !(pak.used && !pak.reusable),
				).length,
				path: '/users',
			},
			{
				title: 'Total Nodes',
				icon: RawMdiDevices,
				value: App.nodes.value.length,
				path: '/nodes',
			},
			{
				title: 'Online Nodes',
				icon: RawMdiDevices,
				value: App.nodes.value.filter((n) => n.online).length,
				path: '/nodes',
			},
			{
				title: 'Total Routes',
				icon: RawMdiRouter,
				value: App.nodes.value.reduce(
					(acc, node) => acc + (node.availableRoutes ? node.availableRoutes.length : 0),
					0,
				),
				path: '/routes',
			},
		]
	);
</script>

<Page>
	<PageHeader title="Home" />

	<CardTilePage>
		{#each summaries as summary}
			<CardTileContainer onclick={() => goto(base + summary.path)}>
				<div class="flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
					{summary.title}<summary.icon />
				</div>
				<div class="text-left text-3xl font-semibold tracking-tight pt-2">{summary.value}</div>
			</CardTileContainer>
		{/each}
	</CardTilePage>
</Page>
