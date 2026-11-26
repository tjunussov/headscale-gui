<script lang="ts">
	// chips + combobox (shadcn Popover + Command); free text when no options
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TagInput from './TagInput.svelte';
	import X from '@lucide/svelte/icons/x';
	import Plus from '@lucide/svelte/icons/plus';

	let { items = $bindable(), options, placeholder = 'Add…', onItemClick }: { id?: string; items: string[]; options?: string[]; placeholder?: string; onItemClick: (item: string) => void } = $props();
	let open = $state(false);
	const available = $derived((options ?? []).filter((o) => !items.includes(o)));
</script>

{#if options === undefined}
	<TagInput value={items} {placeholder} onchange={(v) => { v.filter((x) => !items.includes(x)).forEach((x) => items.push(x)); items.filter((x) => !v.includes(x)).forEach(onItemClick); }} />
{:else}
	<div class="flex flex-wrap items-center gap-1.5">
		{#each items as item (item)}
			<Badge variant="secondary" class="gap-1 pr-1">
				{item}<button class="rounded-sm opacity-60 hover:opacity-100" onclick={() => onItemClick(item)} aria-label="Remove {item}"><X class="size-3" /></button>
			</Badge>
		{/each}
		<Popover.Root bind:open>
			<Popover.Trigger>{#snippet child({ props })}<Button variant="outline" size="xs" {...props}><Plus />Add</Button>{/snippet}</Popover.Trigger>
			<Popover.Content class="w-64 p-0" align="start">
				<Command.Root>
					<Command.Input {placeholder} />
					<Command.List>
						<Command.Empty>Nothing to add.</Command.Empty>
						<Command.Group>
							{#each available as opt (opt)}
								<Command.Item value={opt} onSelect={() => { items.push(opt); open = false; }}>{opt}</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</div>
{/if}
