<script lang="ts">
	import type { PreAuthKey } from '$lib/common/types';
	import { copyToClipboard, toastError, toastSuccess } from '$lib/common/funcs';
	import Delete from '$lib/parts/Delete.svelte';
	import { deletePreAuthKey, getPreAuthKeys } from '$lib/common/api';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Copy from '@lucide/svelte/icons/copy';
	import { App } from '$lib/States.svelte';
	import { onMount } from 'svelte';

	let { preAuthKey }: { preAuthKey: PreAuthKey } = $props();
	let tick = $state(0);
	const expired = $derived.by(() => { void tick; return new Date() > new Date(preAuthKey.expiration); });
	onMount(() => { const i = setInterval(() => tick++, 1000); return () => clearInterval(i); });

	// upstream shows all four flags, dimmed when off
	const flags = $derived([['Used', preAuthKey.used], ['Expired', expired], ['Ephemeral', preAuthKey.ephemeral], ['Reusable', preAuthKey.reusable]] as const);

	async function remove() {
		try { await deletePreAuthKey(preAuthKey); }
		catch (e) { toastError('Error Deleting PreAuth Key', e instanceof Error ? e : undefined); return; }
		toastSuccess('PreAuth Key Deleted');
		App.removeValue(App.preAuthKeys, preAuthKey);
		App.preAuthKeys.value = await getPreAuthKeys();
	}
</script>

<div class="flex w-full items-center justify-between gap-3 py-2">
	<div class="flex flex-wrap items-center gap-3">
		<Button variant="outline" size="sm" class="font-mono" onclick={() => copyToClipboard(preAuthKey.key)}><Copy />{preAuthKey.key.substring(11, 23)}</Button>
		<div class="flex flex-wrap gap-1">
			{#each flags as [name, on]}
				<Badge variant={on ? (name === 'Expired' ? 'destructive' : 'default') : 'outline'} class={on ? '' : 'opacity-50'}>{name}</Badge>
			{/each}
		</div>
	</div>
	<Delete func={remove} />
</div>
