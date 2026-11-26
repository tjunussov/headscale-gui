<script lang="ts">
	import AclToolbar from '$lib/parts/AclToolbar.svelte';
	import { type ACLBuilder } from '$lib/common/acl.svelte';
	import { debug } from '$lib/common/debug';
	import { toastError, toastSuccess } from '$lib/common/funcs';
	import GroupListCard from '$lib/cards/acl/GroupListCard.svelte';

	import NewItem from '$lib/parts/NewItem.svelte';

	let {acl = $bindable(), loading = $bindable(false)}: {acl: ACLBuilder, loading?: boolean} = $props();


	let showCreateGroup = $state(false);
	let newGroupName = $state('');
	let groupsFilterString = $state('');

	const filteredGroups = $derived.by(() => {
		const groups = acl.getGroupNames()

		try {
			if (groupsFilterString === '') {
				return groups;
			}

			const r = RegExp(groupsFilterString);
			return groups.filter((g) => r.test(g));
		} catch {
			debug(`Group Regex "${groupsFilterString}" is invalid`);
			return groups;
		}
	});

	function newGroup() {
		loading = true;
		try {
			acl.createGroup(newGroupName);
			toastSuccess(`Group '${newGroupName}' created`);
			newGroupName = '';
			showCreateGroup = false;
		} catch (e) {
			if (e instanceof Error) {
				toastError('', e);
			}
		} finally {
			loading = false;
		}
	}

	function toggleShowCreateGroup() {
		showCreateGroup = !showCreateGroup;
	}

</script>

<div class="flex flex-col gap-4">
<AclToolbar bind:filter={groupsFilterString} placeholder="Filter groups…" label="New group" onclick={toggleShowCreateGroup}>
	{#if showCreateGroup}<NewItem title="Group" disabled={loading} bind:name={newGroupName} submit={newGroup} />{/if}
</AclToolbar>
<div class="flex flex-col gap-3">
	{#each filteredGroups as groupName (groupName)}
		<GroupListCard bind:acl {groupName} open />
	{/each}
</div>
</div>
