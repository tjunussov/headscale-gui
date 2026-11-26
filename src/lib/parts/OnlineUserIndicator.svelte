<script lang="ts">
	import type { User } from '$lib/common/types';
	import StatusDot from './StatusDot.svelte';
	import { App } from '$lib/States.svelte';
	let { user = $bindable(), label = false }: { user: User; label?: boolean } = $props();
</script>

<StatusDot online={App.nodes.value.some((n) => n.online && n.user.id == user.id)} {label} />
