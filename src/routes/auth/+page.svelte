<script>
	export let form;
</script>

<h1>👀 Stebėtojas</h1>
<form method="POST" action="?/login" class="flex flex-col w-80 gap-1 relative">
	<label class="flex flex-col items-start">
		El. paštas
		<input
			name="email"
			type="email"
			class="input input-bordered w-full {form?.emailError ? 'border border-error' : ''}"
			value={form?.email ?? ''}
		/>
	</label>
	{#if form?.emailError}
		<span class="text-error text-sm">{form.emailError}</span>
	{/if}
	<label class="flex flex-col items-start">
		Slaptažodis
		<input
			name="password"
			type="password"
			class="input input-bordered w-full {form?.passwordError ? 'border border-error' : ''}"
		/>
	</label>
	{#if form?.passwordError}
		<span class="text-error text-sm">{form.passwordError}</span>
	{/if}
	<div class="flex gap-2 my-1 justify-end">
		<button class="btn btn-primary">Prisijungti</button>
		<button class="btn btn-secondary" formaction="?/signup">Registruotis</button>
	</div>
	{#if form?.errorMessage}
		<div role="alert" class="alert alert-error absolute w-80 -bottom-24">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>{form.errorMessage}</span>
		</div>
	{/if}
	{#if form?.success}
		<div role="alert" class="alert alert-success absolute w-80 -bottom-24">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>Pasitikrink savo el. pašto dėžutę!</span>
		</div>
	{/if}
</form>
