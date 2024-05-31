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
    .select('team_home, team_away, id, predictions_open, status, score_home, score_away, created_at, group_id')
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


    const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq("tournament_id", params.id)


    const {data: profiles} = await supabase.from('profiles').select("username, id")

    const leaderboardData = tournament_participants?.map(participant => {
      const username = profiles?.find((profile) => {return profile.id === participant.user_id})?.username
      return {user_id: participant.user_id, points: participant.points, username}
    })

    leaderboardData?.sort((a, b) => b.points - a.points);

    return {tournament: tournament[0], tournament_participant: tournament_participant[0], matchups, matchup_predictions, tournament_participants: leaderboardData, groups};
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
        const group = formData.get('group');
    
        if (typeof team_home !== 'string' || typeof team_away !== 'string') {
            return { error: 'Invalid matchup data' };
        }
    
        console.log(group);
    
        let group_id = null;
        if (group !== "") {
            console.log("Inserting");
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .insert([{ name: group, tournament_id:params.id }])
                .select();
    
            if (groupError) {
                console.error("Error inserting group:", groupError);
                return { error: 'Error inserting group' };
            }
    
            console.log(groupData, groupError);
    
            if (groupData && groupData.length > 0) {
                group_id = groupData[0].id;
            }
        }
    
        const { data, error } = await supabase
            .from('matchups')
            .insert([
                { team_home, team_away, tournament_id: params.id, group_id }
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
        const score_home_data = formData.get('score_home');
        const home_name = formData.get('home_name');
        const away_name = formData.get('away_name');
        const score_away_data = formData.get('score_away');
        const matchup_outcome = formData.get('selected_team');

        if (
            typeof matchup_id !== 'string' ||
            typeof score_home !== 'string' ||
            typeof score_away !== 'string'
        ) {
            return { error: 'Invalid prediction data' };
        }

        if(score_home && !score_away || !score_home && score_away) {
            return { error: 'Invalid score data' };
        }

        if(Number(score_home) < 0 || Number(score_away) < 0) {
            return { error: 'No negative numbers' };
        }

        if(matchup_outcome === "tie" && score_home != score_away) {
            return { error: 'Invalid tie score data' };
        }
        else if(matchup_outcome === "home_win" && score_home <= score_away) {
            return { error: 'Invalid home win score data' };
        }
        else if (matchup_outcome === "away_win" && score_home >= score_away) {
            return { error: 'Invalid away win score data' };
        }

        let selected_team
        switch (matchup_outcome) {
            case "home_win":
                selected_team = home_name;
                break;
            case "away_win":
                selected_team = away_name;
                break;
            default:
                break;   
        }

        const score_home = score_home_data;
        const score_away = score_away_data;
    
        const point_difference = Math.abs(parseInt(score_home, 10) - parseInt(score_away, 10));
    
        const { data, error } = await supabase
            .from('matchup_predictions')
            .insert([
                {
                    user_id: user?.id,
                    tournament_id: params.id,
                    selected_team,
                    matchup_id,
                    matchup_outcome,
                    score_home: parseInt(score_home, 10),
                    score_away: parseInt(score_away, 10),
                    point_difference
                }
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
	},
	editMatchups: async ({ request, params, locals: { supabase } }) => {
		const formData = await request.formData();
		const matchups = JSON.parse(formData.get('matchups') as string);

		const updates = matchups.map((matchup: { id: string; score_home: number; score_away: number; status: string }) => ({
			id: matchup.id,
			score_home: matchup.score_home,
			score_away: matchup.score_away,
			status: matchup.status,
			team_home: matchup.team_home, // Make sure to include team_home
			team_away: matchup.team_away, // Make sure to include team_away
            predictions_open: matchup.status === "open"
		}));

		const { data, error } = await supabase
			.from('matchups')
			.upsert(updates)
			.eq('tournament_id', params.id)
			.select();

		if (error) {
			console.error('Error updating matchups:', error);
			return { error: 'Error updating matchups' };
		}

		return { success: true, matchups: data };
	}
  };