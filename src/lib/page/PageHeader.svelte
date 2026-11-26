<script lang="ts">
	// Design A layout, B features:
	//   row 1: title + description          [Create]
	//   row 2: {children} (sort/filter tabs)   [search] [view toggle]
	//   create form slides open below.
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import LayoutList from '@lucide/svelte/icons/layout-list';
	import Table2 from '@lucide/svelte/icons/table-2';
	import type { LayoutStyle, Valued } from '$lib/States.svelte';
	import { page } from '$app/state';
	import { nav } from '$lib/nav';

	type PageHeaderProps = {
		title: string;
		description?: string;
		filterString?: string;
		show?: boolean;
		layout?: Valued<LayoutStyle>;
		layouts?: LayoutStyle[];
		buttonText?: string;
		button?: Snippet;
		children?: Snippet;
		tools?: Snippet; // extra icon buttons at the right end of the toolbar (e.g. export)
		searchPlaceholder?: string;
	};
	let { title, description, filterString = $bindable(undefined), show = $bindable(false), layout, layouts = ['tile', 'list'], buttonText = 'Create', button, children, tools, searchPlaceholder = 'Search… (regex)' }: PageHeaderProps = $props();
	const views = [
		{ value: 'tile' as const, label: 'Tile', icon: LayoutGrid },
		{ value: 'list' as const, label: 'List', icon: LayoutList },
		{ value: 'table' as const, label: 'Table', icon: Table2 },
	];
	// default subtitle comes from the nav entry of the current route
	const subtitle = $derived(description ?? nav.find((n) => n.path === page.route.id)?.description);
	const regexIsValid = $derived.by(() => { try { RegExp(filterString ?? ''); return true; } catch { return false; } });
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
			{#if subtitle}<p class="text-sm text-muted-foreground">{subtitle}</p>{/if}
		</div>
		{#if button !== undefined && buttonText !== ''}
			<Button onclick={() => (show = !show)}><Plus />{buttonText}</Button>
		{/if}
	</div>
	{#if button !== undefined && show}
		<div transition:slide>{@render button()}</div>
	{/if}
	{#if children || filterString !== undefined || layout}
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>{@render children?.()}</div>
			<div class="flex w-full items-center gap-2 sm:w-auto">
				{#if filterString !== undefined}
					<InputGroup.Root class="w-full sm:w-72">
						<InputGroup.Input placeholder={searchPlaceholder} bind:value={filterString} aria-invalid={!regexIsValid} />
						<InputGroup.Addon><Search /></InputGroup.Addon>
					</InputGroup.Root>
				{/if}
				{#if layout}
					<ToggleGroup.Root type="single" variant="outline" value={layout.value} onValueChange={(v) => v && (layout.value = v as LayoutStyle)}>
						{#each views.filter((v) => layouts.includes(v.value)) as v (v.value)}
							<ToggleGroup.Item value={v.value} aria-label="{v.label} view" title="{v.label} view"><v.icon /></ToggleGroup.Item>
						{/each}
					</ToggleGroup.Root>
				{/if}
				{@render tools?.()}
			</div>
		</div>
	{/if}
</div>
