<script lang="ts">
	import CardListEntry from '../CardListEntry.svelte';
	import type { Node } from '$lib/common/types';
	import { debug } from '$lib/common/debug';
	import NodeRoute from './NodeRoute.svelte';
	import { disableRoutes, enableRoutes } from '$lib/common/api';
	import { Button } from '$lib/components/ui/button/index.js';
	import ToggleRight from '@lucide/svelte/icons/toggle-right';
	import ToggleLeft from '@lucide/svelte/icons/toggle-left';

	let { node = $bindable(), showTitle = true }: { node: Node; showTitle?: boolean } = $props();
	let loading = $state(false);

	async function all(enable: boolean) {
		loading = true;
		try { await (enable ? enableRoutes : disableRoutes)(node, ...node.availableRoutes); } catch (e) { debug(e); } finally { loading = false; }
	}
</script>

<CardListEntry title={showTitle ? 'Routes:' : undefined} top>
	<div class="flex justify-end gap-1">
		<Button size="icon-sm" variant="ghost" disabled={loading} onclick={() => all(true)} aria-label="Enable all routes" title="Enable all"><ToggleRight /></Button>
		<Button size="icon-sm" variant="ghost" disabled={loading} onclick={() => all(false)} aria-label="Disable all routes" title="Disable all"><ToggleLeft /></Button>
	</div>
	{#snippet childBottom()}
		<div class="pt-1">
			{#each node.availableRoutes as route (route)}<NodeRoute {route} disable={loading} {node} />{/each}
		</div>
	{/snippet}
</CardListEntry>
