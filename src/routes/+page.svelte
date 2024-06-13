<script>
	export let data;
	$: ({ user, profile, supabase } = data);
</script>

<h1>👀 Stebėtojas</h1>
<h2 class="font-normal mt-0">
	Sveikinu atvykus į smagiausią <span class="font-bold">EURO2024</span> totalizatorių
</h2>
<div class="flex flex-col text-lg text-black mb-8">
	<div class="flex gap-2 items-center justify-center">
		<span>🎯</span>
		<p>Spėk rezultatus</p>
	</div>
	<div class="flex gap-2 items-center justify-center">
		<span>👀</span>
		<p>Stebėk turnyrinę lentelę</p>
	</div>
	<div class="flex gap-2 items-center justify-center">
		<span>🏆</span>
		<p>Laimėk neišblėstančią garbę</p>
	</div>
</div>
{#if user}
	{#if !profile?.username}
		<div>
			<p>Tu dar neturi slapyvardžio!</p>
			<p>Susikurk jį dabar!</p>
		</div>
		<form method="post" action="?/setUsername">
			<input class="input input-bordered" type="text" name="username" placeholder="Slapyvardis" />
			<button class="btn btn-primary" type="submit">Nustatyti</button>
		</form>
	{:else}
		<a class="btn btn-primary" href="/turnyrai">Turnyrai</a>
	{/if}
{:else}
	<p>Tu dar neprisijungęs!</p>
	<a class="btn btn-primary" href="/auth">Prisijungti / Registruotis</a>
{/if}
