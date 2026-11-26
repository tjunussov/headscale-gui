<script lang="ts">
	import AclToolbar from '$lib/parts/AclToolbar.svelte';
	import { ACLBuilder, type AclSshRules, type AclSshRulesIndexed } from '$lib/common/acl.svelte';
	import { debug } from '$lib/common/debug';
	import { toastSuccess } from '$lib/common/funcs';

	import SshRuleListCard from '$lib/cards/acl/SshRuleListCard.svelte';


	type SshRuleProps = {
		acl: ACLBuilder,
		loading?: boolean,
	}

	let {
		acl = $bindable(),
		loading = $bindable(false)
	}: SshRuleProps = $props();

	let sshRuleFilterString = $state('')
	const filteredSshRules = $derived.by(() => {
		const rules = acl.getAllSshRules()

		if (rules === undefined) {
			return []
		}

		const rulesIndexed = rules.map((rule, idx) => ({rule, idx}))
		try{
			if (sshRuleFilterString === '') {
				return rulesIndexed
			}

			const r = RegExp(sshRuleFilterString)
			return rulesIndexed.filter(({rule}) => {
				return rule.src.some(src => r.test(src)) ||
				rule.dst.some(dst => r.test(dst)) ||
				rule.users.some(user => r.test(user))
			})
		} catch {
			debug(`SSH Rule Regex "${sshRuleFilterString}" is invalid`);
			return rulesIndexed;
		}
	});

	function newSshRule() {
		acl.createSshRule(ACLBuilder.DefaultSshRule())
		if (acl.ssh !== undefined){
			debug("created new SSH rule at index " + (acl.ssh.length - 1).toString())
			toastSuccess('Created SSH Rule #' + acl.acls.length)
		}
	}
</script>

<div class="flex flex-col gap-4">
<AclToolbar bind:filter={sshRuleFilterString} placeholder="Filter SSH rules…" label="New SSH rule" onclick={newSshRule}></AclToolbar>
<div class="flex flex-col gap-3">
	{#each filteredSshRules as { idx } (idx)}
		<SshRuleListCard bind:acl bind:loading {idx} open />
	{/each}
</div>
</div>
