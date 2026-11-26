<script lang="ts">
	// online = green (the one status color besides destructive), offline = hollow grey ring
	import { Badge } from '$lib/components/ui/badge/index.js';
	let { online, label = false }: { online: boolean; label?: boolean } = $props();
</script>

{#snippet dot()}<span class="inline-block size-2 shrink-0 rounded-full {online ? 'bg-emerald-500' : 'border border-muted-foreground/60'}"></span>{/snippet}
{#if label}
	<Badge variant="outline" class="gap-1.5 px-1.5 {online ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}">{@render dot()}{online ? 'Online' : 'Offline'}</Badge>
{:else}
	{@render dot()}
{/if}
