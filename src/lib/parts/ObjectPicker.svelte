<script lang="ts">
	// pick an ACL object: type toggle → known-object select or free text (+ optional ports)
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toastError } from '$lib/common/funcs';

	let { options, ports = false, portsDisabled = false, add }: { options: Record<string, string[] | undefined>; ports?: boolean; portsDisabled?: boolean; add: (host: string, ports: string) => void } = $props();
	let type = $state('custom');
	let host = $state('');
	let portStr = $state('');
	const list = $derived(options[type]);

	function submit(e: Event) {
		e.preventDefault();
		try { add(host, portStr); host = ''; portStr = ''; } catch (err) { if (err instanceof Error) toastError('', err); }
	}
</script>

<form class="flex flex-col gap-2" onsubmit={submit}>
	<ToggleGroup.Root type="single" variant="outline" size="sm" bind:value={type} onValueChange={(v) => { if (!v) type = 'custom'; host = ''; }} class="flex-wrap">
		{#each Object.keys(options) as t}<ToggleGroup.Item value={t} class="capitalize">{t}</ToggleGroup.Item>{/each}
	</ToggleGroup.Root>
	<div class="flex gap-2">
		{#if list}
			<Select.Root type="single" bind:value={host}>
				<Select.Trigger class="flex-1">{host || `Select ${type}…`}</Select.Trigger>
				<Select.Content>
					{#each list as o (o)}<Select.Item value={o} label={o}>{o}</Select.Item>{:else}<div class="p-2 text-sm text-muted-foreground">None defined</div>{/each}
				</Select.Content>
			</Select.Root>
		{:else}
			<Input class="flex-1 font-mono" placeholder="host, CIDR, * …" bind:value={host} autocomplete="off" />
		{/if}
		{#if ports}<Input class="w-32 font-mono" placeholder="ports (*, 22,443)" bind:value={portStr} disabled={portsDisabled} autocomplete="off" />{/if}
		<Button type="submit" variant="secondary" disabled={!host}>Add</Button>
	</div>
</form>
