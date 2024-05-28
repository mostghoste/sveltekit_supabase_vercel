import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
}

export const actions: Actions = {
    setUsername: async ({ request, locals: { user, supabase } }) => {
      const formData = await request.formData();
      const username = formData.get('username');

    if (typeof username !== 'string' || username?.trim().length === 0) {
        return { error: 'Invalid username' };
    }

    const { data, error } = await supabase
    .from('profiles')
    .update({ username: username })
    .eq('id', user?.id)
    .select()
  
      if (error) {
        console.error("Error changing username:", error);
        return { error: 'Error changing username' };
      }
  
      return { success: true, profile: data };
    }
  };