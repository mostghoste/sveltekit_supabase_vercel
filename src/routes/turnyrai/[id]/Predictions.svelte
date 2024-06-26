<script lang="ts">
	import PredictionCard from './PredictionCard.svelte';

	type Prediction = {
		home_team: string;
		away_team: string;
		prediction_home?: number;
		prediction_away?: number;
	};

	export let unpredictedMatchups = [];
	let predictions: Prediction[] = unpredictedMatchups.map((pred) => {
		return { home_team: pred.team_home, away_team: pred.team_away };
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

		if (home !== undefined && away !== undefined) {
			// console.log('Prediction has score');
			try {
				if (Number(home) >= 0 && Number(away) >= 0) {
					predictionInvalid = false;
				}
			} catch {
				predictionInvalid = false;
			}
		}

		if (!tieAllowed && home === away) {
			predictionInvalid = true;
		}

		return predictionInvalid;
	};

	const tieAllowed = false;
</script>

{#if unpredictedMatchups && unpredictedMatchups.length > 0}
	<section class="flex flex-col gap-2 mb-4">
		<header class="flex items-cente justify-between">
			<span class="font-bold">Dar neatlikti spėjimai</span>
			<span>{currentlySelectedMatchup + 1}/{unpredictedMatchups.length}</span>
		</header>
		<PredictionCard
			matchup={unpredictedMatchups[currentlySelectedMatchup]}
			prediction={predictions[currentlySelectedMatchup]}
			{tieAllowed}
			{onUpdateScore}
		></PredictionCard>
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
						if (currentlySelectedMatchup + 1 < unpredictedMatchups.length) {
							currentlySelectedMatchup = currentlySelectedMatchup + 1;
						}
					}}
					class="btn btn-primary btn-success"
					type="submit">Peržiūrėti</button
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
