<script lang="ts">
	import {
		getTime,
		getTimeDifference,
		getTimeDifferenceColor,
		toastSuccess,
	} from '$lib/common/funcs';

	import { page } from '$app/state';
	import { debug } from '$lib/common/debug';
	import { createPopulateErrorHandler } from '$lib/common/errors';
	import type { ApiKeyInfo, ExpirationMessage } from '$lib/common/types';
	import Page from '$lib/page/Page.svelte';
	import PageHeader from '$lib/page/PageHeader.svelte';
	
	import { refreshApiKey } from '$lib/common/api';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import Save from '@lucide/svelte/icons/save';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	import { App } from '$lib/States.svelte';
	import { goto } from '$app/navigation';

	type Settings = {
		apiUrl: string;
		apiKey: string;
		apiTtl: number;
		debug: boolean;
	};

	let settings = $state<Settings>({
		apiUrl: App.apiUrl.value,
		apiKey: App.apiKey.value,
		apiTtl: App.apiTtl.value / 1000,
		debug: App.debug.value,
	});


	let apiKeyInfo = $derived(App.apiKeyInfo.value);
	let apiKeyShow = $state(false);
	let loading = $state(false);

	const apiKeyExpirationMessage: ExpirationMessage = $derived.by(() => {
		if (apiKeyInfo.expires !== ''){
			const td = getTimeDifference(getTime(apiKeyInfo.expires));
			return {
				message: td.message,
				color: getTimeDifferenceColor(td),
			};
		} else {
			return { message: '', color: '' };
		}
	});

	async function saveSettings(event?: Event) {
		event?.preventDefault()

		loading = true;
		try {
			if(settings.apiUrl === '') {
				settings.apiUrl = page.url.origin
			}
			App.apiUrl.value = settings.apiUrl
			App.apiKey.value = settings.apiKey
			App.apiTtl.value = settings.apiTtl * 1000
			App.debug.value = settings.debug
			App.apiKeyInfo.value = {
				expires: '',
				authorized: null,
				informedUnauthorized: false,
				informedExpiringSoon: false,
			};
			toastSuccess('Saved Settings');
			const handler = createPopulateErrorHandler();
			await App.populateApiKeyInfo().catch(handler);
			await App.populateAll(handler, false);
		} catch (err) {
			debug(err);
		} finally {
			loading = false;
		}
	}
</script>

<Page>
	<PageHeader title="Settings" description="Connect TJNPVScale to your Headscale API. Stored only in this browser." />
	<form onsubmit={saveSettings} class="grid max-w-3xl gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>API connection</Card.Title>
				<Card.Description>Create a key with <code class="font-mono">headscale apikeys create</code>.</Card.Description>
				{#if apiKeyInfo.authorized !== null}
					<Card.Action>
						<Badge variant={apiKeyInfo.authorized ? 'secondary' : 'destructive'} class="gap-1.5">
							<span class="size-2 rounded-full {apiKeyInfo.authorized ? 'bg-emerald-500' : 'bg-white'}"></span>
							{apiKeyInfo.authorized ? 'Authorized' : 'Not authorized'}
						</Badge>
					</Card.Action>
				{/if}
			</Card.Header>
			<Card.Content class="grid gap-6">
				<div class="grid gap-2">
					<Label for="api-url">API URL</Label>
					<Input id="api-url" placeholder={page.url.origin} disabled={loading} bind:value={settings.apiUrl} />
				</div>
				<div class="grid gap-2">
					<Label for="api-key">API key</Label>
					<InputGroup.Root>
						<InputGroup.Input id="api-key" class="font-mono" type={apiKeyShow ? 'text' : 'password'} placeholder="Enter your API key" disabled={loading} bind:value={settings.apiKey} />
						<InputGroup.Addon align="inline-end">
							<InputGroup.Button size="icon-xs" disabled={loading} onclick={() => (apiKeyShow = !apiKeyShow)} aria-label={apiKeyShow ? 'Hide API key' : 'Show API key'}>
								{#if apiKeyShow}<EyeOff />{:else}<Eye />{/if}
							</InputGroup.Button>
							<InputGroup.Button
								size="icon-xs"
								disabled={loading}
								aria-label="Rotate API key"
								onclick={async () => { loading = true; try { await refreshApiKey(); settings.apiKey = App.apiKey.value; saveSettings(); } finally { loading = false; } }}
							><RotateCw /></InputGroup.Button>
						</InputGroup.Addon>
					</InputGroup.Root>
					<p class="text-sm text-muted-foreground">
						{#if loading}Checking authorization…{:else if apiKeyInfo.authorized && apiKeyExpirationMessage.message}Expires {apiKeyExpirationMessage.message}{:else}&nbsp;{/if}
					</p>
				</div>
				<div class="grid gap-2">
					<Label for="api-ttl">Refresh interval (seconds)</Label>
					<Input id="api-ttl" class="w-32" type="number" min="1" disabled={loading} bind:value={settings.apiTtl} />
				</div>
			</Card.Content>
			<Card.Footer class="justify-end border-t">
				<Button type="submit" disabled={loading || !settings.apiKey}><Save />Save settings</Button>
			</Card.Footer>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Developer</Card.Title>
				<Card.Description>Debug output goes to the browser console.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<Label class="font-normal"><Switch bind:checked={settings.debug} disabled={loading} />Console debugging</Label>
				<div class="flex flex-wrap gap-2">
					{#each [['Users', App.users.value], ['Nodes', App.nodes.value], ['PreAuth keys', App.preAuthKeys.value], ['API key info', App.apiKeyInfo.value]] as [name, data]}
						<Button type="button" variant="outline" size="sm" onclick={() => console.log(JSON.stringify(data, null, 4))}>Log {name}</Button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</form>
</Page>
