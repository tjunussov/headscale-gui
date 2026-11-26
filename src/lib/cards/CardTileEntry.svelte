<script lang="ts">
	import type { Snippet } from 'svelte';
	let { title, children }: { title?: string; children?: Snippet } = $props();
</script>

<div class="flex items-center justify-between gap-4">
	{#if title}<span class="font-medium">{title}</span>{/if}
	<span class="flex items-center gap-2 text-right">{@render children?.()}</span>
</div>
