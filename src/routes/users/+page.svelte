<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import ListToolbar from '$lib/parts/ListToolbar.svelte';
	import SortHead from '$lib/parts/SortHead.svelte';
	import OnlineUserIndicator from '$lib/parts/OnlineUserIndicator.svelte';
	import UserCreate from '$lib/cards/user/UserCreate.svelte';
	import { getSortedFilteredUsers, openDrawer, dateToStr } from '$lib/common/funcs';
	import { getUserDisplay, type Direction, type OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';

	let sort = $state('id');
	let dir = $state<Direction>('up');
	let status = $state<OnlineStatus>('all');
	let search = $state('');

	const rows = $derived(getSortedFilteredUsers(App.users.value, search, sort, dir, status));
	const count = (s: OnlineStatus) => getSortedFilteredUsers(App.users.value, '', 'id', 'up', s).length;
	const counts = $derived({ all: count('all'), online: count('online'), offline: count('offline') });
	const nodeCount = (id: string) => App.nodes.value.filter((n) => n.user.id === id).length;
</script>

<PageHeader title="Users" description="People and namespaces that own nodes.">
	{#snippet actions()}<UserCreate />{/snippet}
</PageHeader>

<ListToolbar bind:status bind:search {counts} />

<div class="overflow-hidden rounded-lg border">
	<Table.Root>
		<Table.Header class="bg-muted/50">
			<Table.Row>
				<SortHead name="ID" bind:sort bind:dir class="w-16" />
				<SortHead name="Name" bind:sort bind:dir />
				<Table.Head>Provider</Table.Head>
				<Table.Head class="text-right">Nodes</Table.Head>
				<Table.Head class="hidden md:table-cell">Created</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each rows as user (user.id)}
				<Table.Row class="cursor-pointer" onclick={() => openDrawer('userDrawer-' + user.id, user)}>
					<Table.Cell class="text-muted-foreground tabular-nums">{user.id}</Table.Cell>
					<Table.Cell>
						<div class="flex items-center gap-2">
							<OnlineUserIndicator {user} />
							<span class="font-medium">{getUserDisplay(user)}</span>
							{#if user.email}<span class="hidden text-muted-foreground lg:inline">{user.email}</span>{/if}
						</div>
					</Table.Cell>
					<Table.Cell><Badge variant="outline" class="text-muted-foreground">{user.provider || 'local'}</Badge></Table.Cell>
					<Table.Cell class="text-right tabular-nums">{nodeCount(user.id)}</Table.Cell>
					<Table.Cell class="hidden text-muted-foreground md:table-cell">{dateToStr(user.createdAt)}</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row><Table.Cell colspan={5} class="h-24 text-center text-muted-foreground">No users.</Table.Cell></Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
