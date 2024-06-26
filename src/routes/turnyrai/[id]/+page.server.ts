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
    .select('team_home, team_away, id, predictions_open, status, score_home, score_away, created_at, group_id (id, name), start_time, type, home_previous, away_previous')
    .eq('tournament_id', params.id)


    const { data: matchup_predictions } = await supabase
    .from('matchup_predictions')
    .select('matchup_id, matchup_outcome, score_home, score_away, prediction_status, points')
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

    const { data: allPredictions } = await supabase
    .from('matchup_predictions')
    .select('user_id, points')
    .eq('tournament_id', params.id)
    
    // Aggregate points for each participant
    const participantPoints = allPredictions.reduce((acc, prediction) => {
        if (prediction.points !== null) {
            if (!acc[prediction.user_id]) {
                acc[prediction.user_id] = 0;
            }
            acc[prediction.user_id] += prediction.points;
        }
        return acc;
    }, {});

    // Prepare leaderboard data
    const leaderboardData = tournament_participants.map(participant => {
        const username = profiles.find(profile => profile.id === participant.user_id)?.username || "Unknown";
        const points = participantPoints[participant.user_id] || 0;
        return { user_id: participant.user_id, points, username };
    });

    // Sort leaderboard by points
    leaderboardData.sort((a, b) => b.points - a.points);

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
        let score_home = score_home_data;
        let score_away = score_away_data;

        if (
            typeof matchup_id !== 'string' 
        ) {
            return { error: 'Invalid prediction data' };
        }

        if(score_home && !score_away || !score_home && score_away) {
            return { error: 'Invalid score data' };
        }

        if(Number(score_home) < 0 || Number(score_away) < 0) {
            return { error: 'No negative numbers' };
        }

        let selected_team
        switch (matchup_outcome) {
            case "home_win":
                selected_team = home_name;
                score_home = "1"
                score_away = "0"
                break;
            case "away_win":
                selected_team = away_name;
                score_home = "0"
                score_away = "1"
                break;
            default:
                score_home = "0"
                score_away = "0"
                break;   
        }


        if (score_home_data !== "" && score_away_data !== "") {
            score_home = score_home_data;
            score_away = score_away_data;
        }

        if(matchup_outcome === "tie" && score_home != score_away) {
            return { error: 'Invalid tie score data' };
        }
        else if(matchup_outcome === "home_win" && Number(score_home) <= Number(score_away)) {
            return { error: 'Invalid home win score data' };
        }
        else if (matchup_outcome === "away_win" && Number(score_home) >= Number(score_away)) {
            return { error: 'Invalid away win score data' };
        }
    
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
        console.log("Updating points");
    
        const calculatePoints = (matchup, prediction) => {
            if (matchup.status === "done") {
                let points = 0;

                // Get predicted outcome
                let predictedOutcome = "tie";
                if (prediction.score_home < prediction.score_away) {
                    predictedOutcome = "away_win";
                }
                else if (prediction.score_home > prediction.score_away) {
                    predictedOutcome = "home_win"
                }

                // Check if outcome was guessed correctly
                if (matchup.score_home > matchup.score_away && predictedOutcome === "home_win" || 
                    matchup.score_home < matchup.score_away && predictedOutcome === "away_win" || 
                    matchup.score_home === matchup.score_away && predictedOutcome === "tie"
                ) {
                    points = points + 1;
                    console.log("      +1 for outcome")
                }

                // Check if the exact difference between scores was guessed:
                if (matchup.score_home - matchup.score_away === prediction.score_home - prediction.score_away) {
                    points = points + 1;
                    console.log("      +1 for difference")
                }


                // Check if the exact score was guessed:
                if (matchup.score_home === prediction.score_home && matchup.score_away === prediction.score_away) {
                    points = points + 1;
                    console.log("      +1 for exact score")
                }

                // Tie modifications
                if (predictedOutcome === "tie" &&
                    matchup.score_home === matchup.score_away &&
                    !(matchup.score_home === prediction.score_home && matchup.score_away === prediction.score_away)){
                    points = points - 1;
                    console.log("      -1 for tie modifier")
                }

                return points;
                // let points = 0;
        
                // // Check if the outcome is correctly predicted
                // const predictedOutcome =
                //     (prediction.score_home > prediction.score_away && matchup.score_home > matchup.score_away) ||
                //     (prediction.score_home < prediction.score_away && matchup.score_home < matchup.score_away) ||
                //     (prediction.score_home === prediction.score_away && matchup.score_home === matchup.score_away);
        
                // if (predictedOutcome) {
                //     points += 1;
                // }
        
                // // Check if the exact score is correctly predicted
                // const exactScore =
                //     matchup.score_home === prediction.score_home &&
                //     matchup.score_away === prediction.score_away;
        
                // if (exactScore) {
                //     points += 1;
                // }
        
                // // Check if the point difference is correctly predicted
                // const predictedDifference = prediction.score_home - prediction.score_away;
                // const actualDifference = matchup.score_home - matchup.score_away;
        
                // if (predictedDifference === actualDifference && matchup.score_home != matchup.score_away) {
                //     points += 1;
                // }
        
                // return points;
            }
            return null;
        };
        
    
        try {
            const formData = await request.formData();
            const matchups = JSON.parse(formData.get('matchups'));

            const { data: matchup_predictions, error: matchup_error } = await supabase
                .from('matchup_predictions')
                .select('*')
                .eq("tournament_id", params.id);
    
            console.log(matchup_predictions);
    
            if (matchup_error) {
                console.error('Error fetching matchup predictions:', matchup_error);
                return { error: 'Error fetching matchup predictions' };
            }
    
            // For each matchup
            const updates = await Promise.all(matchups.map(async (matchup) => {
                const status = matchup.status;
                const predictions = matchup_predictions.filter(pred => pred.matchup_id === matchup.id);

                console.log(`\nMatchup: ${matchup.team_home} vs ${matchup.team_away} - Status: ${matchup.status}, Scores: ${matchup.score_home}-${matchup.score_away}`);
    
                const predictionUpdates = predictions.map(prediction => {
                    const points = (status === "done") ? calculatePoints(matchup, prediction) : null;
                    console.log(`   User: ${prediction.user_id}, Selected Team: ${prediction.selected_team}, Prediction: ${prediction.score_home}-${prediction.score_away}; Points: ${points}\n`);
                    return {
                        ...prediction,
                        points,
                        prediction_status: status
                    };
                });

                // console.log(predictionUpdates.length)
    
                // Update predictions in the database
                if (predictionUpdates.length > 0) {
                    const { error: predictionUpdateError } = await supabase
                        .from('matchup_predictions')
                        .upsert(predictionUpdates);
    
                    if (predictionUpdateError) {
                        console.error('Error updating matchup predictions:', predictionUpdateError);
                        return { error: 'Error updating matchup predictions' };
                    }
                }
    
                return {
                    id: matchup.id,
                    score_home: matchup.score_home,
                    score_away: matchup.score_away,
                    status: matchup.status,
                    team_home: matchup.team_home,
                    team_away: matchup.team_away,
                    predictions_open: matchup.status === "open"
                };
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
        } catch (error) {
            console.error('Error in editMatchups function:', error);
            return { error: 'Error processing matchups' };
        }
    }
    
    
  };