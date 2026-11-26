<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import ListToolbar from '$lib/parts/ListToolbar.svelte';
	import SortHead from '$lib/parts/SortHead.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import NodeCreate from '$lib/cards/node/NodeCreate.svelte';
	import { getSortedFilteredNodes, openDrawer, lastSeenText, dateToStr } from '$lib/common/funcs';
	import type { Direction, OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';

	let sort = $state('id');
	let dir = $state<Direction>('up');
	let status = $state<OnlineStatus>('all');
	let search = $state('');

	const rows = $derived(getSortedFilteredNodes(App.nodes.value, search, sort, dir, status));
	const counts = $derived({
		all: App.nodes.value.length,
		online: App.nodes.value.filter((n) => n.online).length,
		offline: App.nodes.value.filter((n) => !n.online).length,
	});
	const ipv4 = (ips: string[]) => ips.find((s) => /^\d+\.\d+\.\d+\.\d+$/.test(s)) ?? ips[0];
	const tags = (n: (typeof rows)[number]) => [...new Set([...n.forcedTags, ...n.validTags])].map((t) => t.replace('tag:', ''));
</script>

{#snippet kv(label: string, value: string)}
	<div class="flex justify-between gap-4"><span class="text-muted-foreground">{label}</span><span class="truncate text-right font-medium">{value}</span></div>
{/snippet}

<PageHeader title="Nodes" description="Devices registered to the tailnet.">
	{#snippet actions()}<NodeCreate />{/snippet}
</PageHeader>

<ListToolbar bind:status bind:search {counts} layout={App.layoutNode} />

{#if App.layoutNode.value === 'tile'}
<div class="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
	{#each rows as node (node.id)}
		<Card.Root class="cursor-pointer gap-4 transition-colors hover:border-foreground/25" role="button" tabindex={0} onclick={() => openDrawer('nodeDrawer-' + node.id, node)} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && openDrawer('nodeDrawer-' + node.id, node)}>
			<Card.Header>
				<Card.Title class="truncate">{node.givenName}</Card.Title>
				<Card.Description>#{node.id} · {node.user.name}</Card.Description>
				<Card.Action><OnlineNodeIndicator {node} label /></Card.Action>
			</Card.Header>
			<Card.Content class="grid gap-1.5 text-sm">
				{@render kv('Address', ipv4(node.ipAddresses))}
				{@render kv('Last seen', lastSeenText(node))}
				{@render kv('Created', dateToStr(node.createdAt))}
				{@render kv('Routes', node.availableRoutes.length ? `${node.approvedRoutes.length}/${node.availableRoutes.length} approved` : '—')}
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
				<SortHead name="ID" bind:sort bind:dir class="w-16" />
				<SortHead name="Name" bind:sort bind:dir />
				<SortHead name="User" bind:sort bind:dir class="hidden sm:table-cell" />
				<Table.Head>Address</Table.Head>
				<Table.Head class="hidden lg:table-cell">Tags</Table.Head>
				<Table.Head class="hidden xl:table-cell">Routes</Table.Head>
				<SortHead name="Last seen" key="lastseen" bind:sort bind:dir class="hidden md:table-cell" />
				<Table.Head class="w-24">Status</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each rows as node (node.id)}
				<Table.Row class="cursor-pointer" onclick={() => openDrawer('nodeDrawer-' + node.id, node)}>
					<Table.Cell class="text-muted-foreground tabular-nums">{node.id}</Table.Cell>
					<Table.Cell>
						<div class="font-medium">{node.givenName}</div>
						{#if node.name !== node.givenName}<div class="text-xs text-muted-foreground">{node.name}</div>{/if}
					</Table.Cell>
					<Table.Cell class="hidden sm:table-cell">{node.user.name}</Table.Cell>
					<Table.Cell class="font-mono text-xs">{ipv4(node.ipAddresses)}</Table.Cell>
					<Table.Cell class="hidden lg:table-cell">
						<div class="flex flex-wrap gap-1">{#each tags(node) as t}<Badge variant="secondary">{t}</Badge>{/each}</div>
					</Table.Cell>
					<Table.Cell class="hidden tabular-nums text-muted-foreground xl:table-cell">
						{#if node.availableRoutes.length}{node.approvedRoutes.length}/{node.availableRoutes.length}{:else}—{/if}
					</Table.Cell>
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
