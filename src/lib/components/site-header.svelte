<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toggleMode } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { page } from '$app/state';
	import { nav } from '$lib/nav';

	import { base } from '$app/paths';

	// nested routes (e.g. /nodes/[id]) resolve to their parent nav entry + a leaf crumb
	const current = $derived(nav.find((n) => n.path === page.route.id) ?? nav.find((n) => n.path !== '/' && page.route.id?.startsWith(n.path + '/')));
	const leaf = $derived(current && page.route.id !== current.path ? page.params.id : undefined);
</script>

<header
	class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="mx-2 data-vertical:h-4 data-vertical:self-center" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">{current?.group ?? 'TJNPVScale'}</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block" />
				{#if leaf}
					<Breadcrumb.Item><Breadcrumb.Link href="{base}{current?.path}/">{current?.name}</Breadcrumb.Link></Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item><Breadcrumb.Page class="font-mono">{leaf}</Breadcrumb.Page></Breadcrumb.Item>
				{:else}
					<Breadcrumb.Item><Breadcrumb.Page>{current?.name ?? ''}</Breadcrumb.Page></Breadcrumb.Item>
				{/if}
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<div class="ms-auto flex items-center gap-2">
			<Button variant="ghost" size="icon" onclick={toggleMode} aria-label="Toggle theme">
				<Sun class="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			</Button>
		</div>
	</div>
</header>
