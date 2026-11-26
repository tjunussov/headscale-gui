<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import ListToolbar from '$lib/parts/ListToolbar.svelte';
	import SortHead from '$lib/parts/SortHead.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import NodeRoute from '$lib/cards/node/NodeRoute.svelte';
	import { getSortedFilteredNodes, openDrawer } from '$lib/common/funcs';
	import type { Direction, OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';

	let sort = $state('id');
	let dir = $state<Direction>('up');
	let status = $state<OnlineStatus>('all');
	let search = $state('');

	const nodes = $derived(getSortedFilteredNodes(App.nodes.value, search, sort, dir, status, true));
	const withRoutes = $derived(App.nodes.value.filter((n) => n.availableRoutes.length));
	const counts = $derived({ all: withRoutes.length, online: withRoutes.filter((n) => n.online).length, offline: withRoutes.filter((n) => !n.online).length });
	const exit = (r: string) => r === '0.0.0.0/0' || r === '::/0';
</script>

{#snippet kv(label: string, value: string)}
	<div class="flex justify-between gap-4"><span class="text-muted-foreground">{label}</span><span class="truncate text-right font-medium">{value}</span></div>
{/snippet}

<PageHeader title="Routes" description="Subnet and exit-node routes advertised by nodes. Toggle to approve." />

<ListToolbar bind:status bind:search {counts} layout={App.layoutRoute} />

{#if App.layoutRoute.value === 'tile'}
<div class="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
	{#each nodes as node (node.id)}
		<Card.Root class="gap-3">
			<Card.Header>
				<Card.Title><button class="flex items-center gap-2 underline-offset-4 hover:underline" onclick={() => openDrawer('nodeDrawer-' + node.id, node)}><OnlineNodeIndicator {node} />{node.givenName}</button></Card.Title>
				<Card.Description>{node.user.name}</Card.Description>
				{#if node.availableRoutes.some(exit)}<Card.Action><Badge variant="outline">Exit node</Badge></Card.Action>{/if}
			</Card.Header>
			<Card.Content class="divide-y">
				{#each node.availableRoutes as route (route)}<NodeRoute {route} {node} />{/each}
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="col-span-full py-12 text-center text-sm text-muted-foreground">No advertised routes.</p>
	{/each}
</div>
{:else}

<div class="overflow-hidden rounded-lg border">
	<Table.Root>
		<Table.Header class="bg-muted/50">
			<Table.Row>
				<SortHead name="Name" bind:sort bind:dir class="w-1/3" />
				<Table.Head class="hidden sm:table-cell">User</Table.Head>
				<Table.Head>Routes</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each nodes as node (node.id)}
				<Table.Row class="align-top hover:bg-transparent">
					<Table.Cell>
						<button class="flex items-center gap-2 font-medium underline-offset-4 hover:underline" onclick={() => openDrawer('nodeDrawer-' + node.id, node)}>
							<OnlineNodeIndicator {node} />{node.givenName}
						</button>
						{#if node.availableRoutes.some(exit)}<Badge variant="outline" class="mt-1">Exit node</Badge>{/if}
					</Table.Cell>
					<Table.Cell class="hidden text-muted-foreground sm:table-cell">{node.user.name}</Table.Cell>
					<Table.Cell class="max-w-72">
						{#each node.availableRoutes as route (route)}<NodeRoute {route} {node} />{/each}
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row><Table.Cell colspan={3} class="h-24 text-center text-muted-foreground">No advertised routes.</Table.Cell></Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
{/if}
