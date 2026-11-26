<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Direction } from '$lib/common/types';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';

	let { name, key = name.toLowerCase(), sort = $bindable(), dir = $bindable(), class: cls = '' }: { name: string; key?: string; sort: string; dir: Direction; class?: string } = $props();
	const toggle = () => (sort === key ? (dir = dir === 'up' ? 'down' : 'up') : ((sort = key), (dir = 'up')));
</script>

<Table.Head class={cls}>
	<button class="-ms-2 inline-flex h-8 items-center gap-1 rounded-md px-2 hover:bg-accent" onclick={toggle}>
		{name}
		{#if sort !== key}<ChevronsUpDown class="size-3.5 opacity-40" />{:else if dir === 'up'}<ArrowUp class="size-3.5" />{:else}<ArrowDown class="size-3.5" />{/if}
	</button>
</Table.Head>
