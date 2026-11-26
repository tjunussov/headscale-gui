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
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { userPrefersMode, setMode, resetMode } from 'mode-watcher';
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
	<PageHeader title="Settings" />
	<Card.Root class="max-w-3xl">
		<Card.Content>
			<form onsubmit={saveSettings} class="grid gap-6">
				<div class="grid gap-2">
					<Label for="api-url">API URL</Label>
					<Input id="api-url" placeholder={page.url.origin} disabled={loading} bind:value={settings.apiUrl} />
				</div>

				<div class="grid gap-2">
					<Label for="api-key">API Key</Label>
					<InputGroup.Root>
						<InputGroup.Input id="api-key" type={apiKeyShow ? 'text' : 'password'} placeholder="Enter your API Key" disabled={loading} bind:value={settings.apiKey} />
						<InputGroup.Addon align="inline-end">
							<InputGroup.Button size="icon-xs" disabled={loading} onclick={() => (apiKeyShow = !apiKeyShow)} aria-label={apiKeyShow ? 'Hide API Key' : 'Show API Key'}>
								{#if apiKeyShow}<EyeOff />{:else}<Eye />{/if}
							</InputGroup.Button>
							<InputGroup.Button
								size="icon-xs"
								disabled={loading}
								aria-label="Refresh API Key"
								onclick={async () => { loading = true; try { await refreshApiKey(); settings.apiKey = App.apiKey.value; saveSettings(); } finally { loading = false; } }}
							><RotateCw /></InputGroup.Button>
						</InputGroup.Addon>
					</InputGroup.Root>
					{#if apiKeyInfo.authorized !== null}
						<p class="text-sm">
							<span class={apiKeyInfo.authorized ? 'font-medium' : 'text-destructive'}>{apiKeyInfo.authorized ? 'Authorized' : 'Not Authorized'}</span>
							{#if apiKeyInfo.authorized && apiKeyExpirationMessage}<span class="ml-2 text-muted-foreground">Expires in: {apiKeyExpirationMessage.message}</span>{/if}
						</p>
					{:else if loading}
						<p class="text-sm text-muted-foreground">Checking authorization...</p>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="api-ttl">API Refresh Interval (seconds)</Label>
					<Input id="api-ttl" class="w-32" type="number" min="1" disabled={loading} bind:value={settings.apiTtl} />
				</div>

				<Label class="font-normal"><Checkbox id="debugging" disabled={loading} bind:checked={settings.debug} />Console Debugging</Label>

				<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
					<Button type="button" variant="outline" size="sm" onclick={() => console.log(JSON.stringify(App.users.value, null, 4))}>Log Users</Button>
					<Button type="button" variant="outline" size="sm" onclick={() => console.log(JSON.stringify(App.nodes.value, null, 4))}>Log Nodes</Button>
					<Button type="button" variant="outline" size="sm" onclick={() => console.log(JSON.stringify(App.preAuthKeys.value, null, 4))}>Log PreAuthKeys</Button>
					<Button type="button" variant="outline" size="sm" onclick={() => console.log(JSON.stringify(App.apiKeyInfo.value, null, 4))}>Log ApiKey Info</Button>
				</div>

				<div class="grid gap-2">
					<Label>Theme</Label>
					<!-- upstream picked a Skeleton theme; monochrome build keeps the slot for light/dark/system -->
					<Select.Root type="single" value={userPrefersMode.current} onValueChange={(v) => (v === 'system' ? resetMode() : setMode(v as 'light' | 'dark'))}>
						<Select.Trigger class="w-48 capitalize">{userPrefersMode.current}</Select.Trigger>
						<Select.Content>
							{#each ['light', 'dark', 'system'] as m}<Select.Item value={m} label={m} class="capitalize">{m}</Select.Item>{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="flex justify-end">
					<Button type="submit" disabled={loading || !settings.apiKey}><Save />Save Settings</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</Page>
