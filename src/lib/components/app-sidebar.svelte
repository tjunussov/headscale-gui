<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { App } from '$lib/States.svelte';
	import { version } from '$lib/common/debug';
	import { nav } from '$lib/nav';

	const sidebar = useSidebar();
	const items = $derived(App.hasValidApi ? nav : nav.slice(-1));
	const groups = $derived([...new Set(items.map((i) => i.group))]);
	// which Headscale server this panel talks to (empty API URL = same origin)
	const server = $derived.by(() => { try { return new URL(App.apiUrl.value || page.url.origin).host; } catch { return App.apiUrl.value; } });
</script>

<Sidebar.Root collapsible="icon" variant="inset">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="{base}/" {...props}>
							<img src="{base}/favicon.svg" alt="" class="size-8 rounded-lg dark:invert" />
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">TJNPVScale</span>
								<span class="truncate text-xs text-muted-foreground" title={App.apiUrl.value || page.url.origin}>{server}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		{#each groups as group (group)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group}</Sidebar.GroupLabel>
				<Sidebar.Menu>
					{#each items.filter((i) => i.group === group) as item (item.path)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.route.id === item.path} tooltipContent={item.name}>
								{#snippet child({ props })}
									<a href="{base}{item.path}" onclick={() => sidebar.setOpenMobile(false)} {...props}>
										<item.icon />
										<span>{item.name}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/each}
		<!-- repo link + version right under the menu (a bottom-pinned footer got lost on tall windows);
		     collapsed sidebar keeps just the icon -->
		<Sidebar.Group class="pt-0">
		<a
			href="https://github.com/tjunussov/tjnpvscale"
			target="_blank"
			rel="noreferrer"
			title="TJNPVScale on GitHub"
			class="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
		>
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-4 shrink-0"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>
			<span class="truncate group-data-[collapsible=icon]:hidden">headscale-admin v{version}</span>
		</a>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
