<script lang="ts">
	import { createNode } from '$lib/common/api';
	import { debug } from '$lib/common/debug';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Plus from '@lucide/svelte/icons/plus';

	let open = $state(false);
	let loading = $state(false);
	let nodekey = $state('');
	let username = $state('');

	async function submit(e: Event) {
		e.preventDefault();
		if (!nodekey || !username) return toastError('Username and Device Key are Required');
		loading = true;
		try {
			const n = await createNode(nodekey, username);
			App.nodes.value.push(n);
			toastSuccess(`Registered node "${n.name}"`);
			open = false;
			nodekey = '';
		} catch (err) {
			debug(err);
			if (err instanceof Error) toastError('Failed to register node', err);
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>{#snippet child({ props })}<Button size="sm" {...props}><Plus />Register node</Button>{/snippet}</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<form onsubmit={submit} class="grid gap-4">
			<Dialog.Header>
				<Dialog.Title>Register node</Dialog.Title>
				<Dialog.Description>Paste the key shown by <code class="font-mono">tailscale up</code> and pick an owner.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-2">
				<Label for="node-key">Device key</Label>
				<Input id="node-key" class="font-mono" bind:value={nodekey} disabled={loading} autocomplete="off" />
			</div>
			<div class="grid gap-2">
				<Label>User</Label>
				<Select.Root type="single" bind:value={username}>
					<Select.Trigger class="w-full">{username || 'Select user…'}</Select.Trigger>
					<Select.Content>
						{#each App.users.value as u (u.id)}<Select.Item value={u.name} label={u.name}>{u.name}</Select.Item>{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<Dialog.Footer>
				<Dialog.Close>{#snippet child({ props })}<Button variant="outline" type="button" {...props}>Cancel</Button>{/snippet}</Dialog.Close>
				<Button type="submit" disabled={loading}>Register</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
