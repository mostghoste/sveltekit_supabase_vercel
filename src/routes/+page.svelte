<script>
	export let data;
	$: ({ countries, tournaments, user, profile } = data);
</script>

<h1>Toto!</h1>
{#if user}
	<p>Tu prisijungęs kaip: {user.email}</p>
	<p>Username: {profile?.username}</p>
	<p>Admin: {profile?.admin}</p>

	<h2>Turnyrai</h2>
	{#if tournaments}
		<p>Turnyrų skaičius: {tournaments.length}</p>
		<ul>
			{#each tournaments as tournament}
				<li>{tournament.name}</li>
			{/each}
		</ul>
	{:else}
		<p>Turnyrų nerasta</p>
	{/if}

	<form method="post" action="?/addTournament">
		<input type="text" placeholder="Turnyro pavadinimas" name="name" required />
		<button type="submit">Pridėti</button>
	</form>
{:else}
	<p>Tu dar neprisijungęs</p>
	<a href="/auth">Prisijungti</a>
{/if}
