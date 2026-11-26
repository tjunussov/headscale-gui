<script>
	let { children } = $props()
</script>

<div class="grid grid-cols-1 card p-5">
	{@render children()}
</div>
