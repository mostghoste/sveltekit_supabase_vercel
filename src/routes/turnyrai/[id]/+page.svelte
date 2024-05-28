<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({
		tournament,
		user,
		matchups,
		profile,
		tournament_participant,
		matchup_predictions,
		tournament_participants
	} = data);

	let unpredictedMatchups = [];

	$: if (matchups && matchup_predictions) {
		unpredictedMatchups = matchups.filter((matchup) => {
			return !matchup_predictions.some((prediction) => prediction.matchup_id === matchup.id);
		});
	} else if (matchups && !matchup_predictions) {
		unpredictedMatchups = matchups;
	}
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
		<form use:enhance method="post" action="?/addMatchup">
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
			<li>{matchup.team_home} - {matchup.team_away}</li>
		{/each}
	</ul>
{:else}
	<p>Ateinančių varžybų nerasta</p>
{/if}

<h2>Mano spėjimai</h2>
<h3>Dar neatlikti spėjimai</h3>
{#if unpredictedMatchups && unpredictedMatchups.length > 0}
	{#each unpredictedMatchups as matchup}
		<form use:enhance method="post" action="?/makePrediction">
			<input type="hidden" name="matchup_id" value={matchup.id} />
			<div>
				<label>Pasirink komandą:</label>
				<div>
					<input
						type="radio"
						id="team_home_{matchup.id}"
						name="selected_team"
						value={matchup.team_home}
						required
					/>
					<label for="team_home_{matchup.id}">{matchup.team_home}</label>
				</div>
				<div>
					<input
						type="radio"
						id="team_away_{matchup.id}"
						name="selected_team"
						value={matchup.team_away}
						required
					/>
					<label for="team_away_{matchup.id}">{matchup.team_away}</label>
				</div>
			</div>
			<div>
				<label for="point_difference_{matchup.id}">Taškų skirtumas:</label>
				<input type="number" id="point_difference_{matchup.id}" name="point_difference" required />
			</div>
			<button type="submit">Pateikti spėjimą</button>
		</form>
	{/each}
{:else}
	<p>Visi galimi spėjimai atlikti</p>
{/if}

<h3>Patvirtinti spėjimai</h3>
{#if matchup_predictions && matchup_predictions.length > 0}
	<ul>
		{#each matchup_predictions as prediction}
			<li>{JSON.stringify(prediction)}</li>
		{/each}
	</ul>
{:else}
	<p>Dar neatlikai jokių spėjimų</p>
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
