<script lang="ts">
	import UserListPreAuthKey from '$lib/cards/user/UserListPreAuthKey.svelte';
	import type { PreAuthKey, User } from '$lib/common/types';
	import { createPreAuthKey } from '$lib/common/api';
	import { debug } from '$lib/common/debug';
	import { App } from '$lib/States.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Plus from '@lucide/svelte/icons/plus';

	let { user = $bindable(), title = 'PreAuth Keys' }: { user: User; title?: string } = $props();

	const defaultExpires = (h = 1) => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4 + h * 36e5).toISOString().slice(0, 16);
	const isExpiredOrUsed = (p: PreAuthKey) => new Date() > new Date(p.expiration) || (p.used && !p.reusable);

	let hideInvalid = $state(true);
	let showCreate = $state(false);
	let busy = $state(false);
	let opts = $state({ ephemeral: false, reusable: false });
	let expires = $state(defaultExpires());
	const keys = $derived(App.preAuthKeys.value.filter((p) => p.user.id === user.id && (!hideInvalid || !isExpiredOrUsed(p))));

	async function create() {
		busy = true;
		try {
			App.preAuthKeys.value.push(await createPreAuthKey(user, opts.ephemeral, opts.reusable, expires));
			showCreate = false;
			opts = { ephemeral: false, reusable: false };
		} catch (e) { debug(e); } finally { busy = false; }
	}
</script>

<div class="py-3 text-sm">
	<div class="flex items-center justify-between gap-4">
		<span class="text-muted-foreground">{title}</span>
		<div class="flex items-center gap-3">
			<Label class="text-xs font-normal"><Checkbox bind:checked={hideInvalid} />Hide invalid</Label>
			<Button size="xs" variant="outline" onclick={() => { expires = defaultExpires(); showCreate = !showCreate; }}><Plus />New key</Button>
		</div>
	</div>
	{#if showCreate}
		<div class="mt-3 flex flex-col gap-3 rounded-lg border bg-muted/40 p-3">
			<div class="flex flex-wrap items-center gap-4">
				<Input type="datetime-local" class="h-8 w-56" bind:value={expires} disabled={busy} />
				<Label class="font-normal"><Checkbox bind:checked={opts.ephemeral} disabled={busy} />Ephemeral</Label>
				<Label class="font-normal"><Checkbox bind:checked={opts.reusable} disabled={busy} />Reusable</Label>
			</div>
			<div class="flex justify-end gap-2">
				<Button size="sm" variant="ghost" onclick={() => (showCreate = false)}>Cancel</Button>
				<Button size="sm" disabled={busy} onclick={create}>Create key</Button>
			</div>
		</div>
	{/if}
	<div class="mt-2 divide-y">
		{#each keys as preAuthKey (preAuthKey.key)}<UserListPreAuthKey {preAuthKey} />{:else}<p class="py-2 text-muted-foreground">No keys</p>{/each}
	</div>
</div>
