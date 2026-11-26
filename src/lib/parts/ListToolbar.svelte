<script lang="ts">
	// dashboard-01 style toolbar: status tabs with counts + search
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Search from '@lucide/svelte/icons/search';
	import type { OnlineStatus } from '$lib/common/types';

	let { status = $bindable(), search = $bindable(), counts, placeholder = 'Search… (regex)' }: { status: OnlineStatus; search: string; counts: Record<OnlineStatus, number>; placeholder?: string } = $props();
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
	<InputGroup.Root class="w-full sm:w-72">
		<InputGroup.Input {placeholder} bind:value={search} aria-invalid={!valid} />
		<InputGroup.Addon><Search /></InputGroup.Addon>
	</InputGroup.Root>
</div>
