<script lang="ts">
	import type { Named } from '$lib/common/types';
	import { getTypeName, isUser, isNode } from '$lib/common/types';
	import CardListEntry from '../CardListEntry.svelte';
	import Text from '$lib/parts/Text.svelte';
	import { renameNode, renameUser } from '$lib/common/api';
	import { toastError } from '$lib/common/funcs';
	import { debug } from '$lib/common/debug';
	import { App } from '$lib/States.svelte';

	let { item = $bindable(), allowed = false }: { item: Named; allowed?: boolean } = $props();

	const prefix = getTypeName(item);
	let newName = $state('');

	// returns true to close the editor
	async function rename(): Promise<boolean> {
		if (!newName) return toastError(`${prefix === 'user' ? 'User' : 'Machine'} name must not be empty`), false;
		try {
			if (isUser(item)) {
				const oldName = item.name;
				const u = await renameUser(item, newName);
				App.users.value.find((x) => x.id == u.id)!.name = u.name;
				App.preAuthKeys.value.filter((p) => p.user.name === oldName).forEach((p) => (p.user.name = u.name));
			} else if (isNode(item)) {
				const m = await renameNode(item, newName);
				App.nodes.value.find((x) => x.id == m.id)!.givenName = m.givenName;
			}
			return true;
		} catch (e) {
			e instanceof Error ? toastError('', e) : debug(e);
			return false;
		}
	}
</script>

<CardListEntry title="Name:">
	{#if allowed}
		<Text value={item.givenName ?? item.name} bind:valueNew={newName} showRenameIcon submit={() => (rename(), true)} />
	{:else}
		{item.givenName ?? item.name}
	{/if}
</CardListEntry>
