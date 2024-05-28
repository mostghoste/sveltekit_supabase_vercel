import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals: { supabase } }) => {

    const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id);

    if (error) {
        console.error('Error fetching tournament:', error);
        return {};
    }
  
    return {tournament: tournament[0]};
}) satisfies PageServerLoad;