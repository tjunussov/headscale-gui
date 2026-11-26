<script lang="ts">
	import {
		copyToClipboard,
		isExpired,
		isValidCIDR,
		isValidTag,
		toastError,
		toastSuccess,
	} from '$lib/common/funcs';
	import DeployCheck from './DeployCheck.svelte';
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	import type { Deployment, PreAuthKey } from '$lib/common/types';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TagInput from '$lib/parts/TagInput.svelte';
	import { page } from '$app/state';

	import { App } from '$lib/States.svelte';


	function createFilter(user_id: string) {
		return (pak: PreAuthKey) => {
			return pak.user.id === user_id && !(pak.used && !pak.reusable) && !isExpired(pak.expiration);
		};
	}

	// $: deployment = defaultDeployment();
	let deployment: Deployment = $state(App.deploymentDefaults.value);

	let craftCommand = (d: Deployment) => {
		const cmd = ['tailscale up --login-server=' + (App.apiUrl.value || page.url.origin)];

		// general
		d.shieldsUp && cmd.push('--shields-up');
		d.generateQR && cmd.push('--qr');
		d.reset && cmd.push('--reset');
		d.operator && d.operatorValue != '' && cmd.push('--operator=' + d.operatorValue);
		d.forceReauth && cmd.push('--force-reauth');
		d.sshServer && cmd.push('--ssh');
		d.usePreAuthKey && d.preAuthKey !== '' && cmd.push('--auth-key=' + d.preAuthKey);
		d.unattended && cmd.push('--unattended')

		// advertise
		d.advertiseExitNode && cmd.push('--advertise-exit-node');
		d.advertiseExitNodeLocalAccess &&
			cmd.push('--exit-node-allow-lan-access');
		d.advertiseRoutes &&
			d.advertiseRoutesValues.length > 0 &&
			cmd.push('--advertise-routes=' + d.advertiseRoutesValues.join(','));
		d.advertiseTags &&
			d.advertiseTagsValues.length > 0 &&
			cmd.push(
				'--advertise-tags=' +
					d.advertiseTagsValues.map((s) => (s.startsWith('tag:') ? s : 'tag:' + s)).join(','),
			);

		// accept
		d.acceptDns ? cmd.push('--accept-dns') : cmd.push('--accept-dns=false');
		d.acceptRoutes && cmd.push('--accept-routes');
		d.acceptExitNode && d.acceptExitNodeValue && cmd.push('--exit-node=' + d.acceptExitNodeValue);
		return cmd.join(' ');
	};
</script>

