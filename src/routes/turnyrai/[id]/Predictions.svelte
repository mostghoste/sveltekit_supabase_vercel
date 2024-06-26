<script lang="ts">
	import { tr } from 'date-fns/locale';
	import PredictionCard from './PredictionCard.svelte';

	type Prediction = {
		home_team: string;
		away_team: string;
		prediction_home?: number;
		prediction_away?: number;
	};

	export let unpredictedMatchups = [];
	unpredictedMatchups.sort(
		(a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
	);
	let predictions: Prediction[] = unpredictedMatchups.map((pred) => {
		return { home_team: pred.team_home, away_team: pred.team_away, penalty_series: false };
	});
	let currentlySelectedMatchup = 0;

	const onUpdateScore = (home: number, away: number) => {
		predictions[currentlySelectedMatchup].prediction_home = home;
		predictions[currentlySelectedMatchup].prediction_away = away;
	};

	$: validatePrediction = () => {
		let predictionInvalid = true;
		let home = predictions[currentlySelectedMatchup].prediction_home;
		let away = predictions[currentlySelectedMatchup].prediction_away;
		// console.log(home);

		if (home !== undefined && away !== undefined && home !== '' && away !== '') {
			if (Number.isFinite(Number(home)) && Number.isFinite(Number(away))) {
				if (Number(home) >= 0 && Number(away) >= 0) {
					predictionInvalid = false;
				}
			}
		}

		if (!tieAllowed && home === away) {
			predictionInvalid = true;
		}

		return predictionInvalid;
	};

	$: currentMatchup = unpredictedMatchups[currentlySelectedMatchup];
	$: currentPrediction = predictions[currentlySelectedMatchup];

	// $: if (currentMatchup.team_home === 'TBD') {
	// 	console.log('TBD HOME');
	// }

	// $: if (currentMatchup.team_away === 'TBD') {
	// 	console.log('TBD AWAY');
	// 	console.log(unpredictedMatchups[currentlySelectedMatchup]);
	// 	unpredictedMatchups[
	// }

	const tieAllowed = false;

	$: submitScreen = false;
</script>

{#if unpredictedMatchups && unpredictedMatchups.length > 0}
	<section class="flex flex-col gap-2 mb-4">
		<header class="flex items-cente justify-between">
			<span class="font-bold">Dar neatlikti spėjimai</span>
			<span>{currentlySelectedMatchup + 1}/{unpredictedMatchups.length}</span>
		</header>
		{#if currentMatchup.type}
			<h4>{currentMatchup.type}</h4>
		{/if}
		<PredictionCard
			matchup={unpredictedMatchups[currentlySelectedMatchup]}
			prediction={predictions[currentlySelectedMatchup]}
			{tieAllowed}
			{onUpdateScore}
		></PredictionCard>
		<div class="flex text-sm gap-2 items-center justify-end mr-2">
			<span
				title="Teisingas NE spėjimas duoda 0.25 taško.
Teisingas TAIP spėjimas duoda 1 tašką.">Ar bus baudinių serija?</span
			>
			<input
				title="Teisingas NE spėjimas duoda 0.25 taško.
Teisingas TAIP spėjimas duoda 1 tašką."
				type="checkbox"
				bind:checked={currentPrediction.penalty_series}
				class="checkbox checkbox-success checkbox-xs"
			/>
		</div>
		{#if submitScreen}
			<table class="table-auto">
				<thead>
					<tr>
						<th>Varžybos</th>
						<th>Spėjimas</th>
						<th>Baudiniai</th>
					</tr>
				</thead>
				<tbody>
					{#each predictions as prediction}
						<tr>
							<td>{prediction.home_team} - {prediction.away_team}</td>
							<td>{prediction.prediction_home} : {prediction.prediction_away}</td>
							<td>{prediction.penalty_series ? 'Taip' : 'Ne'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
		<footer class="flex gap-2 justify-between">
			<button
				on:click={() => {
					if (currentlySelectedMatchup > 0) {
						currentlySelectedMatchup = currentlySelectedMatchup - 1;
					}
				}}
				class="btn btn-secondary"
				type="submit"
				disabled={currentlySelectedMatchup < 1}>⬅️ Atgal</button
			>
			{#if currentlySelectedMatchup + 1 < unpredictedMatchups.length}
				<button
					on:click={() => {
						if (currentlySelectedMatchup + 1 < unpredictedMatchups.length) {
							currentlySelectedMatchup = currentlySelectedMatchup + 1;
						}
					}}
					class="btn btn-primary"
					type="submit"
					disabled={validatePrediction()}>Kitas ➡️</button
				>
			{:else}
				<button
					on:click={() => {
						submitScreen = true;
					}}
					class="btn btn-primary btn-success"
					type="submit"
					disabled={validatePrediction()}>Peržiūrėti</button
				>
			{/if}
		</footer>
	</section>
{/if}

<!-- <h2>Mano spėjimai</h2>
<h3>Dar neatlikti spėjimai ({unpredictedMatchups.length})</h3>
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
{/if} -->
