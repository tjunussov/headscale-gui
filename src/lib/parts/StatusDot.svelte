<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	let { online, label = false }: { online: boolean; label?: boolean } = $props();
</script>

{#snippet dot()}<span class="inline-block size-2 shrink-0 rounded-full {online ? 'bg-emerald-500' : 'bg-muted-foreground/40'}"></span>{/snippet}
{#if label}
	<Badge variant="outline" class="gap-1.5 px-1.5 text-muted-foreground">{@render dot()}{online ? 'Online' : 'Offline'}</Badge>
{:else}
	{@render dot()}
{/if}
