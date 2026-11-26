<script lang="ts">
	// one accordion row: [status] ID: n ............ name  ⌄
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import type { Snippet } from 'svelte';
	let { id, label, lead, children }: { id: string; label: string; lead?: Snippet; children: Snippet } = $props();
</script>

<Accordion.Item value={id}>
	<Accordion.Trigger class="items-center hover:no-underline">
		<span class="flex flex-1 items-center gap-3">
			{@render lead?.()}
			<span class="text-muted-foreground">ID: {id}</span>
			<span class="ms-auto font-semibold">{label}</span>
		</span>
	</Accordion.Trigger>
	<Accordion.Content>{@render children()}</Accordion.Content>
</Accordion.Item>
