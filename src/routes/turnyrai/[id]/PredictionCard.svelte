<script lang="ts">
	export let matchup;
	export let prediction;
	export let onUpdateScore;
	export let tieAllowed = true;

	let homeInput, awayInput;

	$: home_score_prediction = prediction?.prediction_home ?? '';
	$: away_score_prediction = prediction?.prediction_away ?? '';

	const updateScore = () => {
		home_score_prediction = homeInput.value.trim() !== '' ? parseInt(homeInput.value, 10) || 0 : '';
		away_score_prediction = awayInput.value.trim() !== '' ? parseInt(awayInput.value, 10) || 0 : '';
		onUpdateScore(home_score_prediction, away_score_prediction);
	};
</script>

<article class="bg-base-200 rounded-box flex justify-between p-2 gap-2 text-sm">
	<button
		class="min-w-24 h-24 border border-base-200 shadow-md bg-base-100 flex justify-center items-center rounded-box"
		on:click={() => {
			home_score_prediction = 1;
			away_score_prediction = 0;
			onUpdateScore(home_score_prediction, away_score_prediction);
		}}
	>
		{matchup.team_home}
	</button>
	<div class="w-full justify-evenly flex flex-col">
		<div class="flex justify-evenly">
			<input
				bind:this={homeInput}
				value={home_score_prediction}
				on:input={updateScore}
				class="input input-bordered input-sm w-12 text-center"
				type="text"
			/>
			<input
				bind:this={awayInput}
				value={away_score_prediction}
				on:input={updateScore}
				class="input input-bordered input-sm w-12 text-center"
				type="text"
			/>
		</div>
	</div>
	<button
		on:click={() => {
			home_score_prediction = 0;
			away_score_prediction = 1;
			onUpdateScore(home_score_prediction, away_score_prediction);
		}}
		class="min-w-24 h-24 border border-base-200 shadow-md bg-base-100 flex justify-center items-center rounded-box"
	>
		{matchup.team_away}
	</button>
</article>
