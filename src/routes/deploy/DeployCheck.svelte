<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let { name, help, checked = $bindable(), children }: { name: string; help?: string; checked: boolean; children?: Snippet } = $props();
	const id = 'deploy-' + name.toLowerCase().replace(/\W+/g, '-');
</script>

<div class="flex flex-col gap-3 py-3">
	<div class="flex items-start justify-between gap-4">
		<div class="grid gap-1">
			<Label for={id}>{name}</Label>
			{#if help}<p class="text-sm text-muted-foreground">{help}</p>{/if}
		</div>
		<Switch {id} bind:checked />
	</div>
	{#if children && checked}<div transition:slide>{@render children()}</div>{/if}
</div>
