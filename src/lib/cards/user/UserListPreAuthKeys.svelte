<script lang="ts">
	import CardListEntry from '../CardListEntry.svelte';
	import UserListPreAuthKey from '$lib/cards/user/UserListPreAuthKey.svelte';
	import type { PreAuthKey, User } from '$lib/common/types';
	import { createPreAuthKey } from '$lib/common/api';
	import { debug } from '$lib/common/debug';
	import { App } from '$lib/States.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import { slide } from 'svelte/transition';

	let { user = $bindable(), title = 'PreAuth Keys:' }: { user: User; title?: string } = $props();

	const defaultExpires = (h = 1) => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4 + h * 36e5).toISOString().slice(0, 16);
	const isExpiredOrUsed = (p: PreAuthKey) => new Date() > new Date(p.expiration) || (p.used && !p.reusable);

	let hideInvalid = $state(true);
	let showCreate = $state(false);
	let disableCreate = $state(false);
	let checked = $state({ ephemeral: false, reusable: false });
	let expires = $state(defaultExpires());
	const preAuthKeys = $derived(App.preAuthKeys.value.filter((p) => p.user.id === user.id && (!hideInvalid || !isExpiredOrUsed(p))));

	async function create() {
		disableCreate = true;
		try { App.preAuthKeys.value.push(await createPreAuthKey(user, checked.ephemeral, checked.reusable, expires)); }
		catch (e) { debug(e); }
		finally { showCreate = false; disableCreate = false; checked = { ephemeral: false, reusable: false }; }
	}
</script>

<CardListEntry {title} top>
	<div class="flex items-center justify-end gap-3">
		<Label class="text-xs font-normal"><Checkbox bind:checked={hideInvalid} />Hide Invalid</Label>
		<Button size="xs" disabled={disableCreate} onclick={() => { expires = defaultExpires(); showCreate = !showCreate; }}>Create</Button>
	</div>
	{#if showCreate}
		<div transition:slide class="flex flex-col items-end gap-2 pt-3">
			<div class="flex gap-1">
				<Button size="icon-sm" variant="ghost" disabled={disableCreate} onclick={create} aria-label="Create key"><Check /></Button>
				<Button size="icon-sm" variant="ghost" disabled={disableCreate} onclick={() => (showCreate = false)} aria-label="Cancel"><X /></Button>
			</div>
			<Input type="datetime-local" class="h-8 w-56 text-xs" disabled={disableCreate} bind:value={expires} />
			<div class="flex gap-4">
				<Label class="font-normal"><Checkbox disabled={disableCreate} bind:checked={checked.ephemeral} />Ephemeral</Label>
				<Label class="font-normal"><Checkbox disabled={disableCreate} bind:checked={checked.reusable} />Reusable</Label>
			</div>
		</div>
	{/if}
	{#snippet childBottom()}
		<div class="divide-y pt-2">
			{#each preAuthKeys as preAuthKey (preAuthKey.key)}<UserListPreAuthKey {preAuthKey} />{/each}
		</div>
	{/snippet}
</CardListEntry>
