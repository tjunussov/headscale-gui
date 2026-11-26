<script lang="ts">
	import CardListContainer from '../CardListContainer.svelte';
	import CardSeparator from '../CardSeparator.svelte';
	import ItemCreatedAt from '../common/ItemCreatedAt.svelte';
	import ItemDelete from '../common/ItemDelete.svelte';
	import ItemListName from '../common/ItemListName.svelte';
	import UserDisplayName from './UserDisplayName.svelte';
	import UserEmail from './UserEmail.svelte';
	import UserListNodes from './UserListNodes.svelte';
	import UserListPreAuthKeys from './UserListPreAuthKeys.svelte';
	import UserProvider from './UserProvider.svelte';
	import type { User } from '$lib/common/types';

	type UserInfoProps = {
		user: User,
	}
	let { user }: UserInfoProps = $props()
</script>

<CardListContainer>
	<ItemListName item={user} allowed={user.provider.toLocaleLowerCase() !== "oidc"} />
	<CardSeparator />
	{#if user.displayName}
	<UserDisplayName {user} />
	<CardSeparator />
	{/if}
	{#if user.email}
	<UserEmail {user} />
	<CardSeparator />
	{/if}
	<UserProvider {user} />
	<CardSeparator />
	<ItemCreatedAt item={user} />
	<CardSeparator />
	<UserListNodes {user} />
	<CardSeparator />
	{#if user.name || user.email}
	<UserListPreAuthKeys {user} />
	<CardSeparator />
	{/if}
	<ItemDelete item={user} />
</CardListContainer>
