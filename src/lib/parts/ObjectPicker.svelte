<script lang="ts">
	// pick an ACL object: type toggle → filterable known-object combobox or free text (+ optional ports)
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { toastError } from '$lib/common/funcs';

	let { options, ports = false, portsDisabled = false, placeholder = 'Object...', add }: { options: Record<string, string[] | undefined>; ports?: boolean; portsDisabled?: boolean; placeholder?: string; add: (host: string, ports: string) => void } = $props();
	const first = Object.keys(options)[0];
	let type = $state(first);
	let host = $state('');
	let portStr = $state('');
	let open = $state(false);
	const list = $derived(options[type]);

	function submit(e: Event) {
		e.preventDefault();
		try { add(host, portStr); host = ''; portStr = ''; } catch (err) { if (err instanceof Error) toastError('', err); }
	}
</script>

<form class="flex flex-col gap-2" onsubmit={submit}>
	<ToggleGroup.Root type="single" variant="outline" size="sm" bind:value={type} onValueChange={(v) => { if (!v) type = first; host = ''; }} class="flex-wrap">
		{#each Object.keys(options) as t}<ToggleGroup.Item value={t} class="capitalize">{t}</ToggleGroup.Item>{/each}
	</ToggleGroup.Root>
	<div class="flex gap-2">
		{#if list}
			<Popover.Root bind:open>
				<Popover.Trigger>
					{#snippet child({ props })}
						<Button variant="outline" class="flex-1 justify-between font-mono font-normal {host ? '' : 'text-muted-foreground'}" {...props}>{host || `Select ${type}…`}<ChevronsUpDown class="opacity-50" /></Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-72 p-0" align="start">
					<Command.Root>
						<Command.Input placeholder="Filter..." />
						<Command.List>
							<Command.Empty>None defined</Command.Empty>
							<Command.Group>
								{#each list as o (o)}<Command.Item value={o} class="font-mono" onSelect={() => { host = o; open = false; }}>{o}</Command.Item>{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		{:else}
			<Input class="flex-1 font-mono" {placeholder} bind:value={host} autocomplete="off" />
		{/if}
		{#if ports}<Input class="w-32 font-mono" placeholder="Dst Ports..." bind:value={portStr} disabled={portsDisabled} autocomplete="off" />{/if}
		<Button type="submit" variant="secondary" disabled={!host}>Add</Button>
	</div>
</form>
