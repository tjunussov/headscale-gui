<script lang="ts">
	import type { Node } from '$lib/common/types';
	import { setNodeTags } from '$lib/common/api';
	import { toastError } from '$lib/common/funcs';
	import CardListEntry from '../CardListEntry.svelte';
	import TagInput from '$lib/parts/TagInput.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { App } from '$lib/States.svelte';

	let { node = $bindable() }: { node: Node } = $props();
	const strip = (t: string[]) => t.map((x) => x.replace('tag:', ''));
	const tagsValid = $derived(strip(node.validTags));
	const tagsInvalid = $derived(strip(node.invalidTags));
	let tagsForced = $state(strip(node.forcedTags));
	let disabled = $state(false);

	async function saveTags(tags: string[]) {
		disabled = true;
		try {
			const n = await setNodeTags(node, tags);
			n.validTags = [...node.validTags];
			n.invalidTags = [...node.invalidTags];
			App.updateValue(App.nodes, n);
		} catch (e) {
			toastError('Invalid Tags: ' + e);
		} finally {
			disabled = false;
		}
	}
</script>

<CardListEntry top title="Tags:">
	<div class="w-64"><TagInput bind:value={tagsForced} {disabled} placeholder="Add tag…" onchange={saveTags} /></div>
</CardListEntry>
<CardListEntry top>
	{#snippet childTitle()}
		<span class="flex items-center gap-1.5">
			Advertised Tags:
			{#if tagsInvalid.length}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger><TriangleAlert class="size-4 text-muted-foreground" /></Tooltip.Trigger>
						<Tooltip.Content>Blocked by current ACL: {tagsInvalid.join(', ')}</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{/if}
		</span>
	{/snippet}
	<div class="flex flex-wrap justify-end gap-1">
		{#each tagsValid as tag}<Badge variant="secondary">{tag}</Badge>{/each}
		{#each tagsInvalid as tag}<Badge variant="outline" class="text-destructive line-through">{tag}</Badge>{/each}
		{#if !tagsValid.length && !tagsInvalid.length}<span class="text-muted-foreground">—</span>{/if}
	</div>
</CardListEntry>
