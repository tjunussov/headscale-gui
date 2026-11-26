<script lang="ts">
	import { lastSeenText } from '$lib/common/funcs';
	import type { Node } from '$lib/common/types';
	import { onMount } from 'svelte';
	import CardListEntry from '../CardListEntry.svelte';

	let { node }: { node: Node } = $props();
	let tick = $state(0);
	onMount(() => { const i = setInterval(() => tick++, 1000); return () => clearInterval(i); });
</script>

<CardListEntry title="Last seen">{#key tick}{lastSeenText(node)}{/key}</CardListEntry>
