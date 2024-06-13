<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ tournaments, user, profile, supabase } = data);
</script>

<h1>🏅 Turnyrai</h1>
{#if profile?.admin}
	<div class="bg-warning p-4 rounded-box flex flex-col gap-2 w-full">
		<span class="font-black">❗Admino įrankiai❗</span>
		<form method="post" action="?/addTournament" class="flex gap-2">
			<input
				class="input input-bordered w-full"
				type="text"
				placeholder="Turnyro pavadinimas"
				name="name"
				required
			/>
			<button class="btn btn-primary" type="submit">Pridėti</button>
		</form>
	</div>
{/if}
{#if tournaments && tournaments.length > 0}
	<!-- <p>Turnyrų skaičius: {tournaments.length}</p> -->
	<section class="py-2 gap-2 flex flex-col overflow-y-scroll max-h-[33rem] min-w-[22rem]">
		{#each tournaments as tournament}
			<a class="btn btn-info w-full" href={`/turnyrai/${tournament.id}`}>{tournament.name}</a>
		{/each}
	</section>
{:else}
	<h2>🔎 Turnyrų nerasta</h2>
	<p class="text-sm">Teks palaukti kol adminas kažką sukurs 🕒</p>
	<a class="btn btn-neutral" href="/">Atgal</a>
{/if}
