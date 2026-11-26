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

	const flags = $derived([
		['Used', preAuthKey.used],
		['Expired', expired],
		['Ephemeral', preAuthKey.ephemeral],
		['Reusable', preAuthKey.reusable],
	] as const);
</script>

<div class="flex flex-wrap items-center justify-between gap-2 py-2">
	<Button variant="outline" size="sm" class="font-mono" onclick={() => copyToClipboard(preAuthKey.key)}>
		<Copy />{preAuthKey.key.substring(0, 12)}…
	</Button>
	<div class="flex flex-wrap items-center gap-1">
		{#each flags.filter(([, on]) => on) as [name]}
			<Badge variant={name === 'Expired' ? 'destructive' : 'secondary'}>{name}</Badge>
		{/each}
	</div>
	{#if !expired}
		<Delete
			label="Expire"
			func={async () => {
				await expirePreAuthKey(preAuthKey);
				(await getPreAuthKeys([preAuthKey.user.id])).forEach((pak) => App.updateValue(App.preAuthKeys, pak));
			}}
		/>
	{/if}
</div>
