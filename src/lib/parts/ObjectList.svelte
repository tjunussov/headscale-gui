<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import X from '@lucide/svelte/icons/x';
	let { items, remove, render }: { items: string[]; remove: (i: number) => void; render?: (s: string) => [string, string?] } = $props();
</script>

{#if items.length}
	<div class="divide-y rounded-md border">
		{#each items as item, i (item + i)}
			{@const [a, b] = render ? render(item) : [item]}
			<div class="flex items-center gap-3 px-3 py-1.5 font-mono text-sm">
				<span class="flex-1 truncate">{a}</span>
				{#if b}<span class="text-muted-foreground">{b}</span>{/if}
				<Button size="icon-xs" variant="ghost" onclick={() => remove(i)} aria-label="Remove"><X /></Button>
			</div>
		{/each}
	</div>
{:else}
	<p class="text-sm text-muted-foreground">None.</p>
{/if}
