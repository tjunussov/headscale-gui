<script lang="ts">
	import CardListEntry from '../CardListEntry.svelte';
	import type { Node } from '$lib/common/types';
	import OnlineUserIndicator from '$lib/parts/OnlineUserIndicator.svelte';
	import { changeNodeOwner } from '$lib/common/api';
	import { openDrawer, toastError, toastSuccess } from '$lib/common/funcs';
	import { debug } from '$lib/common/debug';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import { App } from '$lib/States.svelte';

	let { node }: { node: Node } = $props();
	let transferUser = $state('');
	let showTransfer = $state(false);
	let transferring = $state(false);
	const users = $derived(App.users.value.filter((u) => !!u.name));

	async function transfer() {
		transferring = true;
		try {
			const old = node.user.name;
			const n = await changeNodeOwner(node, transferUser);
			App.updateValue(App.nodes, n);
			showTransfer = false;
			toastSuccess(`Changed owner of ${node.givenName} from "${old}" to "${n.user.name}"`);
		} catch (e) {
			e instanceof Error ? toastError('', e) : debug(e);
		} finally {
			transferring = false;
		}
	}
</script>

<CardListEntry title="Owner" top>
	<div class="flex items-center justify-end gap-2">
		<OnlineUserIndicator user={node.user} />
		<button class="underline-offset-4 hover:underline" onclick={() => openDrawer('userDrawer-' + node.user.id, node.user)}>{node.user.name}</button>
		<Button size="icon-sm" variant="ghost" onclick={() => (showTransfer = !showTransfer)} aria-label="Transfer owner"><ArrowRightLeft /></Button>
	</div>
	{#if showTransfer}
		<div class="flex items-center justify-end gap-2 pt-3">
			<Select.Root type="single" bind:value={transferUser}>
				<Select.Trigger size="sm" class="w-48">{users.find((u) => u.id === transferUser)?.name ?? 'New owner…'}</Select.Trigger>
				<Select.Content>
					{#each users as u (u.id)}
						<Select.Item value={u.id} label={u.name}>{u.name}{u.displayName ? ` (${u.displayName})` : ''}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button size="sm" disabled={transferring || !transferUser} onclick={transfer}>Transfer</Button>
		</div>
	{/if}
</CardListEntry>
