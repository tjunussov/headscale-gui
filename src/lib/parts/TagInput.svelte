<script lang="ts">
	// shadcn-style chip input: badges + inline input, Enter/comma adds, x removes
	import { Badge } from '$lib/components/ui/badge/index.js';
	import X from '@lucide/svelte/icons/x';

	let { value = $bindable([]), disabled = false, placeholder = 'Add…', onchange }: { value: string[]; disabled?: boolean; placeholder?: string; onchange?: (v: string[]) => void } = $props();
	let text = $state('');
	const set = (v: string[]) => ((value = v), onchange?.(v));
	const add = () => { const t = text.trim(); text = ''; if (t && !value.includes(t)) set([...value, t]); };
</script>

<div class="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-xs focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
	{#each value as tag (tag)}
		<Badge variant="secondary" class="gap-1 pr-1">
			{tag}
			<button {disabled} class="rounded-sm opacity-60 hover:opacity-100" onclick={() => set(value.filter((t) => t !== tag))} aria-label="Remove {tag}"><X class="size-3" /></button>
		</Badge>
	{/each}
	<input
		{disabled}
		{placeholder}
		bind:value={text}
		class="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !text && value.length) set(value.slice(0, -1)); }}
		onblur={add}
	/>
</div>
