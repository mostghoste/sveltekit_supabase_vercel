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


    const { data: matchups } = await supabase
    .from('matchups')
    .select('team_home, team_away, id, predictions_open, status, score_home, score_away')
    .eq('tournament_id', params.id)


    const { data: matchup_predictions } = await supabase
    .from('matchup_predictions')
    .select('matchup_id, selected_team, point_difference')
    .eq("user_id", user?.id)
    .eq('tournament_id', params.id)

    const { data: tournament_participants } = await supabase
    .from('tournament_participants')
    .select('user_id, points')
    .eq('tournament_id', params.id)

    const {data: profiles} = await supabase.from('profiles').select("username, id")

    const leaderboardData = tournament_participants?.map(participant => {
      const username = profiles?.find((profile) => {return profile.id === participant.user_id})?.username
      return {user_id: participant.user_id, points: participant.points, username}
    })

    leaderboardData?.sort((a, b) => b.points - a.points);

    return {tournament: tournament[0], tournament_participant: tournament_participant[0], matchups, matchup_predictions, tournament_participants: leaderboardData};
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
    },
    addMatchup: async ({ request, params, locals: { supabase } }) => {
      const formData = await request.formData();
      const team_home = formData.get('team_home');
      const team_away = formData.get('team_away');

      if (typeof team_home !== 'string' || typeof team_away !== 'string') {
          return { error: 'Invalid matchup data' };
      }

      const { data, error } = await supabase
          .from('matchups')
          .insert([
              { team_home, team_away, tournament_id: params.id }
          ])
          .select();

      if (error) {
          console.error("Error inserting matchup:", error);
          return { error: 'Error inserting matchup' };
      }

      return { success: true, matchup: data };
    },
    makePrediction: async ({ request, params, locals: { supabase, user } }) => {
        const formData = await request.formData();
        const matchup_id = formData.get('matchup_id');
        const selected_team = formData.get('selected_team');
        const point_difference = formData.get('point_difference');

        if (typeof matchup_id !== 'string' || typeof selected_team !== 'string' || typeof point_difference !== 'string') {
            return { error: 'Invalid prediction data' };
        }

        const { data, error } = await supabase
            .from('matchup_predictions')
            .insert([
                { user_id: user?.id, tournament_id: params.id, matchup_id, selected_team, point_difference: parseInt(point_difference, 10) }
            ])
            .select();

        if (error) {
            console.error("Error inserting prediction:", error);
            return { error: 'Error inserting prediction' };
        }

        return { success: true, prediction: data };
    },
    openPredictions: async ({ request, params, locals: { supabase } }) => {
		const formData = await request.formData();
		const selected_matchups = JSON.parse(formData.get('selected_matchups') as string);

		const { data, error } = await supabase
			.from('matchups')
			.update({ predictions_open: true })
			.in('id', selected_matchups)
			.eq('tournament_id', params.id)
			.select();

		if (error) {
			console.error('Error updating predictions status:', error);
			return { error: 'Error updating predictions status' };
		}

		return { success: true, matchups: data };
	},
	closePredictions: async ({ request, params, locals: { supabase } }) => {
		const formData = await request.formData();
		const selected_matchups = JSON.parse(formData.get('selected_matchups') as string);

		const { data, error } = await supabase
			.from('matchups')
			.update({ predictions_open: false })
			.in('id', selected_matchups)
			.eq('tournament_id', params.id)
			.select();

		if (error) {
			console.error('Error updating predictions status:', error);
			return { error: 'Error updating predictions status' };
		}

		return { success: true, matchups: data };
	}
  };