<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import type { Snippet } from 'svelte';
	let { children, open = [] }: { children: Snippet; open?: string[] } = $props();
	let value = $state([...open]);
</script>

<Accordion.Root type="multiple" bind:value class="w-full max-w-4xl rounded-lg border px-4">
	{@render children()}
</Accordion.Root>
