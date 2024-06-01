<script lang="ts">
	import { enhance } from '$app/forms';
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

	let selectedMatchups = [];
	let loading = false;

	function toggleMatchupSelection(id: number) {
		if (selectedMatchups.includes(id)) {
			selectedMatchups = selectedMatchups.filter((matchupId) => matchupId !== id);
		} else {
			selectedMatchups = [...selectedMatchups, id];
		}
	}

	let allSelected = false;

	function toggleAllMatchups() {
		if (allSelected) {
			selectedMatchups = [];
		} else {
			selectedMatchups = matchups.map((matchup) => matchup.id);
		}
		allSelected = !allSelected;
	}

	function updateField(matchupId: number, field: string, value: any) {
		const matchup = matchups.find((m) => m.id === matchupId);
		if (matchup) {
			matchup[field] = value;
		}
		matchups?.sort((a, b) => {
			a.created_at - b.created_at;
		});
	}

	function validateForm() {
		console.log('starting validation');
		let valid = true;
		matchups?.forEach((matchup) => {
			if (matchup.status === 'done') {
				if (matchup.score_home !== null && matchup.score_away !== null) {
					valid;
				} else {
					errorMessage = 'done varzybos privalo tureti taskus';
					return false;
				}
			}

			if (
				matchup.status === 'open' ||
				matchup.status === 'closed' ||
				matchup.status === 'cancelled'
			) {
				if (
					(matchup.score_home === null && matchup.score_away !== null) ||
					(matchup.score_home !== null && matchup.score_away === null)
				) {
					errorMessage = 'taskus turi tureti arba abi komandos, arba nei viena';
					return false;
				}
			}
		});
		return valid;
	}

	let successSaving = false;
	let savingError = false;
	let errorMessage = '';

	function showloader(millisec) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve('');
			}, millisec);
		});
	}

	async function handleSubmit(event: Event) {
		successSaving = false;
		loading = true;
		errorMessage = '';
		event.preventDefault();
		const validate = validateForm();
		console.log(`Form validation: ${validate}`);
		if (!validate) {
			loading = false;
			savingError = true;
			return;
		}
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const response = await fetch(form.action, {
			method: form.method,
			body: formData
		});
		const result = await response.json();
		await showloader(500);
		loading = false;
		if (result.error) {
			alert('Error: ' + result.error);
		} else {
			successSaving = true;
			setTimeout(() => {
				successSaving = false;
			}, 2000);
		}
	}

	$: selectedGroup = '';

	$: handleGroupChange = (groupName: string) => {
		selectedGroup = groupName;
	};
</script>

<h2>Turnyras</h2>
{#if tournament}
	<h1>{tournament.name}</h1>
{:else}
	<p>Turnyras nerastas</p>
{/if}

{#if profile?.admin}
	<div style="border: 1px solid black">
		<h2>Admino panelė</h2>

		<h3>Pridėti varžybas</h3>
		<form use:enhance method="post" action="?/addMatchup">
			<div>
				<label for="team_home">Komanda 1:</label>
				<input type="text" id="team_home" name="team_home" required />
			</div>
			<div>
				<label for="team_away">Komanda 2:</label>
				<input type="text" id="team_away" name="team_away" required />
			</div>
			<div>
				<label for="group">Grupė (optional):</label>
				<input
					bind:value={selectedGroup}
					type="text"
					name="group"
					id="group"
					placeholder="Nauja grupė"
				/>
			</div>
			{#if groups}
				<div class="groupContainer">
					{#each groups as group}
						<button
							on:click={() => {
								handleGroupChange(group.name);
							}}
							type="button">{group.name}</button
						>
					{/each}
				</div>
			{/if}
			<button type="submit">Pridėti</button>
		</form>

		<h3>Valdyti varžybas</h3>
		<table>
			<thead>
				<tr>
					<th><button on:click={toggleAllMatchups}>✅</button></th>
					<th>Komanda 1</th>
					<th>Komanda 2</th>
					<th>Grupė</th>
					<th>Spėjimai</th>
					<th>Statusas</th>
					<th>1 taškai</th>
					<th>2 taškai</th>
				</tr>
			</thead>
			<tbody>
				{#if matchups}
					{#each matchups as matchup}
						<tr>
							<td>
								<input
									type="checkbox"
									checked={selectedMatchups.includes(matchup.id)}
									on:change={() => toggleMatchupSelection(matchup.id)}
								/>
							</td>
							<td>{matchup.team_home}</td>
							<td>{matchup.team_away}</td>
							<td>{matchup.group_id ? matchup.group_id.name : ''}</td>
							<td>{matchup.predictions_open ? 'atidaryti' : 'uždaryti'}</td>
							<td class="center">
								<select
									bind:value={matchup.status}
									on:change={(e) => {
										updateField(matchup.id, 'status', e.target.value);
									}}
								>
									<option value="open">open</option>
									<option value="closed">closed</option>
									<option value="done">done</option>
									<option value="cancelled">cancelled</option>
								</select>
							</td>
							<td>
								<input
									class="score"
									type="number"
									name="home_score"
									placeholder={matchup.score_home || '-'}
									bind:value={matchup.score_home}
									on:input={(e) => updateScore(matchup.id, 'score_home', e.target.value)}
								/>
							</td>
							<td>
								<input
									class="score"
									type="number"
									name="away_score"
									placeholder={matchup.score_away || '-'}
									bind:value={matchup.score_away}
									on:input={(e) => updateScore(matchup.id, 'score_away', e.target.value)}
								/>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
		<form use:enhance method="post" action="?/editMatchups" on:submit={handleSubmit}>
			<input
				type="hidden"
				name="matchups"
				value={JSON.stringify(
					selectedMatchups.map((id) => {
						const matchup = matchups.find((matchup) => matchup.id === id);
						return {
							id: matchup.id,
							score_home: matchup.score_home,
							score_away: matchup.score_away,
							status: matchup.status,
							team_home: matchup.team_home,
							team_away: matchup.team_away
						};
					})
				)}
			/>
			<button
				style="width: 4rem; height: fit-content;"
				type="submit"
				disabled={selectedMatchups.length <= 0}
				>{#if loading}
					<p>⏳</p>
				{:else}
					<p>💾</p>
				{/if}
			</button>
		</form>
	</div>
{/if}

{#if tournament_participant}
	<p>Tu šiame turnyre <strong>dalyvauji</strong></p>
{:else}
	<p>Tu šiame turnyre <strong>nedalyvauji</strong></p>
	<form method="post" action="?/join">
		<button type="submit">Prisijungti</button>
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

{#if errorMessage != ''}
	<div class="clippy">
		<p class="emoji">🤓☝️</p>
	</div>
	<div class="errorMessage">
		<p>Akshually, {errorMessage}</p>
	</div>
{/if}

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
