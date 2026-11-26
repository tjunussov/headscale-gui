<script lang="ts">
	// online = green (the one status color besides destructive), offline = hollow grey ring
	import { Badge } from '$lib/components/ui/badge/index.js';
	let { online, label = false }: { online: boolean; label?: boolean } = $props();
</script>

{#snippet dot()}<span class="inline-block size-2 shrink-0 rounded-full {online ? 'bg-emerald-500' : 'border border-muted-foreground/60'}"></span>{/snippet}
{#if label && !online}
	<Badge variant="outline" class="gap-1.5 px-1.5 text-muted-foreground">{@render dot()}Offline</Badge>
{:else}
	<!-- online: the green dot alone says it -->
	<span class="inline-flex items-center" title={online ? 'Online' : 'Offline'}>{@render dot()}</span>
{/if}
