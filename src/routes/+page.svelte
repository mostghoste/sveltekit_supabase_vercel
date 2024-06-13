<script>
	export let data;
	$: ({ user, profile, supabase } = data);
</script>

<h1>👀 Stebėtojas</h1>
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
