<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import ListToolbar from '$lib/parts/ListToolbar.svelte';
	import SortHead from '$lib/parts/SortHead.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import NodeCreate from '$lib/cards/node/NodeCreate.svelte';
	import { getSortedFilteredNodes, openDrawer, lastSeenText } from '$lib/common/funcs';
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
	const tags = (n: (typeof rows)[number]) => [...n.forcedTags, ...n.validTags].map((t) => t.replace('tag:', ''));
</script>

<PageHeader title="Nodes" description="Devices registered to the tailnet.">
	{#snippet actions()}<NodeCreate />{/snippet}
</PageHeader>

<ListToolbar bind:status bind:search {counts} />

<div class="overflow-hidden rounded-lg border">
	<Table.Root>
		<Table.Header class="bg-muted/50">
			<Table.Row>
				<SortHead name="ID" bind:sort bind:dir class="w-16" />
				<SortHead name="Name" bind:sort bind:dir />
				<SortHead name="User" bind:sort bind:dir class="hidden sm:table-cell" />
				<Table.Head>Address</Table.Head>
				<Table.Head class="hidden lg:table-cell">Tags</Table.Head>
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
					<Table.Cell class="hidden text-muted-foreground md:table-cell">{lastSeenText(node)}</Table.Cell>
					<Table.Cell><OnlineNodeIndicator {node} label /></Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row><Table.Cell colspan={7} class="h-24 text-center text-muted-foreground">No nodes.</Table.Cell></Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
