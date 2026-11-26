<script lang="ts">
	// B's sort + online filter, rendered as A's shadcn Tabs (segmented, count badges).
	// Sort: click a tab to sort by it, click the active tab again to flip direction.
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import StatusDot from './StatusDot.svelte';
	import type { Direction, OnlineStatus } from '$lib/common/types';

	let { sortMethod = $bindable(), sortDirection = $bindable(), filterOnlineStatus = $bindable(), sorts, counts }: { sortMethod: string; sortDirection: Direction; filterOnlineStatus: OnlineStatus; sorts: string[]; counts?: Record<OnlineStatus, number> } = $props();

	const keyOf = (name: string) => name.toLowerCase().replace(/\s+/g, '');
	function toggle(method: string) {
		if (method !== sortMethod) { sortMethod = method; sortDirection = 'up'; }
		else sortDirection = sortDirection === 'up' ? 'down' : 'up';
	}
	const filters = [['all', 'All'], ['online', 'Online'], ['offline', 'Offline']] as const;
</script>

<div class="flex flex-wrap items-center gap-3">
	<Tabs.Root value={sortMethod}>
		<Tabs.List>
			{#each sorts as name (name)}
				{@const key = keyOf(name)}
				<Tabs.Trigger value={key} onclick={() => toggle(key)}>
					{name}
					{#if sortMethod === key}{#if sortDirection === 'up'}<ArrowUp />{:else}<ArrowDown />{/if}{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
	<Tabs.Root bind:value={filterOnlineStatus}>
		<Tabs.List>
			{#each filters as [v, label] (v)}
				<Tabs.Trigger value={v}>
					{#if v !== 'all'}<StatusDot online={v === 'online'} />{/if}
					{label}
					{#if counts}<Badge variant="secondary" class="h-5 min-w-5 rounded-full px-1 tabular-nums">{counts[v]}</Badge>{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>
