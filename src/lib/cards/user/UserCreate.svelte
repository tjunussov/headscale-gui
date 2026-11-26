<script lang="ts">
	import { createUser } from '$lib/common/api';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Check from '@lucide/svelte/icons/check';

	let { show = $bindable(), loading = $bindable(false) }: { show: boolean; loading?: boolean } = $props();
	let username = $state('');

	async function newUser(event?: Event) {
		event?.preventDefault();
		loading = true;
		try {
			App.users.value.push(await createUser(username));
			toastSuccess('Created user "' + username + '"');
			show = false;
			username = '';
		} catch (error) {
			if (error instanceof Error) toastError('Failed to create user "' + username + '"', error);
		} finally {
			loading = false;
		}
	}
</script>

<form onsubmit={newUser} class="flex w-full items-center gap-2">
	<Input class="w-full md:w-1/2 lg:w-1/3" placeholder="New Username..." disabled={loading} bind:value={username} autofocus />
	<Button type="submit" size="icon" variant="outline" disabled={loading} aria-label="Create user"><Check /></Button>
</form>
