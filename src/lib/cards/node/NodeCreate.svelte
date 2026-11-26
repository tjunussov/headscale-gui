<script lang="ts">
	import { createNode } from '$lib/common/api';
	import { debug } from '$lib/common/debug';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Check from '@lucide/svelte/icons/check';

	let { show = $bindable(false) }: { show: boolean } = $props();
	let nodekey = $state('');
	let username = $state('');
	let loading = $state(false);

	async function newNode(event?: Event) {
		event?.preventDefault();
		if (!nodekey || !username) return toastError('Username and Device Key are Required');
		loading = true;
		try {
			const n = await createNode(nodekey, username);
			App.nodes.value.push(n);
			toastSuccess('Created node "' + n.name + '"');
			show = false;
			username = '';
		} catch (error) {
			if (error instanceof Error) { debug(error); toastError('Failed to create node', error); }
		} finally {
			loading = false;
		}
	}
</script>

<form onsubmit={newNode} class="flex w-full flex-wrap items-center gap-2">
	<Input class="w-full font-mono md:w-1/2 lg:w-1/3" placeholder="Device Key..." disabled={loading} bind:value={nodekey} autofocus />
	<Select.Root type="single" bind:value={username}>
		<Select.Trigger class="w-full md:w-1/2 lg:w-1/3">{username ? `${username} (ID: ${App.users.value.find((u) => u.name === username)?.id})` : 'User...'}</Select.Trigger>
		<Select.Content>
			{#each App.users.value as user (user.id)}<Select.Item value={user.name} label={user.name}>{user.name} (ID: {user.id})</Select.Item>{/each}
		</Select.Content>
	</Select.Root>
	<Button type="submit" size="icon" variant="outline" disabled={loading} aria-label="Create node"><Check /></Button>
</form>
