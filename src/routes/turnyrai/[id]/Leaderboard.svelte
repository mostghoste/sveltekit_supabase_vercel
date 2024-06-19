<script lang="ts">
	export let tournament_participants;
	export let user;
</script>

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
