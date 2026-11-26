<script lang="ts">
	import { saveConfig, type ACLBuilder } from '$lib/common/acl.svelte';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import AutoApproverListCard from '$lib/cards/acl/AutoApproverListCard.svelte';
	import ObjectPicker from '$lib/parts/ObjectPicker.svelte';
	import ObjectList from '$lib/parts/ObjectList.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Save from '@lucide/svelte/icons/save';
	import { App } from '$lib/States.svelte';

	let { acl = $bindable(), loading = $bindable(false) }: { acl: ACLBuilder; loading?: boolean } = $props();

	let newRoute = $state('');
	const routeEntries = $derived(acl.getAutoApproverRouteEntries());
	const approvers = $derived({ user: App.usersAcl.map((u) => u.name).toSorted(), group: acl.getGroupNames(true), tag: acl.getTagNames(true) });
	const exitNode = $derived(acl.autoApprovers.exitNode);

	function createRoute(e: Event) {
		e.preventDefault();
		try {
			const r = newRoute.trim();
			if (!r) throw new Error('Route CIDR cannot be empty');
			acl.createAutoApproverRoute(r);
			toastSuccess(`Route '${r}' added`);
			newRoute = '';
		} catch (err) {
			if (err instanceof Error) toastError('', err);
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div>
		<Button size="icon" disabled={loading} aria-label="Save" onclick={() => saveConfig(acl, { setLoadingTrue: () => (loading = true), setLoadingFalse: () => (loading = false) })}><Save /></Button>
	</div>

	<Card.Root>
		<Card.Content class="grid gap-2">
			<Label>Exit Node Approvers:</Label>
			<ObjectPicker options={approvers} placeholder="Approver..." add={(v) => exitNode.push(v)} />
			<ObjectList items={exitNode} remove={(i) => exitNode.splice(i, 1)} />
		</Card.Content>
	</Card.Root>

	<form class="grid gap-2" onsubmit={createRoute}>
		<Label for="aa-route">Routes:</Label>
		<div class="flex gap-2">
			<Input id="aa-route" class="font-mono" autocomplete="off" placeholder="Route CIDR (e.g. 10.0.0.0/8)..." bind:value={newRoute} />
			<Button type="submit" disabled={loading}>Add Route</Button>
		</div>
	</form>

	<div class="flex flex-col gap-3">
		{#each routeEntries as [route] (route)}
			<AutoApproverListCard bind:acl {route} {approvers} bind:loading />
		{/each}
	</div>
</div>
