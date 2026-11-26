<script lang="ts">
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import SortFilterBar from '$lib/parts/SortFilterBar.svelte';
	import CardListPage from '$lib/cards/CardListPage.svelte';
	import CardListItem from '$lib/cards/CardListItem.svelte';
	import AddDeviceDialog from '$lib/cards/node/AddDeviceDialog.svelte';
	import NodeInfo from '$lib/cards/node/NodeInfo.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import Download from '@lucide/svelte/icons/download';
	import { Button } from '$lib/components/ui/button/index.js';
	import MachineMenu from '$lib/parts/MachineMenu.svelte';
	import MachineIp from '$lib/parts/MachineIp.svelte';
	import { getSortedFilteredNodes, onlineCounts, lastSeenText, machinePills, machineHref } from '$lib/common/funcs';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import type { Direction, Node, OnlineStatus } from '$lib/common/types';
	import { App } from '$lib/States.svelte';

	let showCreate = $state(false);
	let sortMethod = $state('id');
	let sortDirection = $state<Direction>('up');
	let filterOnlineStatus = $state<OnlineStatus>('all');
	let filterString = $state('');

	const nodes = $derived(getSortedFilteredNodes(App.nodes.value, filterString, sortMethod, sortDirection, filterOnlineStatus));
	const tags = (n: Node) => [...new Set(n.tags ?? [])].map((t) => t.replace('tag:', ''));
	// machine opens its own page (Tailscale-style), e.g. /nodes/100.64.0.6/
	const open = (n: Node) => goto(base + machineHref(n));
	const pills = machinePills;
	function exportCsv() {
		const q = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
		const rows = nodes.map((n) => [n.id, n.givenName, n.name, n.user.name, n.ipAddresses.join(' '), n.online ? 'online' : 'offline', n.online ? '' : n.lastSeen, tags(n).join(' '), n.availableRoutes.join(' '), n.approvedRoutes.join(' '), n.createdAt]);
		const csv = [['id', 'name', 'hostname', 'user', 'addresses', 'status', 'last_seen', 'tags', 'advertised_routes', 'approved_routes', 'created'], ...rows].map((r) => r.map(q).join(',')).join('\n');
		const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'machines.csv' });
		a.click();
		URL.revokeObjectURL(a.href);
	}
	// table headers share the SortFilterBar state: click = sort by column, click again = flip direction
	const sortBy = (key: string) => (sortMethod === key ? (sortDirection = sortDirection === 'up' ? 'down' : 'up') : ((sortMethod = key), (sortDirection = 'up')));
</script>


{#snippet pillRow(node: Node, small = false)}
	{#each pills(node) as p (p.label)}<Badge variant="outline" title={p.title} class="{small ? 'h-5 px-1.5 text-[11px]' : ''} {p.pending ? 'border-dashed text-muted-foreground' : ''}">{p.label}</Badge>{/each}
	{#each tags(node) as t}<Badge variant="secondary" class={small ? 'h-5 px-1.5 text-[11px]' : ''}>{t}</Badge>{/each}
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
	<PageHeader title="Machines" layout={App.layoutNode} layouts={['tile', 'list', 'table']} bind:show={showCreate} buttonText="Add device" bind:filterString searchPlaceholder="Search name, owner, tag, IP… (regex)">
		{#snippet button()}<AddDeviceDialog bind:open={showCreate} />{/snippet}
		{#snippet tools()}<Button variant="outline" size="icon" onclick={exportCsv} aria-label="Export CSV" title="Export shown machines as CSV"><Download /></Button>{/snippet}
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
						<Card.Title class="flex min-w-0 items-center gap-0.5">
							<!-- ⋮ = actions menu; its header shows id, owner, created -->
							<MachineMenu {node} class="-ml-1" />
							<span class="truncate">{node.givenName}</span>
						</Card.Title>
						<Card.Action class="flex flex-col items-end gap-0.5">
							<OnlineNodeIndicator {node} label />
							{#if !node.online}<span class="text-[11px] text-muted-foreground">{lastSeenText(node)}</span>{/if}
						</Card.Action>
					</Card.Header>
					<!-- bottom row: big copyable IP left; routes + tags right -->
					<Card.Content class="mt-auto flex flex-row items-end justify-between gap-3">
						<MachineIp {node} class="text-base font-semibold tracking-tight text-foreground" />
						<div class="flex flex-wrap items-center justify-end gap-1">{@render pillRow(node, true)}</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<p class="col-span-full py-12 text-center text-sm text-muted-foreground">No machines.</p>
			{/each}
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border">
			<Table.Root>
				<Table.Header class="bg-muted/50">
					<Table.Row>
						{@render head('Machine', 'name')}
						<Table.Head>Addresses</Table.Head>
						{@render head('Last Seen', 'lastseen', 'hidden md:table-cell')}
						<Table.Head class="w-10"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<!-- Tailscale layout: name / owner / pills · address ▾ · status + last seen · ⋮ -->
					{#each nodes as node (node.id)}
						<Table.Row class="cursor-pointer {node.online ? '' : 'text-muted-foreground'}" onclick={() => open(node)}>
							<Table.Cell class="py-2.5">
								<div class="font-medium text-foreground">{node.givenName}</div>
								<div class="text-xs text-muted-foreground">{node.user.name}{node.name !== node.givenName ? ` · ${node.name}` : ''}</div>
								{#if pills(node).length || tags(node).length}<div class="mt-1 flex flex-wrap gap-1">{@render pillRow(node, true)}</div>{/if}
							</Table.Cell>
							<Table.Cell class="py-2.5 align-top"><MachineIp {node} class="text-sm" /></Table.Cell>
							<Table.Cell class="hidden py-2.5 align-top md:table-cell">
								<span class="inline-flex items-center gap-2"><OnlineNodeIndicator {node} />{node.online ? 'Connected' : lastSeenText(node)}</span>
							</Table.Cell>
							<Table.Cell class="py-2.5 align-top"><MachineMenu {node} /></Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row><Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">No machines.</Table.Cell></Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</Page>
