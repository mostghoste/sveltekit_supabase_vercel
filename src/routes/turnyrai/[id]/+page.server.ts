import type { Actions } from '@sveltejs/kit';
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
    .select('*')
    .eq('tournament_id', params.id)
    .eq('user_id', user?.id)

    const { data: tournament_participants } = await supabase
    .from('tournament_participants')
    .select('user_id, points')
    .eq('tournament_id', params.id)

    const {data: profiles} = await supabase.from('profiles').select("username, id").eq('id', user?.id)

    const leaderboardData = tournament_participants?.map(participant => {
      const username = profiles?.find((profile) => {return profile.id === participant.user_id})?.username
      return {user_id: participant.user_id, points: participant.points, username}
    })

    leaderboardData?.sort((a, b) => b.points - a.points);

    return {tournament: tournament[0], tournament_participant: tournament_participant[0], tournament_participants: leaderboardData};
}) satisfies PageServerLoad;

export const actions: Actions = {
    join: async ({params, locals: { supabase, user } }) => {
  
    const { data, error } = await supabase
    .from('tournament_participants')
    .insert([
    { user_id: user?.id, tournament_id: params.id },
    ])
    .select()

  
      if (error) {
        console.error("Error inserting tournament:", error);
        return { error: 'Error inserting tournament' };
      }
  
      return { success: true, tournament: data };
    }
  };