<script lang="ts">
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import SortFilterBar from '$lib/parts/SortFilterBar.svelte';
	import CardListPage from '$lib/cards/CardListPage.svelte';
	import CardListItem from '$lib/cards/CardListItem.svelte';
	import NodeCreate from '$lib/cards/node/NodeCreate.svelte';
	import NodeInfo from '$lib/cards/node/NodeInfo.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import { getSortedFilteredNodes, onlineCounts, openDrawer, dateToStr, lastSeenText } from '$lib/common/funcs';
	import type { Direction, Node, OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';

	let showCreate = $state(false);
	let sortMethod = $state('id');
	let sortDirection = $state<Direction>('up');
	let filterOnlineStatus = $state<OnlineStatus>('all');
	let filterString = $state('');

	const nodes = $derived(getSortedFilteredNodes(App.nodes.value, filterString, sortMethod, sortDirection, filterOnlineStatus));
	const ipv4 = (ips: string[]) => ips.find((s) => /^\d+\.\d+\.\d+\.\d+$/.test(s)) ?? ips[0] ?? '—';
	const tags = (n: Node) => [...new Set(n.tags ?? [])].map((t) => t.replace('tag:', ''));
	const routes = (n: Node) => (n.availableRoutes.length ? `${n.approvedRoutes.length}/${n.availableRoutes.length} approved` : '—');
	const open = (n: Node) => openDrawer('nodeDrawer-' + n.id, n);
	// table headers share the SortFilterBar state: click = sort by column, click again = flip direction
	const sortBy = (key: string) => (sortMethod === key ? (sortDirection = sortDirection === 'up' ? 'down' : 'up') : ((sortMethod = key), (sortDirection = 'up')));
</script>

{#snippet kv(label: string, value: string)}
	<div class="flex justify-between gap-4"><span class="text-muted-foreground">{label}</span><span class="truncate text-right font-medium">{value}</span></div>
{/snippet}

{#snippet head(label: string, key: string, cls = '')}
	<Table.Head class={cls}>
		<button class="inline-flex items-center gap-1 hover:text-foreground" onclick={() => sortBy(key)}>
			{label}
			{#if sortMethod === key}{#if sortDirection === 'up'}<ArrowUp class="size-3.5" />{:else}<ArrowDown class="size-3.5" />{/if}{/if}
		</button>
	</Table.Head>
{/snippet}

<Page>
	<PageHeader title="Nodes" layout={App.layoutNode} layouts={['tile', 'list', 'table']} bind:show={showCreate} bind:filterString>
		{#snippet button()}<NodeCreate bind:show={showCreate} />{/snippet}
	</PageHeader>

	<SortFilterBar bind:sortMethod bind:sortDirection bind:filterOnlineStatus sorts={['ID', 'Name', 'Last Seen']} counts={onlineCounts(App.nodes.value, (n) => n.online)} />

	{#if App.layoutNode.value === 'list'}
		<CardListPage>
			{#each nodes as node (node.id)}
				<CardListItem id={node.id} label={node.givenName}>
					{#snippet lead()}<OnlineNodeIndicator {node} />{/snippet}
					<NodeInfo {node} />
				</CardListItem>
			{/each}
		</CardListPage>
	{:else if App.layoutNode.value === 'tile'}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each nodes as node (node.id)}
				<Card.Root class="cursor-pointer gap-4 transition-colors hover:border-foreground/25" role="button" tabindex={0} onclick={() => open(node)} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && open(node)}>
					<Card.Header>
						<Card.Title class="truncate">{node.givenName}</Card.Title>
						<Card.Description>#{node.id} · {node.user.name}</Card.Description>
						<Card.Action><OnlineNodeIndicator {node} label /></Card.Action>
					</Card.Header>
					<Card.Content class="grid gap-1.5 text-sm">
						{@render kv('Address', ipv4(node.ipAddresses))}
						{@render kv('Last Seen', lastSeenText(node))}
						{@render kv('Created', dateToStr(node.createdAt))}
						{@render kv('Routes', routes(node))}
					</Card.Content>
					{#if tags(node).length}
						<Card.Footer class="flex-wrap gap-1">{#each tags(node) as t}<Badge variant="secondary">{t}</Badge>{/each}</Card.Footer>
					{/if}
				</Card.Root>
			{:else}
				<p class="col-span-full py-12 text-center text-sm text-muted-foreground">No nodes.</p>
			{/each}
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border">
			<Table.Root>
				<Table.Header class="bg-muted/50">
					<Table.Row>
						{@render head('ID', 'id', 'w-16')}
						{@render head('Name', 'name')}
						{@render head('User', 'user', 'hidden sm:table-cell')}
						<Table.Head>Address</Table.Head>
						<Table.Head class="hidden lg:table-cell">Tags</Table.Head>
						<Table.Head class="hidden xl:table-cell">Routes</Table.Head>
						{@render head('Last Seen', 'lastseen', 'hidden md:table-cell')}
						<Table.Head class="w-24">Status</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each nodes as node (node.id)}
						<Table.Row class="cursor-pointer" onclick={() => open(node)}>
							<Table.Cell class="text-muted-foreground tabular-nums">{node.id}</Table.Cell>
							<Table.Cell>
								<div class="font-medium">{node.givenName}</div>
								{#if node.name !== node.givenName}<div class="text-xs text-muted-foreground">{node.name}</div>{/if}
							</Table.Cell>
							<Table.Cell class="hidden sm:table-cell">{node.user.name}</Table.Cell>
							<Table.Cell class="font-mono text-xs">{ipv4(node.ipAddresses)}</Table.Cell>
							<Table.Cell class="hidden lg:table-cell"><div class="flex flex-wrap gap-1">{#each tags(node) as t}<Badge variant="secondary">{t}</Badge>{/each}</div></Table.Cell>
							<Table.Cell class="hidden tabular-nums text-muted-foreground xl:table-cell">{node.availableRoutes.length ? `${node.approvedRoutes.length}/${node.availableRoutes.length}` : '—'}</Table.Cell>
							<Table.Cell class="hidden text-muted-foreground md:table-cell">{lastSeenText(node)}</Table.Cell>
							<Table.Cell><OnlineNodeIndicator {node} label /></Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row><Table.Cell colspan={8} class="h-24 text-center text-muted-foreground">No nodes.</Table.Cell></Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</Page>
