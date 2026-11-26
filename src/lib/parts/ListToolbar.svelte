<script lang="ts">
	// dashboard-01 style toolbar: status tabs with counts + search
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Search from '@lucide/svelte/icons/search';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import LayoutList from '@lucide/svelte/icons/layout-list';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import type { LayoutStyle, Valued } from '$lib/States.svelte';
	import type { OnlineStatus } from '$lib/common/types';

	let { status = $bindable(), search = $bindable(), counts, layout, placeholder = 'Search… (regex)' }: { status: OnlineStatus; search: string; counts: Record<OnlineStatus, number>; layout?: Valued<LayoutStyle>; placeholder?: string } = $props();
	const valid = $derived.by(() => { try { RegExp(search); return true; } catch { return false; } });
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<Tabs.Root bind:value={status}>
		<Tabs.List>
			{#each [['all', 'All'], ['online', 'Online'], ['offline', 'Offline']] as const as [v, label]}
				<Tabs.Trigger value={v}>{label}<Badge variant="secondary" class="ms-1 h-5 min-w-5 rounded-full px-1 tabular-nums">{counts[v]}</Badge></Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
	<div class="flex w-full items-center gap-2 sm:w-auto">
		<InputGroup.Root class="w-full sm:w-72">
			<InputGroup.Input {placeholder} bind:value={search} aria-invalid={!valid} />
			<InputGroup.Addon><Search /></InputGroup.Addon>
		</InputGroup.Root>
		{#if layout}
			<ToggleGroup.Root type="single" variant="outline" value={layout.value} onValueChange={(v) => v && (layout.value = v as LayoutStyle)}>
				<ToggleGroup.Item value="list" aria-label="Table view"><LayoutList /></ToggleGroup.Item>
				<ToggleGroup.Item value="tile" aria-label="Tile view"><LayoutGrid /></ToggleGroup.Item>
			</ToggleGroup.Root>
		{/if}
	</div>
</div>
