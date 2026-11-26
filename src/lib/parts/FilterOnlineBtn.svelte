<script lang="ts">
	import type { OnlineStatus } from '$lib/common/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import StatusDot from './StatusDot.svelte';

	let { value = $bindable(), name, status }: { value: OnlineStatus; name: string; status: OnlineStatus } = $props();
</script>

<Button variant={value === status ? 'secondary' : 'outline'} size="sm" onclick={() => (value = status)}>
	{#if status !== 'all'}<StatusDot online={status === 'online'} />{/if}
	{name}
</Button>
