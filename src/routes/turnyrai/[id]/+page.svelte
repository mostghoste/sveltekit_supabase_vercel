<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ tournament, user, profile, tournament_participant, tournament_participants } = data);
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

<h2>Ateinantys žaidimai</h2>

<h2>Dalyvių taškai</h2>

{#if tournament_participants}
	<p>Dalyvių skaičius: {tournament_participants.length}</p>
	<ol>
		{#each tournament_participants as participant}
			<li>{participant.username} - {participant.points}</li>
		{/each}
	</ol>
{:else}
	<p>Dalyvių nerasta</p>
{/if}
