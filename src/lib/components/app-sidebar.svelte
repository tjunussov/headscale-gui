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
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="{base}/" {...props}>
							<img src="{base}/favicon.svg" alt="" class="size-8 rounded-lg dark:invert" />
							<span class="truncate font-semibold uppercase tracking-tight">TJNPVScale</span>
							<span class="text-xs text-muted-foreground">{version}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each items as item (item.path)}
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
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
