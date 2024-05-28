import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals: { supabase, user } }) => {

    const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id);

    if (error) {
        console.error('Error fetching tournament:', error);
        return {};
    }


    const { data: tournament_participant } = await supabase
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', params.id)
    .eq('user_id', user?.id)

  
    return {tournament: tournament[0], tournament_participant: tournament_participant[0]};
}) satisfies PageServerLoad;