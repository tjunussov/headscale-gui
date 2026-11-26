<script lang="ts">
	import { ACLBuilder } from '$lib/common/acl.svelte';
	import { isTextContent, JSONEditor, Mode, type TextContent } from 'svelte-jsoneditor';
	import 'svelte-jsoneditor/themes/jse-theme-dark.css';
	import JWCC from 'json5';
	import { mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { copyToClipboard } from '$lib/common/funcs';
	import Copy from '@lucide/svelte/icons/copy';

	let { acl = $bindable(), loading = $bindable(false) }: { acl: ACLBuilder; loading?: boolean } = $props();
	let editing = $state(false);
	let draft = $state<TextContent>({ text: '' });
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-wrap gap-2">
		{#if editing}
			<Button size="sm" disabled={loading} onclick={() => { acl = ACLBuilder.fromPolicy(draft.text); editing = false; }}>Apply</Button>
			<Button size="sm" variant="ghost" onclick={() => (editing = false)}>Cancel</Button>
		{:else}
			<Button size="sm" variant="outline" disabled={loading} onclick={() => { draft = { text: acl.JSON(2) }; editing = true; }}>Edit JSON</Button>
			<Button size="sm" variant="outline" onclick={() => copyToClipboard(acl.JSON(2), 'Copied policy JSON')}><Copy />Copy</Button>
			<Button size="sm" variant="ghost" class="text-destructive" disabled={loading} onclick={() => (acl = ACLBuilder.defaultACL())}>Reset to default</Button>
		{/if}
	</div>
	{#if editing}
		<div class="overflow-hidden rounded-lg border {mode.current === 'dark' ? 'jse-theme-dark' : ''}">
			<JSONEditor parser={JWCC} mode={Mode.text} tabSize={4} bind:content={draft} onChange={(c) => { if (isTextContent(c)) draft = c; }} />
		</div>
	{:else}
		<pre class="max-h-[70vh] overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed">{acl.JSON(2)}</pre>
	{/if}
</div>
