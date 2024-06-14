<script lang="ts">
	import { enhance } from '$app/forms';

	export let matchups;
	export let groups;
	export let unpredictedMatchups;
	export let joinedPredictions;

	let selectedGroup;
	let selectedMatchups = [];
	let loading = false;
	let allSelected = false;
	let successSaving = false;
	let savingError = false;
	let errorMessage = '';

	function toggleMatchupSelection(id: number) {
		if (selectedMatchups.includes(id)) {
			selectedMatchups = selectedMatchups.filter((matchupId) => matchupId !== id);
		} else {
			selectedMatchups = [...selectedMatchups, id];
		}
	}

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

	$: handleGroupChange = (groupName: string) => {
		selectedGroup = groupName;
	};
</script>

<div class="bg-warning p-4 rounded-box flex flex-col gap-4 w-full">
	<span class="font-black">❗Admino įrankiai❗</span>
	<form
		use:enhance
		method="post"
		action="?/addMatchup"
		class="bg-black bg-opacity-20 rounded-box flex flex-col gap-1 p-2"
	>
		<h3>Pridėti varžybas</h3>
		<div class="flex flex-col">
			<input
				class="input input-bordered"
				type="text"
				id="team_home"
				name="team_home"
				required
				placeholder="Komanda 1"
			/>
		</div>
		<div class="flex flex-col">
			<input
				class="input input-bordered"
				type="text"
				id="team_away"
				name="team_away"
				required
				placeholder="Komanda 2"
			/>
		</div>
		<div class="flex flex-col">
			<input
				class="input input-bordered"
				bind:value={selectedGroup}
				type="text"
				name="group"
				id="group"
				placeholder="Grupė (optional)"
			/>
		</div>
		<button class="btn btn-secondary" type="submit">Pridėti</button>
	</form>
	<section
		class="bg-black bg-opacity-20 rounded-box flex flex-col gap-1 p-2 overflow-scroll max-w-80"
	>
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
			<button class="btn btn-secondary w-full" type="submit" disabled={selectedMatchups.length <= 0}
				>{#if loading}
					<p>⏳</p>
				{:else}
					<p>💾</p>
				{/if}
			</button>
		</form>
	</section>
</div>

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

	.groupContainer {
		display: flex;
		gap: 0.4rem;
	}
</style>
