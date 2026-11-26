<script lang="ts">
	let { children } = $props();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{@render children()}</div>
