<script lang="ts">
	import PredictionCard from './PredictionCard.svelte';

	type matchup = {
		home_team: string;
		away_team: string;
	};

	export let unpredictedMatchups: matchup[] = [];
	let currentlySelectedMatchup = 0;
</script>

{#if unpredictedMatchups && unpredictedMatchups.length > 0}
	<section class="flex flex-col gap-2 mb-4">
		<header class="flex items-cente justify-between">
			<span class="font-bold">Dar neatlikti spėjimai</span>
			<span>{currentlySelectedMatchup + 1}/{unpredictedMatchups.length}</span>
		</header>
		<PredictionCard matchup={unpredictedMatchups[currentlySelectedMatchup]}></PredictionCard>
		<footer class="flex gap-2">
			<button
				on:click={() => {
					if (currentlySelectedMatchup > 0) {
						currentlySelectedMatchup = currentlySelectedMatchup - 1;
					}
				}}
				class="btn btn-secondary"
				type="submit">prev</button
			>
			<button
				on:click={() => {
					if (currentlySelectedMatchup + 1 < unpredictedMatchups.length) {
						currentlySelectedMatchup = currentlySelectedMatchup + 1;
					}
				}}
				class="btn btn-primary"
				type="submit">next</button
			>
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
