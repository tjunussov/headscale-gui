<script lang="ts">
	import AclToolbar from '$lib/parts/AclToolbar.svelte';
	import { saveConfig, type ACLBuilder } from '$lib/common/acl.svelte';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	
	import NewItem from '$lib/parts/NewItem.svelte';
	import HostListCard from '$lib/cards/acl/HostListCard.svelte';
	import { debug } from '$lib/common/debug';
	import { App } from '$lib/States.svelte';


	let {acl = $bindable(), loading = $bindable(false)}: {acl: ACLBuilder, loading?: boolean} = $props();

	const userNames = $derived(App.usersAcl.map((u) => u.name))

	let showCreateHost = $state(false);
	let newHostName = $state('');
	let newHostCIDR = $state('');

	let hostsFilter = $state('');

	function toggleShowCreateHost(){
		showCreateHost = !showCreateHost;
	}

	function newHost() {
		loading = true;
		try {
			acl.createHost(newHostName, newHostCIDR);
			toastSuccess(`Host '${newHostName}' created`);
			newHostName = '';
			newHostCIDR = '';
			showCreateHost = false;
		} catch (e) {
			debug(e)
			if (e instanceof Error) {
				toastError('', e);
			}
		} finally {
			loading = false;
		}
	}

	const filteredHosts = $derived.by(() => {
		const hosts = acl.getHosts()
		if (hostsFilter === '') {
			return hosts
		}

		try {
			const r = RegExp(hostsFilter);
			return hosts.filter(([k, _]) => r.test(k))
		} catch {
			debug(`Host Regex "${hostsFilter}" is invalid`);
			return hosts;
		}
	});
</script>

<div class="flex flex-col gap-4">
<AclToolbar bind:filter={hostsFilter} placeholder="Filter Hosts..." label="Create Host" onclick={toggleShowCreateHost} {loading} save={() => saveConfig(acl, { setLoadingTrue: () => (loading = true), setLoadingFalse: () => (loading = false) })}>
	{#if showCreateHost}<NewItem title="Host" disabled={loading} bind:name={newHostName} bind:value={newHostCIDR} submit={() => newHost()} />{/if}
</AclToolbar>
<div class="divide-y rounded-lg border">
	{#each filteredHosts as [hostName, hostCIDR] (hostName)}
		<HostListCard bind:acl {hostName} {hostCIDR} {userNames} />
	{:else}
		<p class="p-4 text-sm text-muted-foreground">No hosts defined.</p>
	{/each}
</div>
</div>
