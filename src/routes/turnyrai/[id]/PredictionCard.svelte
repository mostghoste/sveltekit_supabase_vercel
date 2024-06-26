<script lang="ts">
	export let matchup;
	export let prediction;

	export let onUpdateScore;

	$: home_score_prediction = prediction.prediction_home;
	$: away_score_prediction = prediction.prediction_away;

	console.log(home_score_prediction);

	export let tieAllowed = true;
</script>

<article class="bg-base-200 rounded-box flex justify-between p-2 gap-2 text-sm">
	<button
		class="min-w-24 h-24 bg-primary-content text-primary flex justify-center items-center rounded-box"
		on:click={() => {
			home_score_prediction = 1;
			away_score_prediction = 0;
			onUpdateScore(home_score_prediction, away_score_prediction);
		}}
	>
		{matchup.team_home}
	</button>
	<div class=" w-full justify-evenly flex flex-col">
		<div></div>
		<div class="flex justify-evenly">
			<input
				bind:value={home_score_prediction}
				on:input={() => onUpdateScore(home_score_prediction, away_score_prediction)}
				class="input input-bordered input-sm w-12 text-center"
				type="text"
			/>
			<input
				bind:value={away_score_prediction}
				on:input={() => onUpdateScore(home_score_prediction, away_score_prediction)}
				class="input input-bordered input-sm w-12 text-center"
				type="text"
			/>
		</div>
		<div>
			<button
				on:click={() => {
					home_score_prediction = 1;
					away_score_prediction = 0;
					onUpdateScore(home_score_prediction, away_score_prediction);
				}}
				class="btn btn-sm btn-secondary px-2">1:0</button
			>
			{#if tieAllowed}
				<button
					on:click={() => {
						home_score_prediction = 1;
						away_score_prediction = 1;
						onUpdateScore(home_score_prediction, away_score_prediction);
					}}
					class="btn btn-sm btn-secondary px-2">1:1</button
				>
			{/if}
			<button
				on:click={() => {
					home_score_prediction = 0;
					away_score_prediction = 1;
					onUpdateScore(home_score_prediction, away_score_prediction);
				}}
				class="btn btn-sm btn-secondary px-2">0:1</button
			>
		</div>
	</div>
	<button
		on:click={() => {
			home_score_prediction = 0;
			away_score_prediction = 1;
			onUpdateScore(home_score_prediction, away_score_prediction);
		}}
		class="min-w-24 h-24 bg-primary-content text-primary flex justify-center items-center rounded-box text-"
	>
		{matchup.team_away}
	</button>
</article>
