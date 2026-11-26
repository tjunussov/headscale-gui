<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
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

{#snippet kv(label: string, value: string)}
	<div class="flex justify-between gap-4"><span class="text-muted-foreground">{label}</span><span class="truncate text-right font-medium">{value}</span></div>
{/snippet}

<PageHeader title="Users" description="People and namespaces that own nodes.">
	{#snippet actions()}<UserCreate />{/snippet}
</PageHeader>

<ListToolbar bind:status bind:search {counts} layout={App.layoutUser} />

{#if App.layoutUser.value === 'tile'}
<div class="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
	{#each rows as user (user.id)}
		<Card.Root class="cursor-pointer gap-4 transition-colors hover:border-foreground/25" role="button" tabindex={0} onclick={() => openDrawer('userDrawer-' + user.id, user)} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && openDrawer('userDrawer-' + user.id, user)}>
			<Card.Header>
				<Card.Title class="truncate">{getUserDisplay(user)}</Card.Title>
				<Card.Description class="truncate">#{user.id}{user.email ? ` · ${user.email}` : ''}</Card.Description>
				<Card.Action><OnlineUserIndicator {user} label /></Card.Action>
			</Card.Header>
			<Card.Content class="grid gap-1.5 text-sm">
				{@render kv('Nodes', String(nodeCount(user.id)))}
				{@render kv('Provider', user.provider || 'local')}
				{@render kv('Created', dateToStr(user.createdAt))}
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="col-span-full py-12 text-center text-sm text-muted-foreground">No users.</p>
	{/each}
</div>
{:else}

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
{/if}
