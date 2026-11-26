<script lang="ts">
	// Deploy moved into Machines › Add machine › Advanced; keep old links working
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	onMount(() => goto(`${base}/nodes/?add=advanced`, { replaceState: true }));
</script>
