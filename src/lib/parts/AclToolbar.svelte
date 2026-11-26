<script lang="ts">
	// upstream ACL tab header: [save] [Create X], inline create form, then filter input
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Save from '@lucide/svelte/icons/save';
	import type { Snippet } from 'svelte';

	let { filter = $bindable(''), placeholder, label, onclick, save, loading = false, children }: { filter: string; placeholder: string; label: string; onclick: () => void; save: () => void; loading?: boolean; children?: Snippet } = $props();
</script>

<div class="flex flex-col gap-3">
	<div class="flex gap-2">
		<Button size="icon-sm" disabled={loading} onclick={save} aria-label="Save ACL" title="Save ACL"><Save /></Button>
		<Button size="sm" variant="outline" {onclick}>{label}</Button>
	</div>
	{@render children?.()}
	<Input class="h-8 max-w-xl" autocomplete="off" {placeholder} bind:value={filter} />
</div>
