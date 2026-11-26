<script lang="ts">
	// Tailscale-style per-machine actions. Destructive ones ask for confirmation in a dialog.
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import PanelRight from '@lucide/svelte/icons/panel-right';
	import Copy from '@lucide/svelte/icons/copy';
	import TimerOff from '@lucide/svelte/icons/timer-off';
	import Trash from '@lucide/svelte/icons/trash-2';
	import { copyToClipboard, dateToStr, machineHref, toastError, toastSuccess } from '$lib/common/funcs';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { deleteNode, expireNode } from '$lib/common/api';
	import { App } from '$lib/States.svelte';
	import type { Node } from '$lib/common/types';

	let { node, class: cls = '' }: { node: Node; class?: string } = $props();
	let confirm = $state<'expire' | 'delete' | null>(null);
	let busy = $state(false);
	const ip = (v6: boolean) => node.ipAddresses.find((s) => s.includes(':') === v6);

	async function run() {
		busy = true;
		try {
			if (confirm === 'expire') { App.updateValue(App.nodes, await expireNode(node)); toastSuccess(`Expired ${node.givenName}`); }
			else if (await deleteNode(node)) toastSuccess(`Deleted ${node.givenName}`);
			else throw new Error('delete failed');
		} catch (e) {
			toastError(`Could not ${confirm} ${node.givenName}`, e instanceof Error ? e : undefined);
		} finally {
			busy = false;
			confirm = null;
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="shrink-0 rounded text-muted-foreground hover:text-foreground {cls}" onclick={(e: MouseEvent) => e.stopPropagation()} aria-label="Machine actions">
		<EllipsisVertical class="size-4" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" class="w-56" onclick={(e: MouseEvent) => e.stopPropagation()}>
		<DropdownMenu.Label class="text-xs font-normal text-muted-foreground">ID {node.id} · {node.user.name} · created {dateToStr(node.createdAt).split(',')[0]}</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onSelect={() => goto(base + machineHref(node))}><PanelRight />Open machine page</DropdownMenu.Item>
		{#if ip(false)}<DropdownMenu.Item onSelect={() => copyToClipboard(ip(false)!, 'Copied ' + ip(false))}><Copy />Copy IPv4</DropdownMenu.Item>{/if}
		{#if ip(true)}<DropdownMenu.Item onSelect={() => copyToClipboard(ip(true)!, 'Copied IPv6')}><Copy />Copy IPv6</DropdownMenu.Item>{/if}
		<DropdownMenu.Item onSelect={() => copyToClipboard(node.givenName, 'Copied ' + node.givenName)}><Copy />Copy name</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onSelect={() => (confirm = 'expire')}><TimerOff />Expire key…</DropdownMenu.Item>
		<DropdownMenu.Item variant="destructive" onSelect={() => (confirm = 'delete')}><Trash />Delete…</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root open={confirm !== null} onOpenChange={(o) => !o && (confirm = null)}>
	<Dialog.Content class="sm:max-w-md" onclick={(e: MouseEvent) => e.stopPropagation()}>
		<Dialog.Header>
			<Dialog.Title>{confirm === 'delete' ? 'Delete' : 'Expire'} {node.givenName}?</Dialog.Title>
			<Dialog.Description>
				{confirm === 'delete' ? 'The machine is removed from the tailnet and must be registered again to rejoin.' : 'The machine is logged out and must re-authenticate.'}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" disabled={busy} onclick={() => (confirm = null)}>Cancel</Button>
			<Button variant={confirm === 'delete' ? 'destructive' : 'default'} disabled={busy} onclick={run}>{confirm === 'delete' ? 'Delete' : 'Expire'}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
