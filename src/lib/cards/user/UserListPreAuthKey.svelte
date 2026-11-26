<script lang="ts">
	import type { PreAuthKey } from '$lib/common/types';
	import { copyToClipboard } from '$lib/common/funcs';
	import Delete from '$lib/parts/Delete.svelte';
	import { expirePreAuthKey, getPreAuthKeys } from '$lib/common/api';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Copy from '@lucide/svelte/icons/copy';
	import { App } from '$lib/States.svelte';
	import { onMount } from 'svelte';

	let { preAuthKey }: { preAuthKey: PreAuthKey } = $props();
	const isExpired = () => new Date() > new Date(preAuthKey.expiration);
	let expired = $state(isExpired());
	onMount(() => { const i = setInterval(() => (expired = isExpired()), 1000); return () => clearInterval(i); });

	// upstream shows all four flags, dimmed when off
	const flags = $derived([['Used', preAuthKey.used], ['Expired', expired], ['Ephemeral', preAuthKey.ephemeral], ['Reusable', preAuthKey.reusable]] as const);
</script>

<div class="flex flex-row items-start gap-3 py-2">
	<div class="flex flex-col gap-2">
		<Button variant="outline" size="sm" class="font-mono" onclick={() => copyToClipboard(preAuthKey.key)}><Copy />{preAuthKey.key.substring(0, 8)}</Button>
		{#if !expired}
			<Delete
				func={async () => {
					await expirePreAuthKey(preAuthKey);
					(await getPreAuthKeys([preAuthKey.user.id])).forEach((pak) => App.updateValue(App.preAuthKeys, pak));
				}}
			/>
		{/if}
	</div>
	<div class="grid grid-cols-2 gap-1 lg:grid-cols-4">
		{#each flags as [name, on]}
			<Badge variant={on ? (name === 'Expired' ? 'destructive' : 'default') : 'outline'} class={on ? '' : 'opacity-50'}>{name}</Badge>
		{/each}
	</div>
</div>
