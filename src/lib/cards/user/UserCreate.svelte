<script lang="ts">
	import { createUser } from '$lib/common/api';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Plus from '@lucide/svelte/icons/plus';

	let open = $state(false);
	let loading = $state(false);
	let username = $state('');

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		try {
			App.users.value.push(await createUser(username));
			toastSuccess(`Created user "${username}"`);
			open = false;
			username = '';
		} catch (err) {
			if (err instanceof Error) toastError(`Failed to create user "${username}"`, err);
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>{#snippet child({ props })}<Button size="sm" {...props}><Plus />Add user</Button>{/snippet}</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<form onsubmit={submit} class="grid gap-4">
			<Dialog.Header>
				<Dialog.Title>Add user</Dialog.Title>
				<Dialog.Description>Create a new Headscale user (namespace).</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-2">
				<Label for="new-username">Username</Label>
				<Input id="new-username" bind:value={username} disabled={loading} autocomplete="off" required />
			</div>
			<Dialog.Footer>
				<Dialog.Close>{#snippet child({ props })}<Button variant="outline" type="button" {...props}>Cancel</Button>{/snippet}</Dialog.Close>
				<Button type="submit" disabled={loading || !username}>Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
