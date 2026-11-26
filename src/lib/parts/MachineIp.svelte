<script lang="ts">
	// Tailscale-style address: click copies IPv4, ▾ lists every address (+ name) to copy
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { copyToClipboard } from '$lib/common/funcs';
	import type { Node } from '$lib/common/types';

	let { node, class: cls = '' }: { node: Node; class?: string } = $props();
	const v4 = $derived(node.ipAddresses.find((s) => !s.includes(':')) ?? node.ipAddresses[0] ?? '—');
	const stop = (e: Event) => e.stopPropagation();
</script>

<span class="inline-flex items-center gap-0.5">
	<button class="rounded font-mono hover:underline {cls}" title="Copy IP address" onclick={(e) => { stop(e); copyToClipboard(v4, 'Copied ' + v4); }}>{v4}</button>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="rounded p-0.5 text-muted-foreground hover:text-foreground" onclick={stop} aria-label="All addresses"><ChevronDown class="size-3.5" /></DropdownMenu.Trigger>
		<DropdownMenu.Content align="start" onclick={stop}>
			<DropdownMenu.Label class="text-xs font-normal text-muted-foreground">Click to copy</DropdownMenu.Label>
			{#each [node.givenName, ...node.ipAddresses] as a (a)}
				<DropdownMenu.Item class="font-mono text-xs" onSelect={() => copyToClipboard(a, 'Copied ' + a)}>{a}</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</span>
