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
	</Sidebar.Content>
	<Sidebar.Footer>
		<p class="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">headscale-admin v{version}</p>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
