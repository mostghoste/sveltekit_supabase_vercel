<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPanel from './AdminPanel.svelte';
	import type { PageData } from './$types';
	import Predictions from './Predictions.svelte';
	import Leaderboard from './Leaderboard.svelte';
	import { format } from 'date-fns';
	import { el } from 'date-fns/locale';

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

	const getMatchupFromId = (id: string) => {
		let matchup = matchups?.find((m) => {
			return m.id == id;
		});

		if (matchup) {
			return `${matchup.team_home} - ${matchup.team_away} (${format(new Date(matchup.start_time), 'MM-dd HH:mm')})`;
		} else return '';
	};
</script>

<span>Turnyras</span>
{#if tournament}
	<h1 class="m-0 p-0">{tournament.name}</h1>
	<!-- <p class="text-error">Spėjimų atlikimas uždaromas 2024-06-14 23:59!</p> -->
{:else}
	<p>Turnyras nerastas</p>
{/if}

{#if profile?.admin}
	<AdminPanel {matchups} {groups} {unpredictedMatchups} {joinedPredictions} />
{/if}

{#if tournament_participant}
	<p class="text-sm">Tu šiame turnyre <strong>dalyvauji</strong></p>
	<!-- <Predictions {unpredictedMatchups}></Predictions> -->
{:else}
	<p class="text-sm mt-2 mb-1">Tu šiame turnyre dar <strong>nedalyvauji</strong></p>
	<h3 class="text-left">Dalyvaudamas turnyre įsipareigoji:</h3>
	<ul class="text-left m-0">
		<li>Prabalsuoti už kiekvienų varžybų baigtį</li>
		<li>Gauti taškus pagal tai kokie tikslūs tavo spėjimai</li>
		<li>Turnyrinėje lentelėje pasirodyti geriau už visus kitus</li>
	</ul>
	<form method="post" action="?/join">
		<button class="btn btn-success mb-4" type="submit">Dalyvauti</button>
	</form>
{/if}

<section class="flex flex-col gap-2">
	<div class="collapse collapse-plus bg-base-200">
		<input type="checkbox" />
		<p class="collapse-title p-0 m-0 flex justify-center items-center text-xl font-medium">
			🔜 Ateinančios varžybos ({matchups?.length || 0})
		</p>
		<div class="collapse-content">
			{#if matchups}
				<!-- <p>Paspaudus ant paryškintų komandų sužinosi iš kokių varžybų ateis komanda</p> -->
				<table>
					<thead class="font-bold">
						<td>Komandos</td>
						<td>Laikas</td>
						<td>Tipas</td>
					</thead>
					{#each (matchups = matchups.sort((a, b) => {
						if (!a.start_time) return 1;
						if (!b.start_time) return -1;
						return new Date(a.start_time) - new Date(b.start_time);
					})) as matchup}
						<tr>
							<td>
								{#if matchup.team_home === 'TBD' && matchup.home_previous}
									<span
										class="font-bold"
										title={`Nugalėtojas iš varžybų ${getMatchupFromId(matchup.home_previous)}`}
										>{matchup.team_home}</span
									>
								{:else}
									<span>{matchup.team_home}</span>
								{/if}
								-
								{#if matchup.team_away === 'TBD' && matchup.away_previous}
									<span
										class="font-bold"
										title={`Nugalėtojas iš varžybų ${getMatchupFromId(matchup.away_previous)}`}
										>{matchup.team_away}</span
									>
								{:else}
									<span>{matchup.team_away}</span>
								{/if}
							</td>
							<td>{format(new Date(matchup.start_time), 'MM-dd HH:mm')}</td>
							<td>{matchup.type}</td>
						</tr>
					{/each}
				</table>
			{:else}
				<p>Ateinančių varžybų nerasta</p>
			{/if}
		</div>
	</div>
</section>

{#if tournament_participant}
	<h2>Mano spėjimai</h2>
	<h3>Dar neatlikti spėjimai ({unpredictedMatchups.length})</h3>
	{#if unpredictedMatchups && unpredictedMatchups.length > 0}
		<section class="flex flex-col gap-2">
			{#each unpredictedMatchups as matchup}
				<form
					use:enhance
					method="post"
					action="?/makePrediction"
					class="bg-base-200 p-2 rounded-box flex flex-col gap-2"
				>
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
					<div class="flex flex-col text-left">
						<label for="score_home_{matchup.id}">{matchup.team_home} taškai:</label>
						<input
							class="input input-bordered"
							type="number"
							id="score_home_{matchup.id}"
							name="score_home"
							placeholder="0"
						/>
					</div>
					<div class="flex flex-col text-left">
						<label for="score_away_{matchup.id}">{matchup.team_away} taškai:</label>
						<input
							class="input input-bordered"
							type="number"
							id="score_away_{matchup.id}"
							name="score_away"
							placeholder="0"
						/>
					</div>
					<button class="btn btn-success btn-sm" type="submit">Pateikti spėjimą</button>
				</form>
			{/each}
		</section>
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

<Leaderboard {tournament_participants} {user} />

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
