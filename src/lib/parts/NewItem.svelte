<script lang="ts">
	import { toastError } from '$lib/common/funcs';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { slide } from 'svelte/transition';

	let { title, name = $bindable(), value = $bindable(undefined), disabled = false, submit }: { title: string; name: string; value?: string; disabled?: boolean; submit: (name: string, value?: string) => void } = $props();
</script>

<form
	transition:slide
	class="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3"
	onsubmit={(e) => { e.preventDefault(); try { value === undefined ? submit(name) : submit(name, value); } catch (err) { if (err instanceof Error) toastError('', err); } }}
>
	<Input class="w-56" placeholder="{title} name" autocomplete="off" {disabled} bind:value={name} autofocus />
	{#if value !== undefined}<Input class="w-56 font-mono" placeholder="{title} value (CIDR)" autocomplete="off" {disabled} bind:value />{/if}
	<Button type="submit" size="sm" disabled={disabled || !name || (value !== undefined && !value)}>Create</Button>
</form>
