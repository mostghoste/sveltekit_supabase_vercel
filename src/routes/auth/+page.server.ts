import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !email.includes('@')) {
      return fail(400, { email, emailError: 'Invalid email address' });
    }

    if (!password || password.length < 8) {
      return fail(400, { email, passwordError: 'Password must be at least 8 characters long' });
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error(error);
      return fail(400, { email, password, errorMessage: error.message });
    } else {
      return {success: true};
    }
  },
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !email.includes('@')) {
      return fail(400, { email, emailError: 'Invalid email address' });
    }

    if (!password || password.length < 8) {
      return fail(400, { email, passwordError: 'Password must be at least 8 characters long' });
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      return fail(400, { email, password, errorMessage: error.message });
    } else {
      return redirect(303, "/");
    }
  },
};
