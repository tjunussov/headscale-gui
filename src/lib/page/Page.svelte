<script lang="ts">
	import type { Snippet } from 'svelte';
	let { classes = '', children }: { classes?: string; children: Snippet } = $props();
</script>

<div class="flex flex-col gap-4 md:gap-6 {classes}">{@render children()}</div>
