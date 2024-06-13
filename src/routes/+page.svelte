<script>
	export let data;
	$: ({ user, profile, supabase } = data);

	$: logout = async () => {
		// console.log('Logging out');
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}
	};
</script>

<h1>👀 Stebėtojas</h1>
{#if user}
	<p>Tu prisijungęs kaip: {user.email}</p>
	<button class="btn btn-primary" on:click={logout}>Atsijungti</button>
	<p>Username: {profile?.username}</p>
	{#if !profile?.username}
		<form method="post" action="?/setUsername">
			<input type="text" name="username" placeholder="Slapyvardis" />
			<button type="submit">Nustatyti</button>
		</form>
	{/if}
	<p>Admin: {profile?.admin}</p>

	<a href="/turnyrai">Turnyrai</a>
{:else}
	<p>Tu dar neprisijungęs</p>
	<a href="/auth">Prisijungti</a>
{/if}
