<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ tournament, user, profile, tournament_participant } = data);
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
	<p>{JSON.stringify(tournament_participant)}</p>
{:else}
	<p>Tu šiame turnyre <strong>nedalyvauji</strong></p>
	<button>Prisijungti</button>
{/if}

<h2>Ateinantys žaidimai</h2>

<h2>Dalyvių taškai</h2>
