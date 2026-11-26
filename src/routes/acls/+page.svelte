<script lang="ts">
	import { onMount } from 'svelte';
	import JWCC from 'json5';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Users from '@lucide/svelte/icons/users';
	import Tag from '@lucide/svelte/icons/tag';
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import Shield from '@lucide/svelte/icons/shield';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import Braces from '@lucide/svelte/icons/braces';
	import { ACLBuilder, type ACL } from '$lib/common/acl.svelte';
	import { debug } from '$lib/common/debug';
	import { getPolicy } from '$lib/common/api';
	import { toastError } from '$lib/common/funcs';
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import Config from './Config.svelte';
	import Groups from './Groups.svelte';
	import Hosts from './Hosts.svelte';
	import Policies from './Policies.svelte';
	import TagOwners from './TagOwners.svelte';
	import SshRules from './SshRules.svelte';
	import AutoApprovers from './AutoApprovers.svelte';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';

	let acl = $state(ACLBuilder.defaultACL());
	let loading = $state(false);
	let tab = $state('groups');

	// same tabs/order as upstream
	const tabs = [
		{ name: 'groups', title: 'Groups', logo: Users, comp: Groups },
		{ name: 'tag-owners', title: 'Tag Owners', logo: Tag, comp: TagOwners },
		{ name: 'hosts', title: 'Hosts', logo: MonitorSmartphone, comp: Hosts },
		{ name: 'policies', title: 'Policies', logo: Shield, comp: Policies },
		{ name: 'ssh', title: 'SSH', logo: SquareTerminal, comp: SshRules },
		{ name: 'auto-approvers', title: 'Auto Approvers', logo: BadgeCheck, comp: AutoApprovers },
		{ name: 'config', title: 'Config', logo: Braces, comp: Config },
	];

	onMount(() => {
		getPolicy()
			.then((policy) => (acl = ACLBuilder.fromPolicy(JWCC.parse<ACL>(policy))))
			.catch((reason) => { debug('failed to get policy:', reason); toastError('Unable to get policy from server.', reason); });
	});
</script>

<Page>
	<PageHeader title="ACL Builder" />
	<Tabs.Root bind:value={tab} class="gap-4">
		<Tabs.List class="max-w-full overflow-x-auto">
			{#each tabs as t (t.name)}<Tabs.Trigger value={t.name}><t.logo />{t.title}</Tabs.Trigger>{/each}
		</Tabs.List>
		{#each tabs as t (t.name)}
			<Tabs.Content value={t.name} class="max-w-4xl"><t.comp bind:acl bind:loading /></Tabs.Content>
		{/each}
	</Tabs.Root>
</Page>
