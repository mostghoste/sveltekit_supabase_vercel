<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ tournament, user, matchups, profile, tournament_participant, tournament_participants } =
		data);
</script>

<h2>Turnyras</h2>
{#if tournament}
	<h1>{tournament.name}</h1>
{:else}
	<p>Turnyras nerastas</p>
{/if}

{#if profile?.admin}
	<div style="border: 1px solid black">
		<h2>Admino panelė</h2>

		<h3>Pridėti varžybas</h3>
		<form method="post" action="?/addMatchup">
			<div>
				<label for="team_home">Komanda 1:</label>
				<input type="text" id="team_home" name="team_home" required />
			</div>
			<div>
				<label for="team_away">Komanda 2:</label>
				<input type="text" id="team_away" name="team_away" required />
			</div>
			<button type="submit">Pridėti</button>
		</form>
	</div>
{/if}

{#if tournament_participant}
	<p>Tu šiame turnyre <strong>dalyvauji</strong></p>
{:else}
	<p>Tu šiame turnyre <strong>nedalyvauji</strong></p>
	<form method="post" action="?/join">
		<button type="submit">Prisijungti</button>
	</form>
{/if}

<h2>Ateinančios varžybos</h2>
{#if matchups}
	<p>Ateinančių varžybų skaičius: {matchups.length}</p>
	<ul>
		{#each matchups as matchup}
			<li>{JSON.stringify(matchup)}</li>
		{/each}
	</ul>
{:else}
	<p>Ateinančių varžybų nerasta</p>
{/if}

<h2>Dalyvių taškai</h2>

{#if tournament_participants}
	<p>Dalyvių skaičius: {tournament_participants.length}</p>
	<ol>
		{#each tournament_participants as participant}
			{#if user?.id === participant.user_id}
				<li><strong>{participant.username}</strong> - {participant.points}</li>
			{:else}
				<li>{participant.username} - {participant.points}</li>
			{/if}
		{/each}
	</ol>
{:else}
	<p>Dalyvių nerasta</p>
{/if}
