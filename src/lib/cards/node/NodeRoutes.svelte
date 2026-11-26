<script lang="ts">
	import CardListEntry from '../CardListEntry.svelte';
	import type { Node } from '$lib/common/types';
	import { debug } from '$lib/common/debug';
	import NodeRoute from './NodeRoute.svelte';
	import { disableRoutes, enableRoutes } from '$lib/common/api';
	import { Button } from '$lib/components/ui/button/index.js';

	let { node = $bindable(), showTitle = true }: { node: Node; showTitle?: boolean } = $props();
	let loading = $state(false);

	async function all(enable: boolean) {
		loading = true;
		try { await (enable ? enableRoutes : disableRoutes)(node, ...node.availableRoutes); } catch (e) { debug(e); } finally { loading = false; }
	}
</script>

<CardListEntry title={showTitle ? 'Routes' : undefined} top>
	{#if node.availableRoutes.length}
		<div class="flex justify-end gap-2">
			<Button size="xs" variant="outline" disabled={loading} onclick={() => all(true)}>Approve all</Button>
			<Button size="xs" variant="ghost" disabled={loading} onclick={() => all(false)}>Revoke all</Button>
		</div>
	{:else}
		<span class="text-muted-foreground">None advertised</span>
	{/if}
	{#snippet childBottom()}
		<div class="pt-2">
			{#each node.availableRoutes as route (route)}<NodeRoute {route} disable={loading} {node} />{/each}
		</div>
	{/snippet}
</CardListEntry>
