<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ tournament } = data);
</script>

<h2>Turnyras</h2>
<h1>{tournament.name}</h1>
