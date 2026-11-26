<script lang="ts">
	// Upstream structure: title + list/tile toggle; then [Create] + search; create form slides open below.
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import LayoutList from '@lucide/svelte/icons/layout-list';
	import type { LayoutStyle, Valued } from '$lib/States.svelte';

	type PageHeaderProps = {
		title: string;
		filterString?: string;
		show?: boolean;
		layout?: Valued<LayoutStyle>;
		buttonText?: string;
		button?: Snippet;
	};
	let { title, filterString = $bindable(undefined), show = $bindable(false), layout, buttonText = 'Create', button }: PageHeaderProps = $props();

	const regexIsValid = $derived.by(() => { try { RegExp(filterString ?? ''); return true; } catch { return false; } });
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
		{#if layout}
			<ToggleGroup.Root type="single" variant="outline" value={layout.value} onValueChange={(v) => v && (layout.value = v as LayoutStyle)}>
				<ToggleGroup.Item value="tile" aria-label="Tile view"><LayoutGrid /></ToggleGroup.Item>
				<ToggleGroup.Item value="list" aria-label="List view"><LayoutList /></ToggleGroup.Item>
			</ToggleGroup.Root>
		{/if}
	</div>
	{#if button !== undefined || filterString !== undefined}
		<div class="flex flex-wrap items-center gap-3">
			{#if button !== undefined && buttonText !== ''}
				<Button size="sm" onclick={() => (show = !show)}>{buttonText}</Button>
			{/if}
			{#if filterString !== undefined}
				<Input class="h-8 w-64 md:w-96" placeholder="Search..." bind:value={filterString} aria-invalid={!regexIsValid} />
			{/if}
		</div>
	{/if}
	{#if button !== undefined && show}
		<div transition:slide>{@render button()}</div>
	{/if}
</div>
