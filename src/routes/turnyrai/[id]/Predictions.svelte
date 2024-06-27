<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	export let unpredictedMatchups = [];
	export let tournament;

	import PredictionCard from './PredictionCard.svelte';

	type Prediction = {
		home_team: string;
		away_team: string;
		prediction_home?: number;
		prediction_away?: number;
		penalty_series?: boolean;
		matchup_id: string;
		matchup_outcome: string;
		selected_team: string;
	};

	unpredictedMatchups.sort(
		(a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
	);
	let predictions: Prediction[] = unpredictedMatchups.map((pred) => {
		return {
			home_team: pred.team_home,
			away_team: pred.team_away,
			penalty_series: false,
			matchup_id: pred.id,
			matchup_outcome: '',
			selected_team: ''
		};
	});
	let currentlySelectedMatchup = 0;

	const onUpdateScore = (home: number, away: number) => {
		predictions[currentlySelectedMatchup].prediction_home = home;
		predictions[currentlySelectedMatchup].prediction_away = away;

		if (home > away) {
			predictions[currentlySelectedMatchup].matchup_outcome = 'home_win';
			predictions[currentlySelectedMatchup].selected_team =
				predictions[currentlySelectedMatchup].home_team;
		} else if (home < away) {
			predictions[currentlySelectedMatchup].matchup_outcome = 'away_win';
			predictions[currentlySelectedMatchup].selected_team =
				predictions[currentlySelectedMatchup].away_team;
		} else {
			predictions[currentlySelectedMatchup].matchup_outcome = 'tie';
		}
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
	$: displayedMatchup = { ...currentMatchup };

	$: if (currentMatchup.team_home === 'TBD') {
		console.log('TBD HOME');
	}

	$: if (currentMatchup.team_away === 'TBD' && currentMatchup.away_previous) {
		let votedWinner = predictions.find((p) => p.matchup_id === currentMatchup.id);
		console.log(votedWinner);
		// displayedMatchup = { ...displayedMatchup, team_away:  };
	}

	const tieAllowed = false;

	$: submitScreen = false;

	const handleSubmitPredictions = async () => {
		const formData = new FormData();
		formData.append('predictions', JSON.stringify(predictions));

		const response = await fetch(`/turnyrai/${tournament.id}?/submitPredictions`, {
			method: 'POST',
			body: formData
		});

		const result = await response.json();
		console.log(result.data);

		if (result.data[0]) {
			alert('Spėjimai sėkmingai išsaugoti');
			invalidateAll();
		} else {
			alert('Klaida išsaugant spėjimus');
		}
	};
</script>

{#if unpredictedMatchups && unpredictedMatchups.length > 0}
	<section class="flex flex-col gap-2 mb-4">
		{#if submitScreen}
			<h4>Spėjimų peržiūra</h4>
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
			<footer class="flex gap-2 justify-between">
				<button
					on:click={() => {
						submitScreen = false;
					}}
					class="btn btn-secondary"
					type="submit"
					disabled={currentlySelectedMatchup < 1}>⬅️ Atgal</button
				>
				<button
					on:click={() => {
						handleSubmitPredictions();
					}}
					class="btn btn-primary btn-success"
					type="submit"
					disabled={validatePrediction()}>💾 Patvirtinti</button
				>
			</footer>
		{:else}
			<header class="flex items-cente justify-between">
				<span class="font-bold">Dar neatlikti spėjimai</span>
				<span>{currentlySelectedMatchup + 1}/{unpredictedMatchups.length}</span>
			</header>
			{#if currentMatchup.type}
				<h4>{currentMatchup.type}</h4>
			{/if}
			<PredictionCard
				matchup={displayedMatchup}
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
		{/if}
	</section>
{/if}
