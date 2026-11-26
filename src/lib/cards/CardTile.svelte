<script lang="ts">
	// upstream tile: [status] ID: n ..... name, then label/value rows; click opens drawer
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Snippet } from 'svelte';
	let { id, label, lead, onclick, children }: { id: string; label: string; lead?: Snippet; onclick?: () => void; children: Snippet } = $props();
</script>

<Card.Root
	class="gap-4 {onclick ? 'cursor-pointer transition-colors hover:border-foreground/25' : ''}"
	role={onclick ? 'button' : undefined}
	tabindex={onclick ? 0 : undefined}
	{onclick}
	onkeydown={(e: KeyboardEvent) => onclick && e.key === 'Enter' && onclick()}
>
	<Card.Header class="flex items-center gap-2">
		{@render lead?.()}
		<Card.Title>ID: {id}</Card.Title>
		<span class="ms-auto truncate font-semibold">{label}</span>
	</Card.Header>
	<Card.Content class="grid gap-2 text-sm">{@render children()}</Card.Content>
</Card.Root>
