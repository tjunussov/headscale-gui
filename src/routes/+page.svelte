<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import { base } from '$app/paths';
	import { isExpired, getSortedNodes, openDrawer, lastSeenText } from '$lib/common/funcs';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import { App } from '$lib/States.svelte';
	import Users from '@lucide/svelte/icons/users';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import Wifi from '@lucide/svelte/icons/wifi';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Route from '@lucide/svelte/icons/route';

	const nodes = $derived(App.nodes.value);
	const users = $derived(App.users.value);
	const online = $derived(nodes.filter((n) => n.online));
	const usersOnline = $derived(users.filter((u) => online.some((n) => n.user.id === u.id)));
	const keys = $derived(App.preAuthKeys.value.filter((p) => !isExpired(p.expiration) && !(p.used && !p.reusable)));
	const routes = $derived(nodes.reduce((a, n) => a + (n.availableRoutes?.length ?? 0), 0));
	const pending = $derived(nodes.reduce((a, n) => a + (n.availableRoutes ?? []).filter((r) => !n.approvedRoutes.includes(r)).length, 0));
	const recent = $derived(getSortedNodes(nodes, 'lastseen', 'down').slice(0, 6));
	const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

	// upstream's six summaries, in upstream order, styled as shadcn section cards
	const summaries = $derived([
		{ title: 'Total Users', path: '/users', value: users.length, icon: Users, badge: `${usersOnline.length} active`, line: `${users.filter((u) => nodes.some((n) => n.user.id === u.id)).length} own nodes`, sub: 'In the tailnet' },
		{ title: 'Online Users', path: '/users', value: usersOnline.length, icon: UserCheck, badge: `${pct(usersOnline.length, users.length)}%`, line: `${usersOnline.length} of ${users.length} online`, sub: 'With a node online' },
		{ title: 'Valid PreAuth Keys', path: '/users', value: keys.length, icon: KeyRound, badge: `${keys.filter((k) => k.reusable).length} reusable`, line: 'Unused, unexpired', sub: 'For new devices' },
		{ title: 'Total Nodes', path: '/nodes', value: nodes.length, icon: MonitorSmartphone, badge: `${pct(online.length, nodes.length)}% online`, line: `${nodes.length - online.length} offline`, sub: 'Registered devices' },
		{ title: 'Online Nodes', path: '/nodes', value: online.length, icon: Wifi, badge: `${online.length}/${nodes.length}`, line: `${online.length} online now`, sub: 'Connected devices' },
		{ title: 'Total Routes', path: '/routes', value: routes, icon: Route, badge: `${pending} pending`, line: pending ? `${pending} to approve` : 'All approved', sub: 'Subnet & exit routes' },
	]);
</script>

<Page>
	<PageHeader title="Home" />
	<!-- one row; scrolls sideways (snapping per card) when the screen is too narrow for six -->
	<div class="flex snap-x gap-3 overflow-x-auto p-px pb-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
		{#each summaries as s (s.title)}
			<Card.Root class="@container/card relative min-w-44 flex-1 snap-start gap-3 [--card-spacing:--spacing(4)] transition-colors hover:border-foreground/25">
				<Card.Header>
					<Card.Description class="truncate">{s.title}</Card.Description>
					<div class="flex items-center justify-between gap-2">
						<Card.Title class="text-2xl font-semibold tabular-nums">{s.value}</Card.Title>
						<Badge variant="outline"><s.icon />{s.badge}</Badge>
					</div>
				</Card.Header>
				<Card.Footer class="flex-col items-start gap-0.5 text-sm">
					<!-- stretched link: whole card navigates, like upstream's clickable tiles -->
					<a href="{base}{s.path}" class="line-clamp-1 font-medium after:absolute after:inset-0">{s.line}</a>
					<div class="line-clamp-1 text-muted-foreground">{s.sub}</div>
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
</Page>
