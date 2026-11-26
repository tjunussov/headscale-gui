<script lang="ts">
	import type { Node } from '$lib/common/types';
	import StatusDot from './StatusDot.svelte';
	let { node = $bindable(), label = false }: { node: Node; label?: boolean } = $props();
</script>

<StatusDot online={node.online} {label} />
