<script lang="ts">
	import AclToolbar from '$lib/parts/AclToolbar.svelte';
	import { saveConfig, type ACLBuilder } from '$lib/common/acl.svelte';
	import { debug } from '$lib/common/debug';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import TagOwnerListCard from '$lib/cards/acl/TagOwnerListCard.svelte';
	import NewItem from '$lib/parts/NewItem.svelte';


	let {acl = $bindable(), loading = $bindable(false)}: {acl: ACLBuilder, loading?: boolean} = $props();

	let showCreateTag = $state(false);
	let newTagName = $state('');

	let tagsFilter = $state('');

	function newTag() {
		loading = true;
		try {
			acl.createTag(newTagName);
			toastSuccess(`Tag Ownership of '${newTagName}' created`);
			newTagName = '';
			showCreateTag = false;
		} catch (e) {
			if (e instanceof Error) {
				toastError('', e);
			}
		} finally {
			loading = false;
		}
	}

	const filteredTags = $derived.by(() => {
		const tags = acl.getTagNames()
		try {
			const r = RegExp(tagsFilter);
			return tags.filter((g) => r.test(g));
		} catch {
			debug(`Tag Regex "${tagsFilter}" is invalid`);
			return tags;
		}
	})

	function toggleShowCreateTag() {
		showCreateTag = !showCreateTag;
	}

</script>

<div class="flex flex-col gap-4">
<AclToolbar bind:filter={tagsFilter} placeholder="Filter Tags..." label="Create Tag" onclick={toggleShowCreateTag} {loading} save={() => saveConfig(acl, { setLoadingTrue: () => (loading = true), setLoadingFalse: () => (loading = false) })}>
	{#if showCreateTag}<NewItem title="Tag" disabled={loading} bind:name={newTagName} submit={() => newTag()} />{/if}
</AclToolbar>
<div class="flex flex-col gap-3">
	{#each filteredTags as tag (tag)}
		<TagOwnerListCard bind:acl tagName={tag} />
	{/each}
</div>
</div>
