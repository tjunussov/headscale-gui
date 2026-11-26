<script lang="ts">
	import { disableRoutes, enableRoutes } from '$lib/common/api';
	import type { Node } from '$lib/common/types';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { isExpired } from '$lib/common/funcs';
	import { debug } from '$lib/common/debug';

	let { route, node, disable = false, loading = $bindable(false) }: { route: string; node: Node; disable?: boolean; loading?: boolean } = $props();
	const approved = $derived(node.approvedRoutes.includes(route));
	const disabled = $derived(disable || loading || !route || isExpired(node.expiry || ''));

	async function toggle() {
		loading = true;
		try { await (approved ? disableRoutes : enableRoutes)(node, route); } catch (e) { debug(e); } finally { loading = false; }
	}
</script>

<div class="flex items-center justify-between py-1.5">
	<span class="font-mono text-xs">{route}</span>
	<Switch checked={approved} {disabled} onCheckedChange={toggle} aria-label="Approve {route}" />
</div>
