<script lang="ts">
	// upstream: [info] [checkbox] Name; children shown when checked
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Info from '@lucide/svelte/icons/info';
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let { name, help, checked = $bindable(), children }: { name: string; help?: string; checked: boolean; children?: Snippet } = $props();
	const id = $derived('checkbox-' + name.toLowerCase().replace(/\W+/g, '-'));
</script>

<div class="col-span-12 flex flex-col pb-4 sm:col-span-6">
	<div class="flex items-center gap-2">
		{#if help}
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger class="text-muted-foreground hover:text-foreground"><Info class="size-4" /></Tooltip.Trigger>
					<Tooltip.Content>{help}</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		{/if}
		<Checkbox {id} bind:checked />
		<Label for={id} class="font-normal">{name}</Label>
	</div>
	{#if children && checked}<div transition:slide class="pt-3 pr-4">{@render children()}</div>{/if}
</div>
