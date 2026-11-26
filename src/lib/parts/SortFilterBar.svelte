<script lang="ts">
	// upstream: [ID][Name](Last Seen) sort group + [All][Online][Offline] filter group
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import SortBtn from './SortBtn.svelte';
	import FilterOnlineBtn from './FilterOnlineBtn.svelte';
	import type { Direction, OnlineStatus } from '$lib/common/types';

	let { sortMethod = $bindable(), sortDirection = $bindable(), filterOnlineStatus = $bindable(), sorts }: { sortMethod: string; sortDirection: Direction; filterOnlineStatus: OnlineStatus; sorts: string[] } = $props();

	function toggle(method: string) {
		if (method !== sortMethod) { sortMethod = method; sortDirection = 'up'; }
		else sortDirection = sortDirection === 'up' ? 'down' : 'up';
	}
</script>

<div class="flex flex-wrap gap-2">
	<ButtonGroup.Root>
		{#each sorts as name}<SortBtn bind:value={sortMethod} direction={sortDirection} {name} {toggle} />{/each}
	</ButtonGroup.Root>
	<ButtonGroup.Root>
		<FilterOnlineBtn bind:value={filterOnlineStatus} status="all" name="All" />
		<FilterOnlineBtn bind:value={filterOnlineStatus} status="online" name="Online" />
		<FilterOnlineBtn bind:value={filterOnlineStatus} status="offline" name="Offline" />
	</ButtonGroup.Root>
</div>
