<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Trash from '@lucide/svelte/icons/trash-2';

	type DeleteProps = { func: () => void | Promise<void>; show?: boolean; disabled?: boolean; label?: string };
	let { func, show = false, disabled = false, label = 'Delete' }: DeleteProps = $props();
	let busy = $state(false);
</script>

<div class="flex items-center justify-end gap-2">
	{#if show}
		<Button size="sm" variant="ghost" disabled={busy} onclick={() => (show = false)}>Cancel</Button>
		<Button
			size="sm"
			variant="destructive"
			disabled={busy || disabled}
			onclick={async () => {
				busy = true;
				try { await func(); } finally { busy = false; show = false; }
			}}>Confirm</Button
		>
	{:else}
		<Button size="sm" variant="outline" class="text-destructive" {disabled} onclick={() => (show = true)}>
			<Trash />{label}
		</Button>
	{/if}
</div>
