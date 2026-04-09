import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../lib/types';

export async function signUp(email: string, password: string, fullName: string, role: string): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        is_active: role === 'client' ? true : false, // investigators require admin approval
      }
    }
  });
  if (error) throw new Error(error.message);
  
  // If user is returned but session is null, email confirmation is required
  if (data.user && !data.session) {
    // We rely on the UI to display the "check email" message.
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}
