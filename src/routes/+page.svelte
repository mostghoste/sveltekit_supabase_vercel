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

<h1>Toto!</h1>
{#if user}
	<p>Tu prisijungęs kaip: {user.email}</p>
	<p>Username: {profile?.username}</p>
	<p>Admin: {profile?.admin}</p>
	<button on:click={logout}>Atsijungti</button>

	<a href="/turnyrai">Turnyrai</a>
{:else}
	<p>Tu dar neprisijungęs</p>
	<a href="/auth">Prisijungti</a>
{/if}
