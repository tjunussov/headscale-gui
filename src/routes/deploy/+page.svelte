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
	import PageHeader from '$lib/page/PageHeader.svelte';
	import type { Deployment, PreAuthKey } from '$lib/common/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TagInput from '$lib/parts/TagInput.svelte';
	import Copy from '@lucide/svelte/icons/copy';
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

	<PageHeader title="Deploy" description="Build a tailscale up command for a new device.">
		{#snippet actions()}
			<Button variant="outline" size="sm" onclick={() => { App.saveDeploymentDefaults(deployment); toastSuccess('Saved Deployment Defaults'); }}>Save as defaults</Button>
		{/snippet}
	</PageHeader>

	<Card.Root class="sticky top-2 z-10">
		<Card.Header>
			<Card.Title>Command</Card.Title>
			<Card.Description>Run on the device you want to join.</Card.Description>
			<Card.Action><Button size="sm" onclick={() => copyToClipboard(craftCommand(deployment), 'Copied Command to Clipboard!')}><Copy />Copy</Button></Card.Action>
		</Card.Header>
		<Card.Content>
			<pre class="overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm whitespace-pre-wrap break-all">{craftCommand(deployment)}</pre>
		</Card.Content>
	</Card.Root>

	{#snippet section(title: string, desc: string, body: import('svelte').Snippet)}
		<Card.Root>
			<Card.Header><Card.Title>{title}</Card.Title><Card.Description>{desc}</Card.Description></Card.Header>
			<Card.Content class="divide-y">{@render body()}</Card.Content>
		</Card.Root>
	{/snippet}

	<div class="grid gap-4 @4xl/main:grid-cols-2 @4xl/main:items-start">
		{#snippet general()}
			<DeployCheck bind:checked={deployment.shieldsUp} name="Shields up" help="Block incoming connections" />
			<DeployCheck bind:checked={deployment.generateQR} name="Generate QR code" help="Show a QR code to scan into the Tailscale client" />
			<DeployCheck bind:checked={deployment.reset} name="Reset" help="Reset unspecified settings to default values" />
			<DeployCheck bind:checked={deployment.operator} name="Operator" help="(Unix only) Run as a different user">
				<Input placeholder="username" bind:value={deployment.operatorValue} />
			</DeployCheck>
			<DeployCheck bind:checked={deployment.forceReauth} name="Force reauthentication" help="Force the user to re-authenticate to Headscale" />
			<DeployCheck bind:checked={deployment.sshServer} name="SSH server" help="Run Tailscale SSH, accessible by administrators" />
			<DeployCheck bind:checked={deployment.usePreAuthKey} name="PreAuth key" help="Authenticate the node automatically for a user">
				<div class="flex flex-col gap-2">
					<Select.Root type="single" bind:value={deployment.preAuthKeyUser} onValueChange={() => (deployment.preAuthKey = '')}>
						<Select.Trigger class="w-full">{App.users.value.find((u) => u.id === deployment.preAuthKeyUser)?.name ?? 'Select user…'}</Select.Trigger>
						<Select.Content>{#each App.users.value as u (u.id)}<Select.Item value={u.id} label={u.name}>{u.name}</Select.Item>{/each}</Select.Content>
					</Select.Root>
					{#if deployment.preAuthKeyUser}
						{@const keys = App.preAuthKeys.value.filter(createFilter(deployment.preAuthKeyUser))}
						<Select.Root type="single" bind:value={deployment.preAuthKey}>
							<Select.Trigger class="w-full font-mono">{deployment.preAuthKey || `${keys.length} valid key(s)`}</Select.Trigger>
							<Select.Content>{#each keys as k (k.key)}<Select.Item value={k.key} label={k.key} class="font-mono">{k.key}</Select.Item>{/each}</Select.Content>
						</Select.Root>
					{/if}
				</div>
			</DeployCheck>
			<DeployCheck bind:checked={deployment.unattended} name="Unattended" help="Run the client in unattended mode (on startup)" />
			<DeployCheck bind:checked={deployment.advertiseExitNodeLocalAccess} name="Allow LAN access" help="Keep local network access while using an exit node" />
		{/snippet}
		{@render section('General', 'Client behaviour and authentication.', general)}

		<div class="grid gap-4">
			{#snippet advertise()}
				<DeployCheck bind:checked={deployment.advertiseExitNode} name="Advertise exit node" help="Let other nodes use this node as a gateway" />
				<DeployCheck bind:checked={deployment.advertiseTags} name="Advertise tags" help="Tags to apply to the machine on provisioning">
					<TagInput placeholder="tag name, Enter" bind:value={deployment.advertiseTagsValues} onchange={(v) => { const bad = v.filter((t) => !isValidTag(t)); if (bad.length) { toastError('Tag should be a lowercase alphanumeric word'); deployment.advertiseTagsValues = v.filter(isValidTag); } }} />
				</DeployCheck>
				<DeployCheck bind:checked={deployment.advertiseRoutes} name="Advertise routes" help="Subnets reachable via this node">
					<TagInput placeholder="10.0.0.0/24, Enter" bind:value={deployment.advertiseRoutesValues} onchange={(v) => { const bad = v.filter((t) => !isValidCIDR(t)); if (bad.length) { toastError('Invalid CIDR Format'); deployment.advertiseRoutesValues = v.filter(isValidCIDR); } }} />
				</DeployCheck>
			{/snippet}
			{@render section('Advertise', 'What this node offers to the tailnet.', advertise)}

			{#snippet accept()}
				<DeployCheck bind:checked={deployment.acceptDns} name="Accept DNS" help="Use the Headscale-provided DNS settings" />
				<DeployCheck bind:checked={deployment.acceptRoutes} name="Accept routes" help="Accept subnets advertised by other nodes" />
				<DeployCheck bind:checked={deployment.acceptExitNode} name="Exit node" help="Route traffic through another node (it must advertise exit node)">
					<Select.Root type="single" bind:value={deployment.acceptExitNodeValue}>
						<Select.Trigger class="w-full">{App.nodes.value.find((n) => n.ipAddresses.includes(deployment.acceptExitNodeValue))?.givenName ?? 'Select node…'}</Select.Trigger>
						<Select.Content>
							{#each App.nodes.value as n (n.id)}
								{@const ip = n.ipAddresses.find((s) => /^\d+\.\d+\.\d+\.\d+$/.test(s)) ?? ''}
								<Select.Item value={ip} label={n.givenName}>{n.givenName} <span class="text-muted-foreground">{ip}</span></Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</DeployCheck>
			{/snippet}
			{@render section('Accept', 'What this node takes from the tailnet.', accept)}
		</div>
	</div>
