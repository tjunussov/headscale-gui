<script lang="ts">
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { ACLBuilder } from '$lib/common/acl.svelte';
	import { toastSuccess, toastError } from '$lib/common/funcs';
	import Delete from '$lib/parts/Delete.svelte';
	import { debug } from '$lib/common/debug';
	import Text from '$lib/parts/Text.svelte';


	type HostListCardProps = {
		acl: ACLBuilder,
		hostName: string,
		hostCIDR: string,
		userNames: string[],
	}

	let {acl = $bindable(), hostName = $bindable(), hostCIDR = $bindable(), userNames}: HostListCardProps = $props()


	let host = $state(makeHost())
	let hostNameNew = $state('');
	let hostCIDRNew = $state('');
	let loading = $state(false);

	function makeHost() {
		return {
			get name() { return hostName },
			set name(n: string) { renameHost(n) },
			get cidr() { return hostCIDR },
			set cidr(c: string) { recidrHost(c) },
		}
	}

	function renameHost(hostNameNew: string) {
		loading = true;
		try {
			if (host.name !== hostNameNew) {
				acl.renameHost(host.name, hostNameNew);
				// toastSuccess(`Host renamed from '${host.name}' to '${hostNameNew}'`);
				hostName = hostNameNew
				debug(acl.hosts);
			}
			return true;
		} catch (e) {
			debug(e);
			if (e instanceof Error) {
				toastError('', e);
			}
		} finally {
			loading = false;
		}
	}

	function recidrHost(hostCIDRNew: string) {
		loading = true;
		try {
			if (host.cidr !== hostCIDRNew) {
				acl.setHost(host.name, hostCIDRNew);
				hostCIDR = hostCIDRNew;
			}
			return true;
		} catch (e) {
			debug(e);
			if (e instanceof Error) {
				toastError('', e);
			}
		} finally {
			loading = false;
		}
	}

	function deleteHost() {
		try {
			acl.deleteHost(host.name);
			toastSuccess(`Host '${host.name}' deleted`);
		} catch (e) {
			debug(e);
			if (e instanceof Error) {
				toastError('', e);
			}
		}
	}

</script>

<div class="flex items-center gap-3 px-4 py-2.5 text-sm">
	<div class="flex w-1/3 items-center gap-2">
		{#if userNames.includes(hostName)}
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger><TriangleAlert class="size-4 text-amber-500" /></Tooltip.Trigger>
					<Tooltip.Content>Host '{hostName}' has the same name as a user. Please rename it.</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		{/if}
		<Text bind:value={host.name} bind:valueNew={hostNameNew} submit={() => { host.name = hostNameNew; return true; }} classes="font-medium" showRenameIcon />
	</div>
	<div class="flex-1">
		<Text bind:value={host.cidr} bind:valueNew={hostCIDRNew} submit={() => { host.cidr = hostCIDRNew; return true; }} classes="font-mono text-muted-foreground" showRenameIcon />
	</div>
	<Delete func={deleteHost} disabled={loading} />
</div>
