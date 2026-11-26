<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { isExpired } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';
	import User from '@lucide/svelte/icons/user';
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Router from '@lucide/svelte/icons/router';

	// same six summaries as upstream
	const summaries = $derived([
		{ title: 'Total Users', icon: User, path: '/users', value: App.users.value.length },
		{ title: 'Online Users', icon: User, path: '/users', value: App.users.value.filter((u) => App.nodes.value.some((n) => n.online && n.user.id === u.id)).length },
		{ title: 'Valid PreAuth Keys', icon: KeyRound, path: '/users', value: App.preAuthKeys.value.filter((p) => !isExpired(p.expiration) && !(p.used && !p.reusable)).length },
		{ title: 'Total Nodes', icon: MonitorSmartphone, path: '/nodes', value: App.nodes.value.length },
		{ title: 'Online Nodes', icon: MonitorSmartphone, path: '/nodes', value: App.nodes.value.filter((n) => n.online).length },
		{ title: 'Total Routes', icon: Router, path: '/routes', value: App.nodes.value.reduce((a, n) => a + (n.availableRoutes?.length ?? 0), 0) },
	]);
</script>

<Page>
	<PageHeader title="Home" />
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each summaries as s (s.title)}
			<Card.Root class="cursor-pointer transition-colors hover:border-foreground/25" role="button" tabindex={0} onclick={() => goto(base + s.path)} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && goto(base + s.path)}>
				<Card.Header>
					<Card.Description>{s.title}</Card.Description>
					<Card.Title class="text-3xl font-semibold tabular-nums">{s.value}</Card.Title>
					<Card.Action><s.icon class="size-4 text-muted-foreground" /></Card.Action>
				</Card.Header>
			</Card.Root>
		{/each}
	</div>
</Page>