<Page>
	<PageHeader title="Deploy" />

	<button
		class="w-full rounded-lg border border-dashed bg-muted/50 px-4 py-4 text-left transition-colors hover:bg-muted"
		onclick={() => copyToClipboard(craftCommand(deployment), 'Copied Command to Clipboard!')}
	>
		<code class="block font-mono text-sm break-all">{craftCommand(deployment)}</code>
	</button>

	<div class="grid grid-cols-12">
		<p class="col-span-12 pb-4 text-lg font-semibold">General:</p>
		<DeployCheck bind:checked={deployment.shieldsUp} name="Shields Up" help="Block incoming connections" />
		<DeployCheck bind:checked={deployment.generateQR} name="Generate QR Code" help="Create a scannable QR code to import into TailScale client" />
		<DeployCheck bind:checked={deployment.reset} name="Reset" help="Reset unspecified settings to default values" />
		<DeployCheck bind:checked={deployment.operator} name="Operator" help="(Unix Only) Run as a different user">
			<Input bind:value={deployment.operatorValue} />
		</DeployCheck>
		<DeployCheck bind:checked={deployment.forceReauth} name="Force Reauthentication" help="Force user to re-authenticate to Headscale server" />
		<DeployCheck bind:checked={deployment.sshServer} name="SSH Server" help="Run a local SSH server accessible by administrators" />
		<DeployCheck bind:checked={deployment.usePreAuthKey} name="PreAuth Key" help="A generated key to automatically authenticate the node for a given user">
			<div class="flex flex-col gap-2">
				<Select.Root type="single" bind:value={deployment.preAuthKeyUser} onValueChange={() => (deployment.preAuthKey = '')}>
					<Select.Trigger class="w-full">{App.users.value.find((u) => u.id === deployment.preAuthKeyUser)?.name ?? ''}</Select.Trigger>
					<Select.Content>{#each App.users.value as u (u.id)}<Select.Item value={u.id} label={u.name}>{u.name}</Select.Item>{/each}</Select.Content>
				</Select.Root>
				{#if deployment.preAuthKeyUser}
					{@const keys = App.preAuthKeys.value.filter(createFilter(deployment.preAuthKeyUser))}
					<Select.Root type="single" bind:value={deployment.preAuthKey}>
						<Select.Trigger class="w-full font-mono">{deployment.preAuthKey || `${keys.length} Valid Key(s)`}</Select.Trigger>
						<Select.Content>{#each keys as k (k.key)}<Select.Item value={k.key} label={k.key} class="font-mono">{k.key}</Select.Item>{/each}</Select.Content>
					</Select.Root>
				{/if}
			</div>
		</DeployCheck>
		<DeployCheck bind:checked={deployment.unattended} name="Unattended" help="Run the tailscale client in unattended mode (on startup)" />
		<DeployCheck bind:checked={deployment.advertiseExitNodeLocalAccess} name="Allow LAN Access" help="Allow local network access while connected to the TailNet and using an exit node" />

		<p class="col-span-12 py-4 text-lg font-semibold">Advertise:</p>
		<DeployCheck bind:checked={deployment.advertiseExitNode} name="Advertise Exit Node" help="Allow other nodes on the TailNet to use this node as a gateway" />
		<DeployCheck bind:checked={deployment.advertiseTags} name="Advertise Tags" help="List of advertised tags to apply to a machine on provisioning">
			<TagInput bind:value={deployment.advertiseTagsValues} onchange={(v) => { if (v.some((t) => !isValidTag(t))) { toastError('Tag should be a lowercase alphanumeric word'); deployment.advertiseTagsValues = v.filter(isValidTag); } }} />
		</DeployCheck>
		<DeployCheck bind:checked={deployment.advertiseRoutes} name="Advertise Routes" help="List of subnets which are reachable via this node">
			<TagInput bind:value={deployment.advertiseRoutesValues} onchange={(v) => { if (v.some((t) => !isValidCIDR(t))) { toastError('Invalid CIDR Format'); deployment.advertiseRoutesValues = v.filter(isValidCIDR); } }} />
		</DeployCheck>

		<p class="col-span-12 py-4 text-lg font-semibold">Accept:</p>
		<DeployCheck bind:checked={deployment.acceptDns} name="Accept DNS" help="Accept the HeadScale-provided DNS settings" />
		<DeployCheck bind:checked={deployment.acceptRoutes} name="Accept Routes" help="Accept other nodes' advertised subnets" />
		<DeployCheck bind:checked={deployment.acceptExitNode} name="Exit Node" help="Use this node as a gateway (target node must advertise exit node)">
			<Select.Root type="single" bind:value={deployment.acceptExitNodeValue}>
				<Select.Trigger class="w-full">{App.nodes.value.find((n) => n.ipAddresses.includes(deployment.acceptExitNodeValue))?.givenName ?? ''}</Select.Trigger>
				<Select.Content>
					{#each App.nodes.value as n (n.id)}
						{@const ip = n.ipAddresses.find((s) => /^\d+\.\d+\.\d+\.\d+$/.test(s)) ?? ''}
						<Select.Item value={ip} label={n.givenName}>{n.givenName} ({n.name})</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</DeployCheck>
	</div>
	<div>
		<Button variant="secondary" onclick={() => { App.saveDeploymentDefaults(deployment); toastSuccess('Saved Deployment Defaults'); }}>Save Defaults</Button>
	</div>
</Page>
