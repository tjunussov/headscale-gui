<script lang="ts">
	import type { ACLBuilder } from '$lib/common/acl.svelte';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import CardListContainer from '$lib/cards/CardListContainer.svelte';
	import Delete from '$lib/parts/Delete.svelte';
	import ObjectPicker from '$lib/parts/ObjectPicker.svelte';
	import ObjectList from '$lib/parts/ObjectList.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import Route from '@lucide/svelte/icons/route';
	import ListEntry from './ListEntry.svelte';

	let { acl = $bindable(), route, approvers, loading = $bindable(false) }: { acl: ACLBuilder; route: string; approvers: Record<string, string[]>; loading?: boolean } = $props();
	let open = $state(false);
	const items = $derived(acl.autoApprovers.routes[route] ?? []);

	function deleteRoute() {
		try {
			acl.deleteAutoApproverRoute(route);
			toastSuccess(`Route '${route}' removed`);
		} catch (e) {
			if (e instanceof Error) toastError('', e);
		}
	}
</script>

<ListEntry id={route} name={route} logo={Route} bind:open>
	{#snippet children()}
		<CardListContainer>
			<div class="grid gap-2">
				<Label>Approvers:</Label>
				<ObjectPicker options={approvers} placeholder="Approver..." add={(v) => items.push(v)} />
				<ObjectList {items} remove={(i) => items.splice(i, 1)} />
			</div>
			<div class="pt-4"><Delete func={deleteRoute} disabled={loading} /></div>
		</CardListContainer>
	{/snippet}
</ListEntry>
