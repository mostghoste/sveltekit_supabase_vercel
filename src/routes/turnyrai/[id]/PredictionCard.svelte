<script lang="ts">
	export let matchup;

	export let onUpdateScore;

	let home_score_prediction: number;
	let away_score_prediction: number;
</script>

<article class="bg-base-200 rounded-box flex justify-between p-2 gap-2 text-sm">
	<button
		class="min-w-24 h-24 bg-primary-content text-primary flex justify-center items-center rounded-box"
		on:click={() => {
			home_score_prediction = 1;
			away_score_prediction = 0;
		}}
	>
		{matchup.team_home}
	</button>
	<div class=" w-full justify-evenly flex flex-col">
		<div></div>
		<div class="flex justify-evenly">
			<input
				bind:value={home_score_prediction}
				class="input input-bordered input-sm w-12 text-center"
				placeholder="0"
				type="text"
			/>
			<input
				bind:value={away_score_prediction}
				class="input input-bordered input-sm w-12 text-center"
				placeholder="0"
				type="text"
			/>
		</div>
		<div>
			<button
				on:click={() => {
					home_score_prediction = 1;
					away_score_prediction = 0;
				}}
				class="btn btn-sm btn-secondary px-2">1:0</button
			>
			<button
				on:click={() => {
					home_score_prediction = 1;
					away_score_prediction = 1;
				}}
				class="btn btn-sm btn-secondary px-2">1:1</button
			>
			<button
				on:click={() => {
					home_score_prediction = 0;
					away_score_prediction = 1;
				}}
				class="btn btn-sm btn-secondary px-2">0:1</button
			>
		</div>
	</div>
	<button
		on:click={() => {
			home_score_prediction = 0;
			away_score_prediction = 1;
		}}
		class="min-w-24 h-24 bg-primary-content text-primary flex justify-center items-center rounded-box text-"
	>
		{matchup.team_away}
	</button>
</article>
