<script lang="ts">
	// 0.28: keys are created on the Deploy page; here only list + delete
	import CardListEntry from '../CardListEntry.svelte';
	import UserListPreAuthKey from '$lib/cards/user/UserListPreAuthKey.svelte';
	import type { PreAuthKey, User } from '$lib/common/types';
	import { App } from '$lib/States.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let { user = $bindable(), title = 'PreAuth Keys:' }: { user: User; title?: string } = $props();

	const isExpiredOrUsed = (p: PreAuthKey) => new Date() > new Date(p.expiration) || (p.used && !p.reusable);
	let hideInvalid = $state(true);
	const preAuthKeys = $derived(App.preAuthKeys.value.filter((p) => p.user?.id === user.id && (!hideInvalid || !isExpiredOrUsed(p))));
</script>

<CardListEntry {title} top>
	<div class="flex items-center justify-end">
		<Label class="text-xs font-normal"><Checkbox bind:checked={hideInvalid} />Hide Invalid</Label>
	</div>
	{#snippet childBottom()}
		<div class="divide-y pt-2">
			{#each preAuthKeys as preAuthKey (preAuthKey.id)}<UserListPreAuthKey {preAuthKey} />{/each}
		</div>
	{/snippet}
</CardListEntry>
