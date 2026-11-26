<script lang="ts">
	// Machine page, Tailscale-style: /nodes/<ipv4 or id>/
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import Page from '$lib/page/Page.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Copy from '@lucide/svelte/icons/copy';
	import StatusDot from '$lib/parts/StatusDot.svelte';
	import MachineMenu from '$lib/parts/MachineMenu.svelte';
	import CardListContainer from '$lib/cards/CardListContainer.svelte';
	import CardSeparator from '$lib/cards/CardSeparator.svelte';
	import ItemListName from '$lib/cards/common/ItemListName.svelte';
	import ItemDelete from '$lib/cards/common/ItemDelete.svelte';
	import NodeTags from '$lib/cards/node/NodeTags.svelte';
	import NodeRoutes from '$lib/cards/node/NodeRoutes.svelte';
	import NodeExpiresAt from '$lib/cards/node/NodeExpiresAt.svelte';
	import { copyToClipboard, dateToStr, lastSeenText, machinePills, getTimeDifference, getTime } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';

	const key = $derived(page.params.id ?? '');
	const node = $derived(App.nodes.value.find((n) => n.id === key || n.ipAddresses.includes(key)));
	const v4 = $derived(node?.ipAddresses.find((s) => !s.includes(':')));
	const v6 = $derived(node?.ipAddresses.find((s) => s.includes(':')));
	const method = (m: string) => ({ REGISTER_METHOD_AUTH_KEY: 'PreAuth key', REGISTER_METHOD_CLI: 'CLI', REGISTER_METHOD_OIDC: 'OIDC' })[m] ?? '—';
	const expiry = (e: string | null) => (!e || new Date(e).getFullYear() < 1970 + 1 ? 'Does not expire' : getTimeDifference(getTime(e)).message);
	const short = (k: string) => (k.length > 28 ? k.slice(0, 28) + '…' : k);
</script>

{#snippet row(label: string, value: string | undefined, copy = false, display?: string)}
	<div class="grid grid-cols-[9rem_1fr] items-baseline gap-3 py-1.5 text-sm">
		<span class="text-muted-foreground">{label}</span>
		<span class="flex min-w-0 items-center gap-2">
			<span class="truncate {copy ? 'font-mono' : ''}" title={value}>{display ?? value ?? '—'}</span>
			{#if copy && value}<Button variant="ghost" size="icon-xs" class="text-muted-foreground" aria-label="Copy {label}" onclick={() => copyToClipboard(value, 'Copied ' + label)}><Copy /></Button>{/if}
		</span>
	</div>
{/snippet}

<Page>
	<Button variant="link" href="{base}/nodes/" class="h-auto w-fit p-0 text-muted-foreground"><ArrowLeft />All Machines</Button>

	{#if node}
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-semibold tracking-tight">{node.givenName}</h1>
				<StatusDot online={node.online} />
			</div>
			<MachineMenu {node} class="rounded-md border p-2" />
		</div>

		<div class="flex flex-wrap gap-x-8 gap-y-3 text-sm">
			<div class="grid gap-1"><span class="text-muted-foreground">Managed by</span><span>{node.user.name}</span></div>
			<Separator orientation="vertical" class="data-vertical:h-10" />
			<div class="grid gap-1">
				<span class="text-muted-foreground">Status</span>
				<div class="flex flex-wrap gap-1">
					<StatusDot online={node.online} label />
					{#each machinePills(node) as p (p.label)}<Badge variant="outline" title={p.title} class={p.pending ? 'border-dashed text-muted-foreground' : ''}>{p.label}</Badge>{/each}
					{#each node.tags as t (t)}<Badge variant="secondary">{t.replace(/^tag:/, '')}</Badge>{/each}
				</div>
			</div>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>Machine Details</Card.Title>
				<Card.Description>Information about this machine's identity and network.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-x-10 gap-y-6 lg:grid-cols-2">
				<div>
					{@render row('Owner', node.user.name)}
					{@render row('Machine name', node.givenName, true)}
					{@render row('Hostname', node.name)}
					{@render row('ID', node.id, true)}
					{@render row('Node key', node.nodeKey, true, short(node.nodeKey))}
					{@render row('Machine key', node.machineKey, true, short(node.machineKey))}
					{@render row('Created', dateToStr(node.createdAt))}
					{@render row('Last seen', node.online ? 'Connected' : lastSeenText(node))}
					{@render row('Key expiry', expiry(node.expiry))}
					{@render row('Registered via', method(node.registerMethod))}
				</div>
				<div>
					<p class="pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Addresses</p>
					{@render row('IPv4', v4, true)}
					{@render row('IPv6', v6, true)}
					<p class="pt-4 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Routes</p>
					{@render row('Advertised', node.availableRoutes.join(', ') || undefined)}
					{@render row('Approved', node.approvedRoutes.join(', ') || undefined)}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Manage</Card.Title>
				<Card.Description>Rename, tags, route approval, key expiry and removal.</Card.Description>
			</Card.Header>
			<Card.Content>
				<CardListContainer>
					<ItemListName item={node} allowed={true} />
					<CardSeparator />
					<NodeTags {node} />
					<CardSeparator />
					<NodeRoutes {node} />
					<CardSeparator />
					<NodeExpiresAt {node} />
					<CardSeparator />
					<ItemDelete item={node} />
				</CardListContainer>
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="py-16 text-center text-muted-foreground">{App.nodes.value.length ? `No machine "${key}".` : 'Loading…'}</p>
	{/if}
</Page>
