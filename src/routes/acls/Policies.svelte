<script lang="ts">
	import AclToolbar from '$lib/parts/AclToolbar.svelte';
	import { ACLBuilder, HAMetaDefault, type AclPolicies, type AclPoliciesIndexed } from '$lib/common/acl.svelte';
	import { debug } from '$lib/common/debug';
	import { toastSuccess } from '$lib/common/funcs';

	import PolicyListCard from '$lib/cards/acl/PolicyListCard.svelte';


	let {acl = $bindable(), loading = $bindable(false)}: {acl: ACLBuilder, loading?: boolean} = $props();
	let policyFilterString = $state('')

	const filteredPolicies = $derived.by(() => {
		const policiesIndexed = acl.getAllPolicies().map((policy, idx) => ({policy, idx}))
		try{
			if (policyFilterString === '') {
				return policiesIndexed
			}

			const r = RegExp(policyFilterString.toLowerCase())
			return policiesIndexed.filter(({policy, idx}) => {
				return policy.src.some(src => r.test(src)) ||
				policy.dst.some(dst => r.test(dst)) ||
				(policy.proto !== undefined && r.test(policy.proto)) ||
				(r.test(ACLBuilder.getPolicyTitle(policy, idx).toLowerCase()))
			})
		} catch {
			debug(`Policy Regex "${policyFilterString}" is invalid`);
			return policiesIndexed;
		}
	});

	function newPolicy() {
		const policy = ACLBuilder.EmptyPolicy()
		ACLBuilder.addPolicyMeta(policy)

		acl.createPolicy(policy)
		debug("created new policy at index " + (acl.acls.length - 1).toString())
		toastSuccess('Created Policy #' + acl.acls.length)
	}

	function makeReorderFunc(idx: number, direction: 'up' | 'down'): () => void {
		return () => {
			const length = acl.acls.length
			if((idx === 0 && direction === 'up')
			|| (idx === (length - 1) && direction === 'down')
			) {
				return
			}

			const targetIdx = direction === "up" ? idx - 1 : idx + 1;
			const temp = acl.acls[targetIdx];
			acl.acls[targetIdx] = acl.acls[idx];
			acl.acls[idx] = temp;
		}
	}
</script>

<div class="flex flex-col gap-4">
<AclToolbar bind:filter={policyFilterString} placeholder="Filter policies…" label="New policy" onclick={newPolicy}></AclToolbar>
<div class="flex flex-col gap-3">
	{#each filteredPolicies as { idx } (idx)}
		<PolicyListCard bind:acl bind:loading {idx} reorderUp={makeReorderFunc(idx, 'up')} reorderDown={makeReorderFunc(idx, 'down')} />
	{/each}
</div>
</div>
