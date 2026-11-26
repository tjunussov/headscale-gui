<script lang="ts">
	// Tailscale-style "Add device", adapted to Headscale: download → point the client at this
	// server (--login-server / app setting) → register the key Headscale shows after login.
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Terminal from '@lucide/svelte/icons/square-terminal';
	import AppWindow from '@lucide/svelte/icons/app-window';
	import Laptop from '@lucide/svelte/icons/laptop';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import Bot from '@lucide/svelte/icons/bot';
	import Server from '@lucide/svelte/icons/server';
	import Download from '@lucide/svelte/icons/download';
	import Plug from '@lucide/svelte/icons/plug';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import NodeCreate from './NodeCreate.svelte';
	import DeployBuilder from './DeployBuilder.svelte';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { copyToClipboard } from '$lib/common/funcs';
	import { App } from '$lib/States.svelte';
	import { page } from '$app/state';

	let { open = $bindable(false), tab = $bindable('download') }: { open: boolean; tab?: string } = $props();
	let os = $state('macos');
	// NodeCreate sets show=false after a successful register → close the dialog
	let formShown = $state(true);
	$effect(() => { if (!formShown) { open = false; formShown = true; } });

	const server = $derived(App.apiUrl.value || page.url.origin);
	const cli = $derived(`tailscale up --login-server=${server}`);
	type Os = { id: string; name: string; icon: typeof Terminal; url: string; note: string; download?: string; steps?: string[] };
	const systems: Os[] = $derived([
		{ id: 'linux', name: 'Linux', icon: Terminal, url: 'https://tailscale.com/download/linux', download: 'curl -fsSL https://tailscale.com/install.sh | sh', note: 'Install script works on most distributions.' },
		{ id: 'windows', name: 'Windows', icon: AppWindow, url: 'https://tailscale.com/download/windows', note: 'Requires Windows 10 or later. Run the command in PowerShell.' },
		{ id: 'macos', name: 'macOS', icon: Laptop, url: 'https://tailscale.com/download/macos', note: 'Requires macOS 12 Monterey or later.' },
		{ id: 'ios', name: 'iPhone & iPad', icon: Smartphone, url: 'https://apps.apple.com/app/tailscale/id1470499037', note: 'Requires iOS 15 or later.', steps: ['Open the iOS Settings app → Tailscale', `Set "Alternate Coordination Server URL" to ${server}`, 'Open Tailscale and log in'] },
		{ id: 'android', name: 'Android', icon: Bot, url: 'https://play.google.com/store/apps/details?id=com.tailscale.ipn', note: 'Requires Android 8 or later.', steps: ['Open Tailscale → Settings → Accounts', 'Tap ⋮ → "Use an alternate server"', `Enter ${server} and log in`] },
		{ id: 'synology', name: 'Synology', icon: Server, url: 'https://tailscale.com/download/synology', note: 'Install from Package Center, then run the command over SSH.' },
	]);
	const sel = $derived(systems.find((s) => s.id === os)!);
</script>

{#snippet copyField(value: string)}
	<div class="flex gap-2">
		<InputGroup.Root class="flex-1">
			<InputGroup.Input readonly value={value} class="font-mono text-xs" onfocus={(e) => (e.currentTarget as HTMLInputElement).select()} />
			<InputGroup.Addon align="inline-end"><InputGroup.Button size="xs" onclick={() => copyToClipboard(value)}>Copy</InputGroup.Button></InputGroup.Addon>
		</InputGroup.Root>
		{#if value.startsWith('http')}<Button variant="outline" size="icon" href={value} target="_blank" rel="noreferrer" aria-label="Open"><ExternalLink /></Button>{/if}
	</div>
{/snippet}

<Dialog.Root bind:open>
	<!-- no auto-focus: it put a focus ring on the first OS button, which read as a second selection -->
	<Dialog.Content class="max-h-[90svh] overflow-y-auto sm:max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>Add machine</Dialog.Title>
			<Dialog.Description>
				To add a machine, install Tailscale on it and log in to this Headscale server: <span class="font-mono font-medium text-foreground">{server}</span>
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each systems as s (s.id)}
				<Button variant="outline" class="h-11 justify-start gap-3 {os === s.id ? 'border-foreground bg-accent ring-1 ring-foreground' : ''}" onclick={() => (os = s.id)} aria-pressed={os === s.id}>
					<s.icon />{s.name}
				</Button>
			{/each}
		</div>

		<Tabs.Root bind:value={tab} class="gap-3">
			<Tabs.List>
				<Tabs.Trigger value="download"><Download />Download</Tabs.Trigger>
				<Tabs.Trigger value="connect"><Plug />Connect</Tabs.Trigger>
				<Tabs.Trigger value="register"><KeyRound />Register</Tabs.Trigger>
				<Tabs.Trigger value="advanced"><SlidersHorizontal />Advanced</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="download" class="grid gap-2">
				{@render copyField(sel.url)}
				{#if sel.download}{@render copyField(sel.download)}{/if}
				<p class="text-sm text-muted-foreground">{sel.note}</p>
			</Tabs.Content>

			<Tabs.Content value="connect" class="grid gap-2">
				{#if sel.steps}
					<ol class="list-decimal space-y-1 pl-5 text-sm">{#each sel.steps as step}<li>{step}</li>{/each}</ol>
				{:else}
					{@render copyField(cli)}
					<p class="text-sm text-muted-foreground">Run on the device. For tags, routes, exit node or a pre-auth key use <button class="underline underline-offset-4" onclick={() => (tab = 'advanced')}>Advanced</button>.</p>
				{/if}
				<p class="text-sm text-muted-foreground">The login page then shows a registration key; register it in the next tab (not needed when using a pre-auth key).</p>
			</Tabs.Content>

			<Tabs.Content value="register" class="grid gap-2">
				<p class="text-sm text-muted-foreground">Paste the key from the device's login page (<span class="font-mono">mkey:…</span> or the key in the <span class="font-mono">headscale nodes register</span> command) and choose its owner.</p>
				<NodeCreate bind:show={formShown} />
			</Tabs.Content>

			<!-- former Deploy page: full tailscale up options + pre-auth key (no manual register needed) -->
			<Tabs.Content value="advanced">
				<DeployBuilder />
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
