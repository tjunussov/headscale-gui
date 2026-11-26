<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Component, Snippet } from 'svelte';

	let { name, logo: Logo, open = $bindable(false), meta, children }: { id?: string; name: string; logo: Component; open?: boolean; meta?: Snippet; children?: Snippet; nameClasses?: string; logoClasses?: string } = $props();
</script>

<Collapsible.Root bind:open class="rounded-lg border bg-card">
	<Collapsible.Trigger class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50">
		<Logo class="size-4 text-muted-foreground" />
		<span class="flex-1 truncate">{name}</span>
		{@render meta?.()}
		<ChevronRight class="size-4 text-muted-foreground transition-transform {open ? 'rotate-90' : ''}" />
	</Collapsible.Trigger>
	<Collapsible.Content class="border-t px-4 py-4">{@render children?.()}</Collapsible.Content>
</Collapsible.Root>
