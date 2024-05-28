<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ countries, tournaments, user, profile, supabase } = data);
</script>

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
