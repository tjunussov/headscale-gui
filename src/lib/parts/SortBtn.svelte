<script lang="ts">
	import type { Direction } from '$lib/common/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';

	let { value = $bindable(), name, direction, toggle }: { value: string; name: string; direction: Direction; toggle: (_: string) => void } = $props();
	const key = $derived(name.toLowerCase().replace(/\s+/g, ''));
	const active = $derived(value === key);
</script>

<Button variant={active ? 'secondary' : 'outline'} size="sm" onclick={() => toggle(key)}>
	<span class={active ? '' : 'invisible'}>{#if direction === 'up'}<ArrowUp />{:else}<ArrowDown />{/if}</span>
	{name}
</Button>
