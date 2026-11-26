<script lang="ts">
	import CardListEntry from '../CardListEntry.svelte';
	import type { User } from '$lib/common/types';
	import OnlineNodeIndicator from '$lib/parts/OnlineNodeIndicator.svelte';
	import { openDrawer } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';

	let { user = $bindable(), title = 'Machines:' }: { user: User; title?: string } = $props();
	const nodes = $derived(App.nodes.value.filter((n) => n.user.id == user.id));
</script>

<CardListEntry {title} top>
	{#each nodes as node (node.id)}
		<button class="flex w-full items-center justify-end gap-2 py-0.5 underline-offset-4 hover:underline" onclick={() => openDrawer('nodeDrawer-' + node.id, node)}>
			{node.givenName}<span class="font-normal text-muted-foreground">{node.name}</span>
			<OnlineNodeIndicator {node} />
		</button>
	{:else}
		<span class="text-muted-foreground">—</span>
	{/each}
</CardListEntry>
