<script lang="ts">
	import Navigation from '$lib/Navigation.svelte';
	import RawMdiGithub from '~icons/mdi/github';
	import '../app.postcss';
	import {
		AppBar,
		AppShell,
		LightSwitch,
		Modal,
		Toast,
		getDrawerStore,
		getToastStore,
		initializeStores,
		type DrawerSettings,
	} from '@skeletonlabs/skeleton';

	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	initializeStores();

	const DrawerStore = getDrawerStore();

	let drawerSettings = $state({
		id: 'navDrawer',
		position: 'left',
		width: 'w-64',
		padding: '',
	}) as DrawerSettings;

	// Highlight JS
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import PageDrawer from '$lib/page/PageDrawer.svelte';
	import { fade } from 'svelte/transition';
	import { createPopulateErrorHandler } from '$lib/common/errors';
	import { version } from '$lib/common/debug';
	import { App } from '$lib/States.svelte';

	let { children } = $props()

	let ToastStore = $state(getToastStore());

	onMount(() => {
		App.populateAll(createPopulateErrorHandler(ToastStore), true)

		if (!App.hasValidApi) {
			goto(`${base}/settings`);
		}
	});
</script>

<Toast />
<PageDrawer />
<Modal />
<AppShell slotSidebarLeft="w-0 lg:w-56 lg:border-r border-zinc-200 dark:border-zinc-800" scrollGutter="stable both-edges">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar padding="px-4 py-2" shadow="">
			<svelte:fragment slot="lead">
				<div>
					<button
						aria-label="open navigation panel"
						class="lg:hidden btn btn-sm mr-4"
						onclick={() => {
							DrawerStore.open(drawerSettings);
						}}
					>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
					<a href="{base}/" class="inline-flex items-center gap-2 font-semibold tracking-tight">
						<img src="{base}/favicon.svg" alt="" class="w-6 h-6 dark:invert" />TJNPVScale
						<span class="text-xs font-normal text-zinc-500">v{version}</span>
					</a>
				</div>
			</svelte:fragment>

			<svelte:fragment slot="trail">
				<LightSwitch />
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/tjunussov/tjnpvscale"
					target="_blank"
					rel="noreferrer"
				>
					<RawMdiGithub class="mr-2" />
					GitHub
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<Navigation />
	</svelte:fragment>
	<div class="px-4 lg:px-8 h-full" transition:fade|local>
		{@render children()}
	</div>
</AppShell>
