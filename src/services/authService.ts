import { supabase } from '@/lib/supabaseClient';
import type { Profile, UserRole } from '@/lib/database.types';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: UserRole; // defaults to 'client' via DB trigger
}

/**
 * Sign in with email + password.
 * Profile is loaded asynchronously by authContext via onAuthStateChange.
 */
export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

/**
 * Self-register — clients use this from the Login page.
 * role defaults to 'client' via the DB trigger handle_new_user().
 */
export async function signUp(data: SignUpData): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        phone: data.phone ?? null,
        role: data.role ?? 'client',
      },
    },
  });
  if (error) throw new Error(error.message);
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Fetch profile row for a given user ID.
 */
export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .abortSignal(AbortSignal.timeout(3000))
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

/**
 * Update the current user's own profile.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

/**
 * Admin: fetch all profiles (for user management).
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Profile[];
}

/**
 * Admin: toggle user active status.
 */
export async function setUserActive(userId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

/**
 * Admin: change a user's role.
 */
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

/** Returns role-based redirect path after login */
export function getDashboardPath(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: '/admin/dashboard',
    manager: '/manager/dashboard',
    investigator: '/investigator/dashboard',
    client: '/client/portal',
  };
  return map[role];
}
