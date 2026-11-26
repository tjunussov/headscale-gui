<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';
	import PageDrawer from '$lib/page/PageDrawer.svelte';
	import { createPopulateErrorHandler } from '$lib/common/errors';
	import { App } from '$lib/States.svelte';

	let { children } = $props();

	onMount(() => {
		App.populateAll(createPopulateErrorHandler(), true);
		if (!App.hasValidApi) goto(`${base}/settings`);
	});
</script>

<ModeWatcher />
<Toaster position="bottom-right" />
<PageDrawer />
<Sidebar.Provider class="h-svh overflow-hidden" style="--sidebar-width: calc(var(--spacing) * 64); --header-height: calc(var(--spacing) * 12);">
	<AppSidebar />
	<Sidebar.Inset class="overflow-hidden">
		<SiteHeader />
		<!-- the page panel scrolls itself (own scrollbar, header stays put) instead of the window -->
		<div class="@container/main flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:gap-6 md:p-6">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
