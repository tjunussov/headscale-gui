<script lang="ts">
	import { ACLBuilder, HAMetaDefault, type AclPolicy } from '$lib/common/acl.svelte';
	import { toastSuccess, toastError } from '$lib/common/funcs';
	import { debug } from '$lib/common/debug';
	import { App } from '$lib/States.svelte';
	import Delete from '$lib/parts/Delete.svelte';
	import ObjectPicker from '$lib/parts/ObjectPicker.svelte';
	import ObjectList from '$lib/parts/ObjectList.svelte';
	import ListEntry from './ListEntry.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Shield from '@lucide/svelte/icons/shield';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let { acl = $bindable(), idx, loading = $bindable(false), reorderUp, reorderDown }: { acl: ACLBuilder; idx: number; loading?: boolean; reorderUp: () => void; reorderDown: () => void } = $props();

	const userNames = $derived(App.usersAcl.map((u) => u.name).toSorted());
	const objects = $derived({ custom: undefined, user: userNames, host: acl.getHostNames(), group: acl.getGroupNames(true), tag: acl.getTagNames(true) });

	const policy = $derived.by(() => ({
		get policy() { return acl.getPolicy(idx); },
		set policy(p: AclPolicy) { acl.setPolicy(idx, p); },
		get src() { return acl.getPolicy(idx).src; },
		get dst() { return acl.getPolicy(idx).dst; },
		get proto() { return acl.getPolicy(idx).proto; },
		set proto(p: string | undefined) { acl.setPolicyProto(idx, p); },
	}));

	const opener = $derived.by(() => ({
		get open() { return policy.policy['#ha-meta']?.open ?? HAMetaDefault.open; },
		set open(o: boolean) { ACLBuilder.addPolicyMeta(policy.policy); if (policy.policy['#ha-meta']) policy.policy['#ha-meta'].open = o; },
	}));

	let name = $state(acl.getPolicy(idx)['#ha-meta']?.name ?? '');
	function setName(n: string) {
		policy.policy['#ha-meta'] ??= { ...HAMetaDefault };
		policy.policy['#ha-meta'].name = n;
	}

	function deletePolicy() {
		loading = true;
		try { acl.delPolicy(idx); toastSuccess(`Policy #${idx + 1} has been deleted`); }
		catch (e) { if (e instanceof Error) toastError('', e); debug(e); }
		finally { loading = false; }
	}

	function addSrc(host: string) {
		if (!host) throw new Error('Invalid Host Provided');
		policy.src.push(host);
	}

	function addDst(host: string, ports: string) {
		if (!host) throw new Error('Invalid Host Provided');
		if (policy.proto === 'icmp') ports = '*';
		ports = ports.replaceAll(' ', '') || '*';
		for (const p of ports.split(',')) {
			if (p === '*') continue;
			const n = parseInt(p, 10);
			if (isNaN(n) || n < 1 || n > 65535) throw new Error('Invalid Port Number Provided');
		}
		policy.dst.push(host + ':' + ports);
	}
</script>

<div class="flex items-start gap-2">
	<div class="flex flex-col pt-1.5">
		<Button size="icon-xs" variant="ghost" disabled={idx === 0} onclick={reorderUp} aria-label="Move up"><ChevronUp /></Button>
		<Button size="icon-xs" variant="ghost" disabled={idx === acl.acls.length - 1} onclick={reorderDown} aria-label="Move down"><ChevronDown /></Button>
	</div>
	<div class="min-w-0 flex-1">
		<ListEntry name={ACLBuilder.getPolicyTitle(policy.policy, idx)} logo={Shield} bind:open={opener.open}>
			<div class="grid gap-6">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="grid gap-2">
						<Label for="policy-name-{idx}">Name:</Label>
						<Input id="policy-name-{idx}" bind:value={name} oninput={() => setName(name)} autocomplete="off"  />
					</div>
					<div class="grid gap-2">
						<Label>Protocol:</Label>
						<ToggleGroup.Root type="single" variant="outline" value={policy.proto ?? 'any'} onValueChange={(v) => (policy.proto = !v || v === 'any' ? undefined : v)}>
							{#each [['any', 'Any'], ['tcp', 'TCP'], ['udp', 'UDP'], ['icmp', 'ICMP']] as [p, l]}<ToggleGroup.Item value={p}>{l}</ToggleGroup.Item>{/each}
						</ToggleGroup.Root>
					</div>
				</div>
				<div class="grid gap-2">
					<Label>Sources:</Label>
					<ObjectPicker options={objects} placeholder="Src Object..." add={addSrc} />
					<ObjectList items={policy.src} remove={(i) => policy.src.splice(i, 1)} />
				</div>
				<div class="grid gap-2">
					<Label>Destinations:</Label>
					<ObjectPicker options={objects} placeholder="Dst Object..." ports portsDisabled={policy.proto === 'icmp'} add={addDst} />
					<ObjectList items={policy.dst} remove={(i) => policy.dst.splice(i, 1)} render={(d) => [ACLBuilder.getPolicyDstHost(d), ACLBuilder.getPolicyDstPorts(d)]} />
				</div>
				<Delete func={deletePolicy} />
			</div>
		</ListEntry>
	</div>
</div>
