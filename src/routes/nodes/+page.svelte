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
	import Network from '@lucide/svelte/icons/network';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Route from '@lucide/svelte/icons/route';
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
	// ponytail: dateToStr gives "MM/DD/YYYY, hh:mm"; tiles show the date part only
	const open = (n: Node) => openDrawer('nodeDrawer-' + n.id, n);
	// table headers share the SortFilterBar state: click = sort by column, click again = flip direction
	const sortBy = (key: string) => (sortMethod === key ? (sortDirection = sortDirection === 'up' ? 'down' : 'up') : ((sortMethod = key), (sortDirection = 'up')));
</script>


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
		<SortFilterBar bind:sortMethod bind:sortDirection bind:filterOnlineStatus sorts={['ID', 'Name', 'Last Seen']} counts={onlineCounts(App.nodes.value, (n) => n.online)} />
	</PageHeader>

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
		<!-- as many ≥240px columns as fit: 4 at ~1100px content, 5+ on wider screens -->
		<div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
			{#each nodes as node (node.id)}
				<!-- compact tile; offline nodes dimmed (full opacity on hover/focus) -->
				<Card.Root
					class="cursor-pointer gap-3 [--card-spacing:--spacing(3.5)] transition hover:border-foreground/25 {node.online ? '' : 'opacity-50 hover:opacity-100 focus-visible:opacity-100'}"
					role="button"
					tabindex={0}
					onclick={() => open(node)}
					onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && open(node)}
				>
					<Card.Header class="gap-0.5">
						<Card.Title class="truncate">{node.givenName}</Card.Title>
						<Card.Description class="truncate text-xs">#{node.id} · {node.user.name}</Card.Description>
						<Card.Action class="flex flex-col items-end gap-0.5">
							<OnlineNodeIndicator {node} label />
							{#if !node.online}<span class="text-[11px] text-muted-foreground">{lastSeenText(node)}</span>{/if}
						</Card.Action>
					</Card.Header>
					<!-- no labels: icon + value (title attr names the field) -->
					<Card.Content class="flex flex-row flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
						<span class="flex items-center gap-1 font-mono text-foreground" title="IPv4 address"><Network class="size-3.5 text-muted-foreground" />{ipv4(node.ipAddresses)}</span>
						<span class="flex items-center gap-1" title="Created"><CalendarDays class="size-3.5" />{dateToStr(node.createdAt).split(',')[0]}</span>
						{#if node.availableRoutes.length}<span class="flex items-center gap-1" title="Approved / advertised routes"><Route class="size-3.5" />{node.approvedRoutes.length}/{node.availableRoutes.length}</span>{/if}
						{#if tags(node).length}
							<div class="flex w-full flex-wrap gap-1">{#each tags(node) as t}<Badge variant="secondary" class="h-5 px-1.5 text-[11px]">{t}</Badge>{/each}</div>
						{/if}
					</Card.Content>
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
