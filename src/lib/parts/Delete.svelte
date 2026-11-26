<script lang="ts">
	// upstream flow: trash icon → ✓ confirm / ✗ cancel
	import { Button } from '$lib/components/ui/button/index.js';
	import Trash from '@lucide/svelte/icons/trash-2';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import { slide } from 'svelte/transition';

	import type { Component } from 'svelte';
	let { func, show = false, disabled = false, logo: Logo = Trash }: { func: () => void | Promise<void>; show?: boolean; disabled?: boolean; label?: string; logo?: Component } = $props();
	let busy = $state(false);
</script>

<div class="flex items-center justify-end gap-1">
	{#if show}
		<span transition:slide={{ axis: 'x' }} class="flex gap-1">
			<Button
				size="icon-sm"
				variant="ghost"
				disabled={busy || disabled}
				aria-label="Confirm"
				onclick={async () => { busy = true; try { await func(); } finally { busy = false; show = false; } }}
			><Check /></Button>
			<Button size="icon-sm" variant="ghost" disabled={busy} aria-label="Cancel" onclick={() => (show = false)}><X /></Button>
		</span>
	{/if}
	<Button size="icon-sm" variant="ghost" class="text-destructive" {disabled} aria-label="Delete" onclick={() => (show = !show)}><Logo /></Button>
</div>
