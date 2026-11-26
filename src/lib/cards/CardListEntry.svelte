<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type CardListEntryProps = {
		title?: string;
		value?: any;
		top?: boolean;
		titleClasses?: string;
		valueClasses?: string;
		childTitle?: Snippet;
		childBottom?: Snippet;
		children?: Snippet;
	};
	let { title, value, top = false, titleClasses = '', valueClasses = '', childTitle, childBottom, children }: CardListEntryProps = $props();
</script>

<!-- shadcn-style description row: muted label left, value right -->
<div class="py-3 text-sm">
	<div class={cn('flex justify-between gap-4', top ? 'items-start' : 'items-center')}>
		<div class={cn('shrink-0 text-muted-foreground', titleClasses)}>
			{#if title !== undefined}{title}{:else}{@render childTitle?.()}{/if}
		</div>
		<div class={cn('min-w-0 text-right font-medium', valueClasses)}>
			{#if value !== undefined}{value}{:else}{@render children?.()}{/if}
		</div>
	</div>
	{@render childBottom?.()}
</div>
