<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import { base } from '$app/paths';
	import { isExpired, getSortedNodes, openDrawer, lastSeenText } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';
	import Users from '@lucide/svelte/icons/users';
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Route from '@lucide/svelte/icons/route';

	const nodes = $derived(App.nodes.value);
	const online = $derived(nodes.filter((n) => n.online));
	const usersOnline = $derived(App.users.value.filter((u) => online.some((n) => n.user.id === u.id)));
	const keys = $derived(App.preAuthKeys.value.filter((k) => !isExpired(k.expiration) && !(k.used && !k.reusable)));
	const routes = $derived(nodes.flatMap((n) => n.availableRoutes));
	const pending = $derived(nodes.reduce((a, n) => a + n.availableRoutes.filter((r) => !n.approvedRoutes.includes(r)).length, 0));
	const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

	const cards = $derived([
		{ label: 'Nodes', value: nodes.length, badge: `${pct(online.length, nodes.length)}% online`, icon: MonitorSmartphone, line: `${online.length} online now`, sub: 'Devices registered to the tailnet', path: '/nodes' },
		{ label: 'Users', value: App.users.value.length, badge: `${usersOnline.length} active`, icon: Users, line: `${usersOnline.length} with a node online`, sub: 'Namespaces owning nodes', path: '/users' },
		{ label: 'Valid PreAuth keys', value: keys.length, badge: `${keys.filter((k) => k.reusable).length} reusable`, icon: KeyRound, line: 'Unexpired and unused', sub: 'Ready for new devices', path: '/users' },
		{ label: 'Routes', value: routes.length, badge: `${pending} pending`, icon: Route, line: pending ? `${pending} awaiting approval` : 'All routes approved', sub: 'Subnet and exit routes', path: '/routes' },
	]);
	const recent = $derived(getSortedNodes(nodes, 'lastseen', 'down').slice(0, 6));
</script>

<PageHeader title="Dashboard" description="Overview of your Headscale tailnet." />

<div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
	{#each cards as c (c.label)}
		<Card.Root class="@container/card">
			<Card.Header>
				<Card.Description>{c.label}</Card.Description>
				<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{c.value}</Card.Title>
				<Card.Action><Badge variant="outline"><c.icon />{c.badge}</Badge></Card.Action>
			</Card.Header>
			<Card.Footer class="flex-col items-start gap-1.5 text-sm">
				<a href="{base}{c.path}" class="line-clamp-1 flex gap-2 font-medium underline-offset-4 hover:underline">{c.line}</a>
				<div class="text-muted-foreground">{c.sub}</div>
			</Card.Footer>
		</Card.Root>
	{/each}
</div>

<Card.Root>
	<Card.Header>
		<Card.Title>Recently seen</Card.Title>
		<Card.Description>Latest node activity across all users.</Card.Description>
		<Card.Action><Button variant="outline" size="sm" href="{base}/nodes">View all</Button></Card.Action>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Body>
				{#each recent as node (node.id)}
					<Table.Row class="cursor-pointer" onclick={() => openDrawer('nodeDrawer-' + node.id, node)}>
						<Table.Cell class="w-6"><OnlineNodeIndicator {node} /></Table.Cell>
						<Table.Cell class="font-medium">{node.givenName}</Table.Cell>
						<Table.Cell class="text-muted-foreground">{node.user.name}</Table.Cell>
						<Table.Cell class="text-right text-muted-foreground">{lastSeenText(node)}</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row><Table.Cell class="h-16 text-center text-muted-foreground">No nodes yet.</Table.Cell></Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
