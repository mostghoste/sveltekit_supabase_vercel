import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    const { data: tournaments, error } = await supabase.from('tournaments').select('*')
  
    if (error) {
      console.error("Error fetching tournaments:", error)
    }
  
    return { 
      tournaments: tournaments ?? [] 
    }
  }

export const actions: Actions = {
    addTournament: async ({ request, locals: { supabase } }) => {
      const formData = await request.formData();
      const name = formData.get('name');
  
      if (typeof name !== 'string' || name.trim().length === 0) {
        return { error: 'Invalid tournament name' };
      }
  
      const { data, error } = await supabase
        .from('tournaments')
        .insert([{ name }])
        .select();
  
      if (error) {
        console.error("Error inserting tournament:", error);
        return { error: 'Error inserting tournament' };
      }
  
      return { success: true, tournament: data };
    }
  };