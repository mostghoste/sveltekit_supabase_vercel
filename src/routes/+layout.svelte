<script>
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import '../app.css';

	export let data;
	$: ({ session, supabase, user, profile } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	$: logout = async () => {
		// console.log('Logging out');
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}
	};
</script>

<div class="flex justify-center items-center h-screen bg-primary-content">
	<main
		class="artboard phone-4 flex items-center flex-col text-center rounded-box border-primary md:border lg:border p-2 bg-neutral-content"
	>
		<header class="w-full flex justify-between items-center">
			<div class="flex gap-2">
				{#if user}
					<button class="btn btn-sm btn-primary" on:click={logout}>Atsijungti</button>
					<div class="flex flex-col items-start">
						<p class="text-xs">sveikas,</p>
						<p class="font-bold text-sm">{profile?.username}{profile?.admin ? ' (Admin)' : ''}</p>
					</div>
				{/if}
			</div>
			<nav class="w-fit">
				<div class="dropdown">
					<div tabindex="0" role="button" class="btn">
						Tema
						<svg
							width="12px"
							height="12px"
							class="h-2 w-2 fill-current opacity-60 inline-block"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 2048 2048"
							><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg
						>
					</div>
					<ul class="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52">
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
								aria-label="Default"
								value="default"
							/>
						</li>
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
								aria-label="Retro"
								value="retro"
							/>
						</li>
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
								aria-label="Cyberpunk"
								value="cyberpunk"
							/>
						</li>
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
								aria-label="Valentine"
								value="valentine"
							/>
						</li>
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
								aria-label="Aqua"
								value="aqua"
							/>
						</li>
					</ul>
				</div>
			</nav>
		</header>
		<section class="flex-grow flex justify-center flex-col prose">
			<slot></slot>
		</section>
		<footer class="text-xs text-gray-600"><p>@mostghoste 2024</p></footer>
	</main>
</div>
