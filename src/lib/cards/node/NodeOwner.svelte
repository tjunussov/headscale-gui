<script lang="ts">
	import CardListEntry from '../CardListEntry.svelte';
	import type { Node } from '$lib/common/types';
	import OnlineUserIndicator from '$lib/parts/OnlineUserIndicator.svelte';
	import { openDrawer } from '$lib/common/funcs';

	let { node }: { node: Node } = $props();
</script>

<CardListEntry title="Owner:" top>
	<div class="flex items-center justify-end gap-2">
		<button class="underline-offset-4 hover:underline" onclick={() => openDrawer('userDrawer-' + node.user.id, node.user)}>{node.user.name}</button>
		<OnlineUserIndicator user={node.user} />
	</div>
</CardListEntry>
