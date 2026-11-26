<script lang="ts">
	import { clone, copyToClipboard, isValidCIDR, isValidTag, toastError, toastSuccess } from '$lib/common/funcs';
	import DeployCheck from './DeployCheck.svelte';
	// Deploy builder (was the Deploy page): tailscale up options + pre-auth key → one command. Lives in Add machine › Advanced.
	import type { Deployment } from '$lib/common/types';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Copy from '@lucide/svelte/icons/copy';
	import TagInput from '$lib/parts/TagInput.svelte';
	import { createPreAuthKey } from '$lib/common/api';
	import { page } from '$app/state';
	import { App } from '$lib/States.svelte';

	// work on a copy: editing the persisted defaults directly auto-saved every change, including
	// generated pre-auth keys (credentials) into localStorage. Only "Save Defaults" persists, without the key.
	let deployment: Deployment = $state({ ...clone(App.deploymentDefaults.value), preAuthKey: "", preAuthKeyUser: "" });
	// scrub a key stored by earlier versions
	if (App.deploymentDefaults.value.preAuthKey) App.saveDeploymentDefaults(App.deploymentDefaults.value);
	const defaultExpires = (h = 1) => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4 + h * 36e5).toISOString().slice(0, 16);
	let pak = $state({ ephemeral: false, reusable: false, expiration: defaultExpires() });
	let pakLoading = $state(false);

	// 0.28: keys can only be read once, so Deploy generates a fresh one instead of listing existing keys
	async function generatePreAuthKey() {
		const user = App.users.value.find((u) => u.id === deployment.preAuthKeyUser);
		if (!user) return;
		pakLoading = true;
		try {
			deployment.preAuthKey = (await createPreAuthKey(user, pak.ephemeral, pak.reusable, pak.expiration)).key;
			toastSuccess('PreAuth Key created. Copy it now, it can only be viewed once.');
		} catch (e) {
			toastError('Failed to create PreAuth Key: ' + e);
		} finally {
			pakLoading = false;
		}
	}

	let craftCommand = (d: Deployment) => {
		const cmd = ['tailscale up --login-server=' + (App.apiUrl.value || page.url.origin)];

		// general
		d.shieldsUp && cmd.push('--shields-up');
		d.generateQR && cmd.push('--qr');
		d.reset && cmd.push('--reset');
		d.forceReauth && cmd.push('--force-reauth');
		d.sshServer && cmd.push('--ssh');
		d.usePreAuthKey && d.preAuthKey !== '' && cmd.push('--auth-key=' + d.preAuthKey);
		d.unattended && cmd.push('--unattended');
		d.operator && d.operatorValue != '' && cmd.push('--operator=' + d.operatorValue);
		d.customHostname && d.customHostnameValue && cmd.push('--hostname=' + d.customHostnameValue);

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

<div class="flex flex-col gap-4">

	<button
		class="w-full rounded-lg border border-dashed bg-muted/50 px-4 py-4 text-left transition-colors hover:bg-muted"
		onclick={() => copyToClipboard(craftCommand(deployment), 'Copied Command to Clipboard!')}
	>
		<code class="block font-mono text-sm break-all">{craftCommand(deployment)}</code>
	</button>

	<div class="grid grid-cols-12">
		<p class="col-span-12 pb-3 text-sm font-semibold">General:</p>
		<DeployCheck bind:checked={deployment.shieldsUp} name="Shields Up" help="Block incoming connections" />
		<DeployCheck bind:checked={deployment.generateQR} name="Generate QR Code" help="Create a scannable QR code to import into TailScale client" />
		<DeployCheck bind:checked={deployment.reset} name="Reset" help="Reset unspecified settings to default values" />
		<DeployCheck bind:checked={deployment.forceReauth} name="Force Reauthentication" help="Force user to re-authenticate to Headscale server" />
		<DeployCheck bind:checked={deployment.sshServer} name="SSH Server" help="Run a local SSH server accessible by administrators" />
		<DeployCheck bind:checked={deployment.unattended} name="Unattended" help="Run the tailscale client in unattended mode (on startup)" />
		<DeployCheck bind:checked={deployment.advertiseExitNodeLocalAccess} name="Allow LAN Access" help="Allow local network access while connected to the TailNet and using an exit node" />
		<DeployCheck bind:checked={deployment.operator} name="Operator" help="(Unix Only) Run as a different user">
			<Input bind:value={deployment.operatorValue} />
		</DeployCheck>
		<DeployCheck bind:checked={deployment.customHostname} name="Custom Hostname" help="Set a custom hostname for the node">
			<Input bind:value={deployment.customHostnameValue} />
		</DeployCheck>
		<div class="col-span-12"></div>
		<DeployCheck bind:checked={deployment.usePreAuthKey} name="PreAuth Key" help="A generated key to automatically authenticate the node for a given user">
			<div class="flex flex-col gap-3">
				<Select.Root type="single" bind:value={deployment.preAuthKeyUser} onValueChange={() => (deployment.preAuthKey = '')}>
					<Select.Trigger class="w-full">{App.users.value.find((u) => u.id === deployment.preAuthKeyUser)?.name ?? 'Select user'}</Select.Trigger>
					<Select.Content>{#each App.users.value as u (u.id)}<Select.Item value={u.id} label={u.name}>{u.name}</Select.Item>{/each}</Select.Content>
				</Select.Root>
				{#if deployment.preAuthKeyUser}
					<div class="grid gap-3 md:grid-cols-2">
						<div class="grid gap-2">
							<Label for="pak-exp">Expiration</Label>
							<Input id="pak-exp" type="datetime-local" bind:value={pak.expiration} />
						</div>
						<div class="grid content-end gap-2">
							<Label class="font-normal"><Checkbox bind:checked={pak.ephemeral} />Ephemeral</Label>
							<Label class="font-normal"><Checkbox bind:checked={pak.reusable} />Reusable</Label>
						</div>
					</div>
					<div class="flex flex-wrap gap-2">
						<Button size="sm" disabled={pakLoading} onclick={generatePreAuthKey}>Generate PreAuth Key</Button>
						{#if deployment.preAuthKey}<Button size="sm" variant="outline" onclick={() => copyToClipboard(deployment.preAuthKey)}><Copy />Copy Key</Button>{/if}
					</div>
					{#if deployment.preAuthKey}<p class="text-xs text-muted-foreground">This key can only be viewed once. Copy it now.</p>{/if}
				{/if}
			</div>
		</DeployCheck>

		<p class="col-span-12 py-3 text-sm font-semibold">Advertise:</p>
		<DeployCheck bind:checked={deployment.advertiseExitNode} name="Advertise Exit Node" help="Allow other nodes on the TailNet to use this node as a gateway" />
		<DeployCheck bind:checked={deployment.advertiseTags} name="Advertise Tags" help="List of advertised tags to apply to a machine on provisioning">
			<TagInput bind:value={deployment.advertiseTagsValues} onchange={(v) => { if (v.some((t) => !isValidTag(t))) { toastError('Tag should be a lowercase alphanumeric word'); deployment.advertiseTagsValues = v.filter(isValidTag); } }} />
		</DeployCheck>
		<DeployCheck bind:checked={deployment.advertiseRoutes} name="Advertise Routes" help="List of subnets which are reachable via this node">
			<TagInput bind:value={deployment.advertiseRoutesValues} onchange={(v) => { if (v.some((t) => !isValidCIDR(t))) { toastError('Invalid CIDR Format'); deployment.advertiseRoutesValues = v.filter(isValidCIDR); } }} />
		</DeployCheck>

		<p class="col-span-12 py-3 text-sm font-semibold">Accept:</p>
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
</div>
