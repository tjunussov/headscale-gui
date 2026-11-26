<script lang="ts">
	import type { Node } from '$lib/common/types';
	import { setNodeTags } from '$lib/common/api';
	import { toastError } from '$lib/common/funcs';
	import CardListEntry from '../CardListEntry.svelte';
	import TagInput from '$lib/parts/TagInput.svelte';
	import { App } from '$lib/States.svelte';

	let { node = $bindable() }: { node: Node } = $props();
	const strip = (t: string[]) => t.map((x) => x.replace('tag:', ''));
	let tags = $state<string[]>([]);
	$effect(() => { tags = strip(node.tags); });
	let disabled = $state(false);

	async function saveTags(t: string[]) {
		disabled = true;
		try {
			const n = await setNodeTags(node, t);
			App.updateValue(App.nodes, n);
			tags = strip(n.tags);
		} catch (e) {
			toastError('Invalid Tags: ' + e);
		} finally {
			disabled = false;
		}
	}
</script>

<CardListEntry top title="Tags:">
	<div class="w-64"><TagInput bind:value={tags} {disabled} placeholder="Add tag…" onchange={saveTags} /></div>
</CardListEntry>
