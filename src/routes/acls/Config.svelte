<script lang="ts">
	import { ACLBuilder, saveConfig, type ACL } from '$lib/common/acl.svelte';
	import { isTextContent, JSONEditor, Mode, type TextContent } from 'svelte-jsoneditor';
	import 'svelte-jsoneditor/themes/jse-theme-dark.css';
	import JWCC from 'json5';
	import { mode } from 'mode-watcher';
	import { getPolicy } from '$lib/common/api';
	import { debug } from '$lib/common/debug';
	import { copyToClipboard, toastError, toastSuccess } from '$lib/common/funcs';
	import { Button } from '$lib/components/ui/button/index.js';
	import Copy from '@lucide/svelte/icons/copy';

	let { acl = $bindable(), loading = $bindable(false) }: { acl: ACLBuilder; loading?: boolean } = $props();
	let editing = $state(false);
	let aclEditJSON = $state<TextContent>({ text: '' });

	function loadConfig() {
		loading = true;
		getPolicy()
			.then((policy) => { acl = ACLBuilder.fromPolicy(JWCC.parse<ACL>(policy)); toastSuccess('Loaded ACL policy from server'); })
			.catch((reason) => { debug('failed to get policy:', reason); toastError('Unable to get ACL policy from server.', reason); })
			.finally(() => (loading = false));
	}
</script>

<!-- upstream: Save Config · Load Config · Edit/Apply Config · Reset Config/Cancel Editing -->
<div class="flex flex-col gap-3">
	<div class="flex flex-wrap gap-2">
		<Button size="sm" class="w-32" disabled={loading || editing} onclick={() => saveConfig(acl, { setLoadingTrue: () => (loading = true), setLoadingFalse: () => (loading = false) })}>Save Config</Button>
		<Button size="sm" variant="secondary" class="w-32" disabled={loading || editing} onclick={loadConfig}>Load Config</Button>
		<Button
			size="sm"
			variant="outline"
			class="w-32"
			disabled={loading}
			onclick={() => { if (editing) { acl = ACLBuilder.fromPolicy(aclEditJSON.text); editing = false; } else { aclEditJSON = { text: acl.JSON(2) }; editing = true; } }}
		>{editing ? 'Apply Config' : 'Edit Config'}</Button>
		{#if editing}
			<Button size="sm" variant="destructive" class="w-32" disabled={loading} onclick={() => (editing = false)}>Cancel Editing</Button>
		{:else}
			<Button size="sm" variant="destructive" class="w-32" disabled={loading} onclick={() => (acl = ACLBuilder.defaultACL())}>Reset Config</Button>
		{/if}
	</div>
	{#if editing}
		<div class="overflow-hidden rounded-lg border {mode.current === 'dark' ? 'jse-theme-dark' : ''}">
			<JSONEditor parser={JWCC} mode={Mode.text} tabSize={4} bind:content={aclEditJSON} onChange={(c) => { if (isTextContent(c)) aclEditJSON = c; }} />
		</div>
	{:else}
		<div class="relative">
			<Button size="icon-sm" variant="ghost" class="absolute top-2 right-2" onclick={() => copyToClipboard(acl.JSON(2))} aria-label="Copy"><Copy /></Button>
			<pre class="max-h-[70vh] overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed">{acl.JSON(2)}</pre>
		</div>
	{/if}
</div>
