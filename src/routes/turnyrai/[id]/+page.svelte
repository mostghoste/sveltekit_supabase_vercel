<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPanel from './AdminPanel.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({
		tournament,
		user,
		matchups,
		profile,
		tournament_participant,
		matchup_predictions,
		tournament_participants,
		groups
	} = data);

	let unpredictedMatchups = [];
	$: if (matchups && matchup_predictions) {
		unpredictedMatchups = matchups.filter((matchup) => {
			return !matchup_predictions.some((prediction) => prediction.matchup_id === matchup.id);
		});
		unpredictedMatchups = unpredictedMatchups.filter((matchup) => matchup.predictions_open);
	} else if (matchups && !matchup_predictions) {
		unpredictedMatchups = matchups;
	}

	$: joinedPredictions = matchup_predictions?.map((prediction) => {
		const matchup = matchups?.find((matchup) => prediction.matchup_id === matchup.id);
		return { ...prediction, team_home: matchup?.team_home, team_away: matchup?.team_away };
	});

	$: selectedGroup = '';

	$: handleGroupChange = (groupName: string) => {
		selectedGroup = groupName;
	};
</script>

<span>Turnyras</span>
{#if tournament}
	<h1>{tournament.name}</h1>
{:else}
	<p>Turnyras nerastas</p>
{/if}

{#if profile?.admin}
	<AdminPanel {matchups} {groups} {selectedGroup} {unpredictedMatchups} {joinedPredictions} />
{/if}

{#if tournament_participant}
	<p>Tu šiame turnyre <strong>dalyvauji</strong></p>
{:else}
	<p>Tu šiame turnyre <strong>nedalyvauji</strong></p>
	<form method="post" action="?/join">
		<button class="btn btn-success" type="submit">Prisijungti</button>
	</form>
{/if}

<h2>Ateinančios varžybos</h2>
{#if matchups}
	<p>Ateinančių varžybų skaičius: {matchups.length}</p>
	<ul>
		{#each matchups as matchup}
			<li>
				{matchup.team_home} - {matchup.team_away}; Spėjimai
				<strong>{matchup.predictions_open ? 'atidaryti' : 'uždaryti'}</strong>
			</li>
		{/each}
	</ul>
{:else}
	<p>Ateinančių varžybų nerasta</p>
{/if}

{#if tournament_participant}
	<h2>Mano spėjimai</h2>
	<h3>Dar neatlikti spėjimai ({unpredictedMatchups.length})</h3>
	<h4></h4>
	{#if unpredictedMatchups && unpredictedMatchups.length > 0}
		{#each unpredictedMatchups as matchup}
			<form use:enhance method="post" action="?/makePrediction">
				<input type="hidden" name="home_name" value={matchup.team_home} />
				<input type="hidden" name="away_name" value={matchup.team_away} />

				<input type="hidden" name="matchup_id" value={matchup.id} />
				<div>
					<label>Kas laimės?:</label>
					<div>
						<input
							type="radio"
							id="team_home_{matchup.id}"
							name="selected_team"
							value="home_win"
							required
						/>
						<label for="team_home_{matchup.id}">{matchup.team_home}</label>
					</div>
					<div>
						<input
							type="radio"
							id="team_away_{matchup.id}"
							name="selected_team"
							value="away_win"
							required
						/>
						<label for="team_away_{matchup.id}">{matchup.team_away}</label>
					</div>
					<div>
						<input type="radio" id="tie_{matchup.id}" name="selected_team" value="tie" required />
						<label for="tie_{matchup.id}">Lygiosios</label>
					</div>
				</div>
				<div>
					<label for="score_home_{matchup.id}">{matchup.team_home} taškai:</label>
					<input type="number" id="score_home_{matchup.id}" name="score_home" placeholder="69" />
				</div>
				<div>
					<label for="score_away_{matchup.id}">{matchup.team_away} taškai:</label>
					<input type="number" id="score_away_{matchup.id}" name="score_away" placeholder="69" />
				</div>
				<button type="submit">Pateikti spėjimą</button>
			</form>
		{/each}
	{:else}
		<p>Visi galimi spėjimai atlikti</p>
	{/if}

	<h3>Patvirtinti spėjimai</h3>
	{#if joinedPredictions && joinedPredictions.length > 0}
		<!-- <ul>
			{#each joinedPredictions as prediction}
				<li>
					<p>{prediction.team_home} - {prediction.team_away}</p>
					<p>
						<strong>{prediction.selected_team}</strong> laimės {prediction.point_difference} taškais
					</p>
				</li>
			{/each}
		</ul> -->
		<table>
			<tr>
				<th> Varžybos </th>
				<th>Spėjimas</th>
				<th>Rezultatas</th>
				<th>Statusas</th>
				<th>Taškai</th>
			</tr>
			{#each joinedPredictions as prediction}
				<tr>
					<td>{prediction.team_home} - {prediction.team_away}</td>
					<td
						>{prediction.matchup_outcome === 'tie'
							? 'Lygiosios'
							: prediction.matchup_outcome === 'home_win'
								? prediction.team_home
								: prediction.team_away}</td
					>
					<td>
						{prediction.score_home} : {prediction.score_away}
					</td>
					<td>{prediction.prediction_status}</td>
					<td>{prediction.points !== null ? `+${prediction.points}` : ''}</td>
				</tr>
				<!-- <p>{JSON.stringify(prediction)}</p> -->
			{/each}
		</table>
	{:else}
		<p>Dar neatlikai jokių spėjimų</p>
	{/if}
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

<!-- {#if errorMessage != ''}
	<div class="clippy">
		<p class="emoji">🤓☝️</p>
	</div>
	<div class="errorMessage">
		<p>Akshually, {errorMessage}</p>
	</div>
{/if} -->

<style>
	td,
	th {
		border: 1px solid gray;
		padding: 2px;
	}

	.center {
		text-align: center;
	}

	.score {
		width: 4rem;
		text-align: center;
	}

	.clippy {
		position: fixed;
		right: 0.1rem;
		bottom: -6rem;
	}

	.emoji {
		font-size: 6rem;
	}

	.errorMessage {
		position: fixed;
		bottom: 7rem;
		right: 2rem;
		max-width: 16rem;
	}

	.groupContainer {
		display: flex;
		gap: 0.4rem;
	}
</style>
