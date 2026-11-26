<script lang="ts">
	import { onMount } from 'svelte';
	import JWCC from 'json5';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Save from '@lucide/svelte/icons/save';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { ACLBuilder, saveConfig, type ACL } from '$lib/common/acl.svelte';
	import { debug } from '$lib/common/debug';
	import { getPolicy } from '$lib/common/api';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import Config from './Config.svelte';
	import Groups from './Groups.svelte';
	import Hosts from './Hosts.svelte';
	import Policies from './Policies.svelte';
	import TagOwners from './TagOwners.svelte';
	import SshRules from './SshRules.svelte';

	let acl = $state(ACLBuilder.defaultACL());
	let loading = $state(false);
	let tab = $state('policies');

	const tabs = [
		['policies', 'Policies', Policies],
		['groups', 'Groups', Groups],
		['tag-owners', 'Tag Owners', TagOwners],
		['hosts', 'Hosts', Hosts],
		['ssh', 'SSH', SshRules],
		['config', 'Config', Config],
	] as const;

	function load(notify = false) {
		loading = true;
		getPolicy()
			.then((p) => { acl = ACLBuilder.fromPolicy(JWCC.parse<ACL>(p)); notify && toastSuccess('Loaded ACL policy from server'); })
			.catch((e) => { debug('failed to get policy:', e); toastError('Unable to get policy from server.', e); })
			.finally(() => (loading = false));
	}
	onMount(load);
</script>

<PageHeader title="Access Control" description="Build the tailnet ACL policy. Changes are local until you save.">
	{#snippet actions()}
		<Button variant="outline" size="sm" disabled={loading} onclick={() => load(true)}><RefreshCw />Reload</Button>
		<Button size="sm" disabled={loading} onclick={() => saveConfig(acl, { setLoadingTrue: () => (loading = true), setLoadingFalse: () => (loading = false) })}><Save />Save policy</Button>
	{/snippet}
</PageHeader>

<Tabs.Root bind:value={tab} class="gap-4">
	<Tabs.List class="max-w-full overflow-x-auto">
		{#each tabs as [value, label]}<Tabs.Trigger {value}>{label}</Tabs.Trigger>{/each}
	</Tabs.List>
	{#each tabs as [value, , Comp]}
		<Tabs.Content {value}><Comp bind:acl bind:loading /></Tabs.Content>
	{/each}
</Tabs.Root>
