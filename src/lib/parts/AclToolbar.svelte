<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import type { Snippet } from 'svelte';

	let { filter = $bindable(''), placeholder, label, onclick, children }: { filter: string; placeholder: string; label: string; onclick: () => void; children?: Snippet } = $props();
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<InputGroup.Root class="w-full sm:w-72">
			<InputGroup.Input {placeholder} bind:value={filter} autocomplete="off" />
			<InputGroup.Addon><Search /></InputGroup.Addon>
		</InputGroup.Root>
		<Button size="sm" variant="outline" {onclick}><Plus />{label}</Button>
	</div>
	{@render children?.()}
</div>
