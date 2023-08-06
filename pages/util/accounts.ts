import { supabase } from "./supabaseClient";

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'example@email.com',
      password: 'example-password',
    })
}
