<script lang="ts">
	import type { ACLBuilder } from '$lib/common/acl.svelte';
	import { toastSuccess, toastError } from '$lib/common/funcs';
	import { debug } from '$lib/common/debug';
	import { App } from '$lib/States.svelte';
	import Delete from '$lib/parts/Delete.svelte';
	import MultiSelect from '$lib/parts/MultiSelect.svelte';
	import ObjectPicker from '$lib/parts/ObjectPicker.svelte';
	import ObjectList from '$lib/parts/ObjectList.svelte';
	import ListEntry from './ListEntry.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Terminal from '@lucide/svelte/icons/square-terminal';

	let { acl = $bindable(), idx, open = $bindable(), loading = $bindable(false) }: { acl: ACLBuilder; idx: number; open: boolean; loading?: boolean } = $props();

	const userNames = $derived(App.users.value.map((u) => u.name).toSorted());
	const tags = $derived(acl.getTagNames(true));
	const rule = $derived.by(() => ({
		get src() { return acl.getSshRule(idx).src; },
		get dst() { return acl.getSshRule(idx).dst; },
		get users() { return acl.getSshRule(idx).users; },
		set users(u: string[]) { acl.setSshRuleUsers(idx, u); },
		get action() { return acl.getSshRule(idx).action; },
	}));

	const push = (arr: string[]) => (host: string) => { if (!host) throw new Error('Invalid Host Provided'); arr.push(host); };

	function deleteSshRule() {
		try { acl.delSshRule(idx); toastSuccess(`SSH Rule #${idx + 1} has been deleted`); }
		catch (e) { if (e instanceof Error) toastError('', e); debug(e); }
	}
</script>

<ListEntry name={'SSH Rule #' + (idx + 1)} logo={Terminal} bind:open>
	{#snippet meta()}<Badge variant="outline">{rule.action}</Badge>{/snippet}
	<div class="grid gap-6">
		<div class="grid gap-2">
			<Label>Sources</Label>
			<ObjectPicker options={{ custom: undefined, user: userNames, group: acl.getGroupNames(true), tag: tags }} add={push(rule.src)} />
			<ObjectList items={rule.src} remove={(i) => rule.src.splice(i, 1)} />
		</div>
		<div class="grid gap-2">
			<Label>Destinations</Label>
			<ObjectPicker options={{ custom: undefined, user: userNames, tag: tags }} add={push(rule.dst)} />
			<ObjectList items={rule.dst} remove={(i) => rule.dst.splice(i, 1)} />
		</div>
		<div class="grid gap-2">
			<Label>SSH usernames</Label>
			<MultiSelect bind:items={rule.users} placeholder="root, autogroup:nonroot…" onItemClick={(u) => (rule.users = rule.users.filter((x) => x != u))} />
		</div>
		<Delete func={deleteSshRule} label="Delete rule" />
	</div>
</ListEntry>
