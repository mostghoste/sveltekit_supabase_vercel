<script lang="ts">
	import PredictionCard from './PredictionCard.svelte';

	let unpredictedMatchups = [];
</script>

<p>Atlikti spėjimai: 0/12</p>
<PredictionCard></PredictionCard>

<h2>Mano spėjimai</h2>
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
{/if}
