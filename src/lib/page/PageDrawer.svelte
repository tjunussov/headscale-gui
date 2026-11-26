<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import UserInfo from '$lib/cards/user/UserInfo.svelte';
	import NodeInfo from '$lib/cards/node/NodeInfo.svelte';
	import { drawer, closeDrawer } from '$lib/common/drawer.svelte';
	import { App } from '$lib/States.svelte';

	const user = $derived(drawer.id.startsWith('userDrawer-') ? (App.users.value.find((u) => u.id === drawer.meta?.id) ?? drawer.meta) : null);
	const node = $derived(drawer.id.startsWith('nodeDrawer-') ? (App.nodes.value.find((n) => n.id === drawer.meta?.id) ?? drawer.meta) : null);
</script>

<Sheet.Root open={!!drawer.id} onOpenChange={(o) => !o && closeDrawer()}>
	<Sheet.Content class="w-full overflow-y-auto sm:max-w-xl">
		<Sheet.Header>
			<Sheet.Title>{user?.name ?? node?.givenName ?? ''}</Sheet.Title>
		</Sheet.Header>
		<div class="px-4 pb-6">
			{#if user}{#key user.id}<UserInfo {user} />{/key}{/if}
			{#if node}{#key node.id}<NodeInfo {node} />{/key}{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
