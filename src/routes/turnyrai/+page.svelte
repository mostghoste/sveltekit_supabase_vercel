<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ tournaments, user, profile, supabase } = data);
</script>

<h2>Turnyrai</h2>
{#if tournaments}
	<p>Turnyrų skaičius: {tournaments.length}</p>
	<ul>
		{#each tournaments as tournament}
			<li><a href={`/turnyrai/${tournament.id}`}>{tournament.name}</a></li>
		{/each}
	</ul>
{:else}
	<p>Turnyrų nerasta</p>
{/if}

{#if profile?.admin}
	<form method="post" action="?/addTournament">
		<input type="text" placeholder="Turnyro pavadinimas" name="name" required />
		<button type="submit">Pridėti</button>
	</form>
{/if}
