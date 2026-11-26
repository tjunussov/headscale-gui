<script lang="ts">
	import type { EventHandler } from 'svelte/elements';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	type TextProps = {
		value: string;
		valueNew: string;
		submit: EventHandler<SubmitEvent, HTMLFormElement>;
		showRenameIcon?: boolean;
		classes?: string;
	};
	let { value = $bindable(), valueNew = $bindable(), submit, showRenameIcon = false, classes }: TextProps = $props();
	let editing = $state(false);
</script>

{#if !editing}
	<button class="group inline-flex items-center gap-1.5 {classes}" onclick={() => { valueNew = value; editing = true; }}>
		{value}
		{#if showRenameIcon}<Pencil class="size-3 opacity-50 group-hover:opacity-100" />{/if}
	</button>
{:else}
	<form class="flex items-center gap-1" onsubmit={(e) => { e.preventDefault(); if (submit(e)) editing = false; }}>
		<Input class="h-8" bind:value={valueNew} autofocus />
		<Button type="submit" size="icon-sm" variant="ghost"><Check /></Button>
		<Button type="button" size="icon-sm" variant="ghost" onclick={() => (editing = false)}><X /></Button>
	</form>
{/if}
